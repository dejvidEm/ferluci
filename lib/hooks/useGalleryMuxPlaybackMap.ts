"use client"

import { useEffect, useState, useMemo } from "react"
import type { GalleryImage } from "@/lib/sanity/utils"

export type GalleryMuxEntry =
  | { mode: "pending" }
  | { mode: "mux"; playbackId: string }
  | { mode: "sanity" }

const POLL_MS = 2500
const MAX_ATTEMPTS = 80

/**
 * For each gallery video URL, resolves Mux playback id via /api/gallery/mux (polls while processing).
 * Falls back to direct Sanity URL playback when Mux is unavailable or errors.
 */
export function useGalleryMuxPlaybackMap(galleryImages: GalleryImage[]): Record<string, GalleryMuxEntry> {
  const videoKey = useMemo(() => {
    return galleryImages
      .filter((i) => i.type === "video" && i.videoUrl)
      .map((i) => `${i.id}\0${i.videoUrl}`)
      .sort()
      .join("\n")
  }, [galleryImages])

  const [map, setMap] = useState<Record<string, GalleryMuxEntry>>({})

  useEffect(() => {
    if (!videoKey) return

    const ac = new AbortController()
    const entries = videoKey.split("\n").filter(Boolean)

    async function resolveOne(id: string, videoUrl: string) {
      setMap((prev) => ({ ...prev, [id]: { mode: "pending" } }))

      for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
        if (ac.signal.aborted) return
        let res: Response
        try {
          res = await fetch(
            `/api/gallery/mux?url=${encodeURIComponent(videoUrl)}`,
            { signal: ac.signal, cache: "no-store" }
          )
        } catch {
          if (!ac.signal.aborted) {
            setMap((prev) => ({ ...prev, [id]: { mode: "sanity" } }))
          }
          return
        }

        let data: { status?: string; playbackId?: string | null; message?: string }
        try {
          data = (await res.json()) as typeof data
        } catch {
          setMap((prev) => ({ ...prev, [id]: { mode: "sanity" } }))
          return
        }

        if (ac.signal.aborted) return

        if (data.status === "ready" && data.playbackId) {
          setMap((prev) => ({ ...prev, [id]: { mode: "mux", playbackId: data.playbackId! } }))
          return
        }

        if (data.status === "fallback") {
          setMap((prev) => ({ ...prev, [id]: { mode: "sanity" } }))
          return
        }

        if (res.status === 202 && data.status === "processing") {
          await new Promise((r) => setTimeout(r, POLL_MS))
          continue
        }

        if (res.status === 403 || res.status === 400) {
          setMap((prev) => ({ ...prev, [id]: { mode: "sanity" } }))
          return
        }

        if (data.status === "error" || res.status === 502 || res.status === 500) {
          setMap((prev) => ({ ...prev, [id]: { mode: "sanity" } }))
          return
        }

        await new Promise((r) => setTimeout(r, POLL_MS))
      }

      setMap((prev) => ({ ...prev, [id]: { mode: "sanity" } }))
    }

    for (const line of entries) {
      const sep = line.indexOf("\0")
      if (sep === -1) continue
      const id = line.slice(0, sep)
      const videoUrl = line.slice(sep + 1)
      void resolveOne(id, videoUrl)
    }

    return () => ac.abort()
  }, [videoKey])

  return map
}
