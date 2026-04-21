"use client"

import Image from "next/image"
import { useCallback, useEffect, useRef, useState } from "react"

const MAX_CONCURRENT = 2
let activeLoads = 0
const pendingGrants: Array<() => void> = []

function acquireSlot(): Promise<void> {
  return new Promise((resolve) => {
    const grant = () => {
      activeLoads++
      resolve()
    }
    if (activeLoads < MAX_CONCURRENT) {
      grant()
    } else {
      pendingGrants.push(grant)
    }
  })
}

function releaseSlot() {
  activeLoads = Math.max(0, activeLoads - 1)
  const next = pendingGrants.shift()
  if (next) next()
}

function seekTimeForPoster(video: HTMLVideoElement): number {
  const d = video.duration
  if (!Number.isFinite(d) || d <= 0) return 0.1
  const early = Math.max(0.05, d * 0.02)
  const target = Math.min(1, early)
  return Math.min(target, Math.max(0.05, d - 0.02))
}

type Props = {
  thumbnail?: string
  videoUrl: string
  alt: string
  sizes: string
  imageClassName: string
}

export default function GalleryVideoThumbnail({
  thumbnail,
  videoUrl,
  alt,
  sizes,
  imageClassName,
}: Props) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const oweSlot = useRef(false)

  const [inView, setInView] = useState(false)
  const [loadVideo, setLoadVideo] = useState(false)
  const [frameReady, setFrameReady] = useState(false)
  const [useFallbackImage, setUseFallbackImage] = useState(false)

  const freeSlot = useCallback(() => {
    if (!oweSlot.current) return
    oweSlot.current = false
    releaseSlot()
  }, [])

  useEffect(() => {
    if (thumbnail) return
    const root = wrapRef.current
    if (!root) return

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setInView(true)
          io.disconnect()
        }
      },
      { rootMargin: "180px", threshold: 0.01 }
    )
    io.observe(root)
    return () => io.disconnect()
  }, [thumbnail])

  useEffect(() => {
    if (thumbnail || !inView || loadVideo) return

    let cancelled = false

    ;(async () => {
      await acquireSlot()
      if (cancelled) {
        releaseSlot()
        return
      }
      oweSlot.current = true
      setLoadVideo(true)
    })()

    return () => {
      cancelled = true
    }
  }, [thumbnail, inView, loadVideo])

  useEffect(() => {
    return () => {
      freeSlot()
    }
  }, [freeSlot])

  useEffect(() => {
    if (!loadVideo || frameReady || useFallbackImage) return

    const t = window.setTimeout(() => {
      setUseFallbackImage(true)
      freeSlot()
    }, 15000)

    return () => clearTimeout(t)
  }, [loadVideo, frameReady, useFallbackImage, freeSlot])

  if (thumbnail) {
    return (
      <Image
        src={thumbnail}
        alt={alt}
        fill
        className={imageClassName}
        sizes={sizes}
        priority={false}
      />
    )
  }

  if (useFallbackImage) {
    return (
      <Image
        src="/placeholder.svg"
        alt={alt}
        fill
        className={imageClassName}
        sizes={sizes}
        priority={false}
      />
    )
  }

  return (
    <div ref={wrapRef} className="absolute inset-0 bg-[#1f1f1f]">
      {!frameReady && (
        <div className="absolute inset-0 animate-pulse bg-neutral-800/80" aria-hidden />
      )}
      {loadVideo && (
        <video
          src={videoUrl}
          muted
          playsInline
          preload="metadata"
          className={`absolute inset-0 h-full w-full object-cover ${imageClassName}`}
          style={{ opacity: frameReady ? 1 : 0 }}
          onLoadedMetadata={(e) => {
            const v = e.currentTarget
            try {
              v.currentTime = seekTimeForPoster(v)
            } catch {
              setUseFallbackImage(true)
              freeSlot()
            }
          }}
          onSeeked={(e) => {
            e.currentTarget.pause()
            setFrameReady(true)
            freeSlot()
          }}
          onError={() => {
            setUseFallbackImage(true)
            freeSlot()
          }}
        />
      )}
    </div>
  )
}
