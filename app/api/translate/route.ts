import { NextResponse } from "next/server"
import {
  contentLengthTooLarge,
  enforceTranslateRateLimit,
  TRANSLATE_MAX_BODY_BYTES,
} from "@/lib/server/rate-limit-translate"
import {
  getGlobalCharCap,
  refundGlobalChars,
  reserveGlobalChars,
} from "@/lib/server/translate-char-budget"

export const runtime = "nodejs"

/** DeepL: https://www.deepl.com/pro-api — set DEEPL_AUTH_KEY in .env.local (Free uses api-free host). */
const MAX_TEXTS = 80
const MAX_TOTAL_CHARS = 120_000

function getDeepLBaseUrl(): string {
  const fromEnv = process.env.DEEPL_API_URL?.trim()
  if (fromEnv) return fromEnv.replace(/\/$/, "")
  return process.env.DEEPL_USE_PRO === "1"
    ? "https://api.deepl.com"
    : "https://api-free.deepl.com"
}

function mergeHeaders(base: Headers, extra?: Record<string, string>): Headers {
  const h = new Headers(base)
  if (extra) {
    for (const [k, v] of Object.entries(extra)) h.set(k, v)
  }
  return h
}

/** Crawlers / scanners: only POST is allowed. */
export async function GET() {
  return new NextResponse(null, {
    status: 405,
    headers: { Allow: "POST", "Cache-Control": "no-store" },
  })
}

export async function HEAD() {
  return new NextResponse(null, {
    status: 405,
    headers: { Allow: "POST", "Cache-Control": "no-store" },
  })
}

export async function POST(req: Request) {
  const limited = await enforceTranslateRateLimit(req)
  if (!limited.ok) {
    return limited.response
  }
  const rateHeaders = limited.responseHeaders

  if (contentLengthTooLarge(req)) {
    return NextResponse.json(
      {
        error: "Payload too large",
        maxBytes: TRANSLATE_MAX_BODY_BYTES,
      },
      { status: 413, headers: { "Cache-Control": "no-store" } }
    )
  }

  let reservedChars = 0

  try {
    const body = await req.json()
    const texts = body?.texts
    if (!Array.isArray(texts) || texts.some((t: unknown) => typeof t !== "string")) {
      return NextResponse.json({ error: "Invalid body: texts[] required" }, { status: 400 })
    }
    if (texts.length === 0) {
      return NextResponse.json({ translations: [] as string[] }, { headers: rateHeaders })
    }
    if (texts.length > MAX_TEXTS) {
      return NextResponse.json({ error: "Too many segments" }, { status: 400 })
    }
    const total = texts.reduce((n, t) => n + t.length, 0)
    if (total > MAX_TOTAL_CHARS) {
      return NextResponse.json({ error: "Payload too large" }, { status: 400 })
    }

    const authKey = process.env.DEEPL_AUTH_KEY?.trim()
    if (!authKey) {
      return NextResponse.json(
        {
          translations: texts,
          fallback: true as const,
          message: "DEEPL_AUTH_KEY not set — returning source text",
        },
        { headers: rateHeaders }
      )
    }

    const cap = getGlobalCharCap()
    const budget = await reserveGlobalChars(total)
    if (!budget.ok) {
      const remaining = Math.max(0, budget.cap - budget.used)
      return NextResponse.json(
        {
          error: "Celkový limit preložených znakov je vyčerpaný.",
          code: "GLOBAL_CHAR_CAP" as const,
          used: budget.used,
          cap: budget.cap,
          remaining,
        },
        {
          status: 429,
          headers: mergeHeaders(rateHeaders, {
            "Cache-Control": "no-store",
            "Retry-After": "86400",
          }),
        }
      )
    }
    reservedChars = total

    const globalMeta =
      cap > 0
        ? {
            "X-Translate-Global-Cap": String(cap),
            "X-Translate-Global-Used-After": String(budget.totalAfter),
            "X-Translate-Global-Remaining": String(Math.max(0, cap - budget.totalAfter)),
          }
        : undefined

    const url = `${getDeepLBaseUrl()}/v2/translate`
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `DeepL-Auth-Key ${authKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: texts,
        source_lang: "SK",
        target_lang: "EN",
      }),
    })

    if (!res.ok) {
      await refundGlobalChars(reservedChars)
      reservedChars = 0
      const errText = await res.text()
      console.error("[translate] DeepL error:", res.status, errText)
      return NextResponse.json(
        { error: "Translation failed", translations: texts, fallback: true as const },
        { status: 200, headers: mergeHeaders(rateHeaders, globalMeta) }
      )
    }

    const data = (await res.json()) as {
      translations?: Array<{ text: string }>
    }
    const out = data.translations?.map((x) => x.text) ?? []
    if (out.length !== texts.length) {
      await refundGlobalChars(reservedChars)
      reservedChars = 0
      return NextResponse.json(
        { translations: texts, fallback: true as const },
        { headers: mergeHeaders(rateHeaders, globalMeta) }
      )
    }

    reservedChars = 0
    return NextResponse.json(
      { translations: out },
      { headers: mergeHeaders(rateHeaders, globalMeta) }
    )
  } catch (e) {
    if (reservedChars > 0) {
      await refundGlobalChars(reservedChars)
    }
    console.error("[translate]", e)
    return NextResponse.json({ error: "Bad request" }, { status: 400 })
  }
}
