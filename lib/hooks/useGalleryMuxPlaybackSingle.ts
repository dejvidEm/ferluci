"use client"

import { useEffect, useState } from "react"

export type GalleryMuxPlaybackState =
  | { mode: "pending" }
  | { mode: "mux"; playbackId: string }
  | { mode: "sanity" }

const POLL_MS = 2500
const MAX_ATTEMPTS = 80

/**
 * Resolves one Sanity video URL → Mux playback id only when invoked (e.g. modal open).
 * Use with a keyed component so each open starts in `pending` without eager gallery-wide fetches.
 */
export function useGalleryMuxPlaybackSingle(videoUrl: string): GalleryMuxPlaybackState {
  const [state, setState] = useState<GalleryMuxPlaybackState>({ mode: "pending" })

  useEffect(() => {
    const ac = new AbortController()

    async function run() {
      for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
        if (ac.signal.aborted) return
        let res: Response
        try {
          res = await fetch(`/api/gallery/mux?url=${encodeURIComponent(videoUrl)}`, {
            signal: ac.signal,
            cache: "no-store",
          })
        } catch {
          if (!ac.signal.aborted) setState({ mode: "sanity" })
          return
        }

        let data: { status?: string; playbackId?: string | null; message?: string }
        try {
          data = (await res.json()) as typeof data
        } catch {
          if (!ac.signal.aborted) setState({ mode: "sanity" })
          return
        }

        if (ac.signal.aborted) return

        if (data.status === "ready" && data.playbackId) {
          setState({ mode: "mux", playbackId: data.playbackId })
          return
        }

        if (data.status === "fallback") {
          setState({ mode: "sanity" })
          return
        }

        if (res.status === 202 && data.status === "processing") {
          await new Promise((r) => setTimeout(r, POLL_MS))
          continue
        }

        if (res.status === 403 || res.status === 400) {
          setState({ mode: "sanity" })
          return
        }

        if (data.status === "error" || res.status === 502 || res.status === 500) {
          setState({ mode: "sanity" })
          return
        }

        await new Promise((r) => setTimeout(r, POLL_MS))
      }

      setState({ mode: "sanity" })
    }

    void run()
    return () => ac.abort()
  }, [videoUrl])

  return state
}
