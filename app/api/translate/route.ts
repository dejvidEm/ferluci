import { NextResponse } from "next/server"

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

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const texts = body?.texts
    if (!Array.isArray(texts) || texts.some((t: unknown) => typeof t !== "string")) {
      return NextResponse.json({ error: "Invalid body: texts[] required" }, { status: 400 })
    }
    if (texts.length === 0) {
      return NextResponse.json({ translations: [] as string[] })
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
      return NextResponse.json({
        translations: texts,
        fallback: true as const,
        message: "DEEPL_AUTH_KEY not set — returning source text",
      })
    }

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
      const errText = await res.text()
      console.error("[translate] DeepL error:", res.status, errText)
      return NextResponse.json(
        { error: "Translation failed", translations: texts, fallback: true as const },
        { status: 200 }
      )
    }

    const data = (await res.json()) as {
      translations?: Array<{ text: string }>
    }
    const out = data.translations?.map((x) => x.text) ?? []
    if (out.length !== texts.length) {
      return NextResponse.json({ translations: texts, fallback: true as const })
    }

    return NextResponse.json({ translations: out })
  } catch (e) {
    console.error("[translate]", e)
    return NextResponse.json({ error: "Bad request" }, { status: 400 })
  }
}
