import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"
import { NextResponse } from "next/server"

/** Max JSON body before parse (bytes) — stops huge payload DoS. */
export const TRANSLATE_MAX_BODY_BYTES = 512 * 1024

/** Redis (Upstash): requests per IP per rolling minute — default prísnejší. */
const RPM = () => Math.max(3, parseInt(process.env.RATE_LIMIT_TRANSLATE_RPM || "6", 10))
/** Redis: requests per IP per rolling hour. */
const RPH = () => Math.max(12, parseInt(process.env.RATE_LIMIT_TRANSLATE_RPH || "48", 10))
/** Pamäťový fallback: prísnejší ako Redis, aby zneužitie jednej inštancie bolo ťažšie. */
const MEM_RPM = () => Math.max(2, parseInt(process.env.RATE_LIMIT_TRANSLATE_MEM_RPM || "4", 10))
const MEM_RPH = () => Math.max(10, parseInt(process.env.RATE_LIMIT_TRANSLATE_MEM_RPH || "28", 10))

let redisMinute: Ratelimit | null | undefined
let redisHour: Ratelimit | null | undefined
let redisUnknown: Ratelimit | null | undefined

function getRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL?.trim()
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim()
  if (!url || !token) return null
  return new Redis({ url, token })
}

function getUpstashLimiters() {
  if (redisMinute !== undefined) {
    return redisMinute && redisHour && redisUnknown
      ? { minute: redisMinute, hour: redisHour, unknown: redisUnknown }
      : null
  }
  const redis = getRedis()
  if (!redis) {
    redisMinute = null
    redisHour = null
    redisUnknown = null
    return null
  }
  redisMinute = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(RPM(), "60 s"),
    prefix: "translate:rpm",
    analytics: true,
  })
  redisHour = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(RPH(), "1 h"),
    prefix: "translate:rph",
    analytics: true,
  })
  redisUnknown = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(3, "60 s"),
    prefix: "translate:unk",
    analytics: true,
  })
  return { minute: redisMinute, hour: redisHour, unknown: redisUnknown }
}

/**
 * Client IP for rate limiting (Vercel / proxies / Cloudflare).
 * Never trust x-forwarded-for fully — but for abuse throttling it is the standard signal.
 */
export function getClientIp(req: Request): string {
  const h = req.headers
  const cf = h.get("cf-connecting-ip")?.trim()
  if (cf && isSafeIpToken(cf)) return cf.slice(0, 64)
  const vercel = h.get("x-vercel-forwarded-for")?.trim()
  if (vercel) {
    const first = vercel.split(",")[0]?.trim()
    if (first && isSafeIpToken(first)) return first.slice(0, 64)
  }
  const xff = h.get("x-forwarded-for")?.trim()
  if (xff) {
    const first = xff.split(",")[0]?.trim()
    if (first && isSafeIpToken(first)) return first.slice(0, 64)
  }
  const real = h.get("x-real-ip")?.trim()
  if (real && isSafeIpToken(real)) return real.slice(0, 64)
  return "unknown"
}

function isSafeIpToken(s: string): boolean {
  if (s.length > 128) return false
  return /^[\d.a-fA-F:%,\s-]+$/.test(s) || /^[a-zA-Z0-9:._%-]+$/.test(s)
}

/* ---------- In-memory sliding window (dev / fallback; not consistent across serverless instances) ---------- */

const memTimestamps = new Map<string, number[]>()
let memPruneCounter = 0

