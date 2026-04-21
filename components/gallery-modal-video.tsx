"use client"

import { useEffect, useState } from "react"
import Image from "next/image"

type Props = {
  videoUrl: string
  poster?: string
  posterAlt: string
}

/**
 * Waits two animation frames before mounting <video> so the dialog can paint first
 * (less main-thread contention with Radix overlay). Keeps autoplay-friendly timing vs long setTimeout.
 */
export default function GalleryModalVideo({ videoUrl, poster, posterAlt }: Props) {
  const [mountVideo, setMountVideo] = useState(false)

  useEffect(() => {
    let cancelled = false
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (!cancelled) setMountVideo(true)
      })
    })
    return () => {
      cancelled = true
      cancelAnimationFrame(id)
    }
  }, [videoUrl])

  if (!mountVideo) {
    return (
      <div className="relative mx-auto flex h-[min(50dvh,420px)] w-full max-w-5xl items-center justify-center">
        {poster ? (
          <Image
            src={poster}
            alt={posterAlt}
            fill
            className="object-contain"
            sizes="100vw"
            priority
          />
        ) : (
          <div className="h-36 w-3/4 max-w-md animate-pulse rounded-lg bg-neutral-800" aria-hidden />
        )}
      </div>
    )
  }

  return (
    <video
      src={videoUrl}
      poster={poster}
      controls
      autoPlay
      playsInline
      preload="auto"
      className="max-h-[min(85dvh,900px)] max-w-full object-contain [transform:translateZ(0)]"
    />
  )
}
