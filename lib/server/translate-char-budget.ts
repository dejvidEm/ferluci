import { getUpstashRedis } from "./upstash-redis"

const REDIS_KEY = "translate:global-chars-total"

/** Celkový počet znakov (vstup SK) od začiatku; default 480 000. 0 = limit vypnutý. */
export function getGlobalCharCap(): number {
  const v = process.env.TRANSLATE_GLOBAL_CHAR_CAP?.trim()
  if (v === "" || v === undefined) return 480_000
  const n = parseInt(v, 10)
  return Number.isFinite(n) && n >= 0 ? n : 480_000
}

const RESERVE_LUA = `
local key = KEYS[1]
local add = tonumber(ARGV[1])
local cap = tonumber(ARGV[2])
if add == nil or cap == nil or add < 0 then return -2 end
local cur = tonumber(redis.call("GET", key) or "0")
if cur + add > cap then
  return -1
end
return redis.call("INCRBY", key, add)
`

const REFUND_LUA = `
local key = KEYS[1]
local sub = tonumber(ARGV[1])
if sub == nil or sub < 0 then return 0 end
local cur = tonumber(redis.call("GET", key) or "0")
redis.call("SET", key, math.max(0, cur - sub))
return 1
`

/** In-memory len ak chýba Redis (dev); nie je zdieľané medzi inštanciami. */
let memoryCharsUsed = 0

export type ReserveGlobalCharsResult =
  | { ok: true; totalAfter: number; backend: "redis" | "memory" }
  | { ok: false; used: number; cap: number; backend: "redis" | "memory" }

/**
 * Atomicky rezervuje znakový rozpočet pred volaním DeepL.
 * Pri chybe API zavolaj `refundGlobalChars`.
 */
export async function reserveGlobalChars(charCount: number): Promise<ReserveGlobalCharsResult> {
  const cap = getGlobalCharCap()
  if (cap === 0 || charCount <= 0) {
    return { ok: true, totalAfter: 0, backend: "memory" }
  }

  const redis = getUpstashRedis()
  if (redis) {
    const raw = await redis.eval(RESERVE_LUA, [REDIS_KEY], [String(charCount), String(cap)])
    const n = Number(raw)
    if (n === -2) {
      return { ok: false, used: 0, cap, backend: "redis" }
    }
    if (n === -1) {
      const usedRaw = await redis.get<string>(REDIS_KEY)
      const used = Math.max(0, parseInt(String(usedRaw ?? "0"), 10) || 0)
      return { ok: false, used, cap, backend: "redis" }
    }
    return { ok: true, totalAfter: n, backend: "redis" }
  }

  if (process.env.NODE_ENV === "production") {
    console.warn(
      "[translate-char-budget] UPSTASH_REDIS_* missing — global lifetime character cap uses in-memory counter only (not shared across instances)."
    )
  }

  if (memoryCharsUsed + charCount > cap) {
    return { ok: false, used: memoryCharsUsed, cap, backend: "memory" }
  }
  memoryCharsUsed += charCount
  return { ok: true, totalAfter: memoryCharsUsed, backend: "memory" }
}

export async function refundGlobalChars(charCount: number): Promise<void> {
  if (charCount <= 0) return
  const cap = getGlobalCharCap()
  if (cap === 0) return

  const redis = getUpstashRedis()
  if (redis) {
    await redis.eval(REFUND_LUA, [REDIS_KEY], [String(charCount)])
    return
  }
  memoryCharsUsed = Math.max(0, memoryCharsUsed - charCount)
}
