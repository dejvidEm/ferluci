import crypto from "crypto"
import { getUpstashRedis } from "./upstash-redis"

const MUX_API = "https://api.mux.com/video/v1"
const REDIS_PB = "g:mux:pb"
const REDIS_AS = "g:mux:as"

export function muxGalleryConfigured(): boolean {
  return Boolean(process.env.MUX_TOKEN_ID?.trim() && process.env.MUX_SECRET_KEY?.trim())
}

export function hashGallerySourceUrl(url: string): string {
  return crypto.createHash("sha256").update(url).digest("hex")
}

/** Only Sanity CDN URLs — prevents abusing your Mux account with arbitrary URLs. */
export function isAllowedGalleryVideoUrl(url: string): boolean {
  try {
    const u = new URL(url)
    if (u.protocol !== "https:") return false
    const h = u.hostname.toLowerCase()
    return h.endsWith(".sanity.io") || h === "cdn.sanity.io"
  } catch {
    return false
  }
}

type MuxAssetData = {
  id?: string
  status?: string
  playback_ids?: Array<{ id?: string; policy?: string }>
  errors?: { messages?: string[] }
}

function parseMuxJson(text: string): { data?: MuxAssetData } | MuxAssetData {
  try {
    const j = JSON.parse(text) as { data?: MuxAssetData } & MuxAssetData
    if (j && typeof j === "object" && "data" in j && j.data) return { data: j.data }
    return j as MuxAssetData
  } catch {
    return {}
  }
}

function publicPlaybackId(asset: MuxAssetData): string | null {
  const ids = asset.playback_ids
  if (!ids?.length) return null
  const pub = ids.find((p) => p.policy === "public" && p.id)
  return pub?.id ?? ids[0]?.id ?? null
}

async function muxAuthFetch(path: string, init?: RequestInit): Promise<Response> {
  const id = process.env.MUX_TOKEN_ID!.trim()
  const secret = process.env.MUX_SECRET_KEY!.trim()
  const auth = Buffer.from(`${id}:${secret}`).toString("base64")
  return fetch(`${MUX_API}${path}`, {
    ...init,
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
      ...(init?.headers as Record<string, string>),
    },
  })
}

async function createAssetFromUrl(sourceUrl: string): Promise<{ assetId: string } | { error: string }> {
  const res = await muxAuthFetch("/assets", {
    method: "POST",
    body: JSON.stringify({
      inputs: [{ url: sourceUrl }],
      playback_policies: ["public"],
      video_quality: "basic",
      meta: { title: "Gallery (Sanity)" },
    }),
  })
  const raw = await res.text()
  const parsed = parseMuxJson(raw)
  const data = "data" in parsed && parsed.data ? parsed.data : (parsed as MuxAssetData)
  if (!res.ok) {
    return { error: data?.errors?.messages?.join("; ") || raw.slice(0, 200) || `Mux ${res.status}` }
  }
  const assetId = data?.id
  if (!assetId) return { error: "Mux: missing asset id" }
  return { assetId }
}

async function fetchAsset(assetId: string): Promise<MuxAssetData | null> {
  const res = await muxAuthFetch(`/assets/${encodeURIComponent(assetId)}`)
  const raw = await res.text()
  if (!res.ok) return null
  const parsed = parseMuxJson(raw)
  const data = "data" in parsed && parsed.data ? parsed.data : (parsed as MuxAssetData)
  return data || null
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}

const POLL_MS = 2000
const POLL_ATTEMPTS = 25

export type GalleryMuxResolve =
  | { status: "ready"; playbackId: string }
  | { status: "processing" }
  | { status: "error"; message: string }
  | { status: "fallback" }

/**
 * Resolve Sanity video URL → Mux public playback id (Redis cache + ingest).
 * Used only by /api/gallery/mux and /gallery page.
 */
export async function resolveGalleryMuxPlayback(sourceUrl: string): Promise<GalleryMuxResolve> {
  if (!muxGalleryConfigured()) {
    return { status: "fallback" }
  }
  if (!isAllowedGalleryVideoUrl(sourceUrl)) {
    return { status: "error", message: "Invalid video URL" }
  }

  const h = hashGallerySourceUrl(sourceUrl)
  const redis = getUpstashRedis()

  if (redis) {
    const cached = await redis.get<string>(`${REDIS_PB}:${h}`)
    if (cached && typeof cached === "string" && cached.length > 0) {
      return { status: "ready", playbackId: cached }
    }
    const pendingId = await redis.get<string>(`${REDIS_AS}:${h}`)
    if (pendingId && typeof pendingId === "string") {
      const asset = await fetchAsset(pendingId)
      if (!asset) {
        return { status: "processing" }
      }
      if (asset.status === "errored") {
        await redis.del(`${REDIS_AS}:${h}`)
        const msg = asset.errors?.messages?.join("; ") || "Mux asset errored"
        return { status: "error", message: msg }
      }
      if (asset.status === "ready") {
        const pb = publicPlaybackId(asset)
        if (pb) {
          await redis.set(`${REDIS_PB}:${h}`, pb)
          await redis.del(`${REDIS_AS}:${h}`)
          return { status: "ready", playbackId: pb }
        }
        await redis.del(`${REDIS_AS}:${h}`)
        return { status: "error", message: "Mux: no playback id" }
      }
      return { status: "processing" }
    }
  }

  const created = await createAssetFromUrl(sourceUrl)
  if ("error" in created) {
    return { status: "error", message: created.error }
  }

  if (redis) {
    await redis.set(`${REDIS_AS}:${h}`, created.assetId, { ex: 86400 * 7 })
  }

  let asset = await fetchAsset(created.assetId)
  for (let i = 0; i < POLL_ATTEMPTS && asset; i++) {
    if (asset.status === "ready") {
      const pb = publicPlaybackId(asset)
      if (pb && redis) {
        await redis.set(`${REDIS_PB}:${h}`, pb)
        await redis.del(`${REDIS_AS}:${h}`)
      }
      if (pb) return { status: "ready", playbackId: pb }
      return { status: "error", message: "Mux: ready but no playback id" }
    }
    if (asset.status === "errored") {
      if (redis) await redis.del(`${REDIS_AS}:${h}`)
      return {
        status: "error",
        message: asset.errors?.messages?.join("; ") || "Mux asset errored",
      }
    }
    await sleep(POLL_MS)
    asset = await fetchAsset(created.assetId)
  }

  return { status: "processing" }
}