function memoryRateLimit(id: string): { ok: true } | { ok: false; retryAfterSec: number } {
  const now = Date.now()
  const hourMs = 3600_000
  const minuteMs = 60_000

  let ts = memTimestamps.get(id) ?? []
  ts = ts.filter((t) => now - t < hourMs)

  const inHour = ts.filter((t) => now - t < hourMs)
  const inMinute = ts.filter((t) => now - t < minuteMs)

  if (inHour.length >= MEM_RPH()) {
    const oldest = Math.min(...inHour)
    memTimestamps.set(id, ts)
    return {
      ok: false,
      retryAfterSec: Math.max(1, Math.ceil((hourMs - (now - oldest)) / 1000)),
    }
  }
  if (inMinute.length >= MEM_RPM()) {
    const sorted = [...inMinute].sort((a, b) => a - b)
    const oldestM = sorted[0] ?? now
    memTimestamps.set(id, ts)
    return {
      ok: false,
      retryAfterSec: Math.max(1, Math.ceil((minuteMs - (now - oldestM)) / 1000)),
    }
  }

  ts.push(now)
  memTimestamps.set(id, ts)

  memPruneCounter++
  if (memPruneCounter % 200 === 0 && memTimestamps.size > 15_000) {
    memPruneCounter = 0
    for (const [k, v] of memTimestamps) {
      const pruned = v.filter((t) => now - t < hourMs)
      if (pruned.length === 0) memTimestamps.delete(k)
      else memTimestamps.set(k, pruned)
    }
  }

  return { ok: true }
}

function rateLimitResponse(retryAfterSec: number, resetMs?: number): NextResponse {
  const headers = new Headers()
  headers.set("Retry-After", String(retryAfterSec))
  if (resetMs) headers.set("X-RateLimit-Reset", String(Math.ceil(resetMs / 1000)))
  headers.set("X-RateLimit-Policy", "sliding-window")
  headers.set("Cache-Control", "no-store")
  return NextResponse.json(
    { error: "Too many translation requests. Please try again later.", code: "RATE_LIMITED" },
    { status: 429, headers }
  )
}

export type TranslateRateLimitOk = {
  ok: true
  /** Merge into successful JSON responses */
  responseHeaders: Headers
}

export type TranslateRateLimitDenied = { ok: false; response: NextResponse }

/**
 * Enforce per-IP limits before calling DeepL. Prefer Upstash on Vercel (set UPSTASH_REDIS_REST_*).
 */
export async function enforceTranslateRateLimit(req: Request): Promise<TranslateRateLimitOk | TranslateRateLimitDenied> {
  const ip = getClientIp(req)
  const id = ip === "unknown" ? `unk:${hashId(req)}` : ip

  const upstash = getUpstashLimiters()
  if (upstash) {
    const limiters =
      ip === "unknown"
        ? [upstash.unknown.limit(id)]
        : [upstash.minute.limit(id), upstash.hour.limit(id)]

    const results = await Promise.all(limiters)
    const failed = results.find((r) => !r.success)
    if (failed) {
      const retrySec = Math.max(1, Math.ceil((failed.reset - Date.now()) / 1000))
      return { ok: false, response: rateLimitResponse(retrySec, failed.reset) }
    }

    const primary = results[0]!
    const headers = new Headers()
    headers.set("X-RateLimit-Limit", String(primary.limit))
    headers.set("X-RateLimit-Remaining", String(primary.remaining))
    headers.set("X-RateLimit-Reset", String(Math.ceil(primary.reset / 1000)))
    return { ok: true, responseHeaders: headers }
  }

  if (process.env.NODE_ENV === "production") {
    console.warn(
      "[rate-limit-translate] UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN not set — using in-memory limiter (not reliable across many Vercel instances)."
    )
  }

  const mem = memoryRateLimit(id)
  if (!mem.ok) {
    return { ok: false, response: rateLimitResponse(mem.retryAfterSec) }
  }
  const headers = new Headers()
  headers.set("X-RateLimit-Policy", "memory-fallback")
  return { ok: true, responseHeaders: headers }
}

function hashId(req: Request): string {
  const ua = req.headers.get("user-agent") ?? ""
  let h = 0
  const s = ua.slice(0, 120)
  for (let i = 0; i < s.length; i++) h = Math.imul(31, h) + s.charCodeAt(i)
  return (h >>> 0).toString(36)
}

/** Reject oversized bodies before JSON.parse */
export function contentLengthTooLarge(req: Request): boolean {
  const raw = req.headers.get("content-length")
  if (!raw) return false
  const n = parseInt(raw, 10)
  if (Number.isNaN(n)) return true
  return n > TRANSLATE_MAX_BODY_BYTES
}
