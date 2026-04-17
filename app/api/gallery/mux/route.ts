import { NextRequest, NextResponse } from "next/server"
import {
  isAllowedGalleryVideoUrl,
  muxGalleryConfigured,
  resolveGalleryMuxPlayback,
} from "@/lib/server/mux-gallery"

export const runtime = "nodejs"
export const maxDuration = 120

/**
 * GET ?url=encodeURIComponent(sanityVideoUrl)
 * Returns Mux playback id for /gallery only. Sanity remains source of truth for uploads.
 */
export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url")
  if (!url) {
    return NextResponse.json({ error: "Missing url" }, { status: 400 })
  }
  let decoded: string
  try {
    decoded = decodeURIComponent(url)
  } catch {
    return NextResponse.json({ error: "Invalid url encoding" }, { status: 400 })
  }
  if (!isAllowedGalleryVideoUrl(decoded)) {
    return NextResponse.json({ error: "URL not allowed" }, { status: 403 })
  }

  if (!muxGalleryConfigured()) {
    return NextResponse.json({ status: "fallback", playbackId: null as string | null })
  }

  try {
    const result = await resolveGalleryMuxPlayback(decoded)
    if (result.status === "ready") {
      return NextResponse.json(
        { status: "ready", playbackId: result.playbackId },
        { headers: { "Cache-Control": "private, max-age=60" } }
      )
    }
    if (result.status === "processing") {
      return NextResponse.json(
        { status: "processing", playbackId: null },
        { status: 202, headers: { "Cache-Control": "no-store" } }
      )
    }
    if (result.status === "fallback") {
      return NextResponse.json({ status: "fallback", playbackId: null })
    }
    return NextResponse.json(
      { status: "error", message: result.message, playbackId: null },
      { status: 502 }
    )
  } catch (e) {
    console.error("[gallery/mux]", e)
    return NextResponse.json({ status: "error", message: "Mux resolve failed" }, { status: 500 })
  }
}
