"use client"

import { memo, useCallback, useEffect, useRef, useState, type Ref } from "react"
import Image from "next/image"
import type { SocialReel } from "@/lib/sanity/utils"

// Cap parallel metadata loads in DESKTOP (uncontrolled) mode where many cards
// may try to grab a poster frame at the same time. Mobile slider doesn't use
// the semaphore — only 1–2 cards are visible at once so it's not worth gating.
const MAX_CONCURRENT_PREVIEWS = 2
let activeLoads = 0
const pendingGrants: Array<() => void> = []

function acquireSlot(): Promise<void> {
  return new Promise((resolve) => {
    const grant = () => {
      activeLoads++
      resolve()
    }
    if (activeLoads < MAX_CONCURRENT_PREVIEWS) {
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
  return Math.min(1, early, Math.max(0.05, d - 0.02))
}

type Props = {
  reel: SocialReel
  fallbackHref: string
  /**
   * When provided, hover/touch events are ignored and the card plays iff
   * this is true. Frame-fallback (loading a poster from the video) still
   * runs when the card without a thumbnail is partially visible, so the
   * neighbour reel in a slider always shows a preview — but only if it
   * truly intersects the viewport (no preloading of fully-off-screen cards).
   * Undefined => default desktop behaviour (hover to play).
   */
  controlledActive?: boolean
}

function InstagramReelCardImpl({ reel, fallbackHref, controlledActive }: Props) {
  const controlled = controlledActive !== undefined

  const containerRef = useRef<HTMLElement>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const oweSlot = useRef(false)

  const hasVideo = Boolean(reel.videoUrl)
  const hasThumbnail = Boolean(reel.thumbnail)
  const href = reel.instagramUrl || fallbackHref
  const Tag = href ? "a" : "div"

  const [shouldMountVideo, setShouldMountVideo] = useState(false)
  const [active, setActive] = useState(false)
  const [frameReady, setFrameReady] = useState(false)
  const [videoFailed, setVideoFailed] = useState(false)

  // Refs mirror the latest state so event handlers (onLoadedMetadata/onSeeked)
  // can branch on the *current* values, not the values captured at mount.
  const activeRef = useRef(false)
  const frameReadyRef = useRef(false)
  const shouldMountVideoRef = useRef(false)
  useEffect(() => {
    activeRef.current = active
  }, [active])
  useEffect(() => {
    frameReadyRef.current = frameReady
  }, [frameReady])
  useEffect(() => {
    shouldMountVideoRef.current = shouldMountVideo
  }, [shouldMountVideo])

  const freeSlot = useCallback(() => {
    if (!oweSlot.current) return
    oweSlot.current = false
    releaseSlot()
  }, [])

  // Frame-fallback IO. Runs in BOTH modes for cards without a thumbnail so
  // the peeking neighbour in a mobile slider can still show a poster grabbed
  // from the video. Controlled mode skips the slot semaphore (small visible
  // set) and uses a tight rootMargin so off-screen slides never preload.
  useEffect(() => {
    if (hasThumbnail || !hasVideo) return
    const root = containerRef.current
    if (!root) return

    let cancelled = false
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return
        io.disconnect()

        if (controlled) {
          // Mobile slider path: already-mounted (e.g. via active prop)? skip.
          if (cancelled || shouldMountVideoRef.current) return
          setShouldMountVideo(true)
          return
        }

        // Desktop path: gate through the concurrency semaphore.
        ;(async () => {
          if (shouldMountVideoRef.current) return
          await acquireSlot()
          if (cancelled || shouldMountVideoRef.current) {
            releaseSlot()
            return
          }
          oweSlot.current = true
          setShouldMountVideo(true)
        })()
      },
      { rootMargin: controlled ? "0px" : "180px", threshold: 0.01 }
    )
    io.observe(root)
    return () => {
      cancelled = true
      io.disconnect()
    }
  }, [controlled, hasThumbnail, hasVideo])

  useEffect(() => {
    return () => {
      freeSlot()
    }
  }, [freeSlot])

  // Desktop-only safety net: if metadata/seek never completes, fall back to
  // the placeholder image. We deliberately skip this in controlled mode so a
  // long-loading active video doesn't accidentally degrade to a placeholder.
  useEffect(() => {
    if (controlled) return
    if (hasThumbnail || !shouldMountVideo || frameReady || videoFailed) return
    const t = window.setTimeout(() => {
      setVideoFailed(true)
      freeSlot()
    }, 15000)
    return () => clearTimeout(t)
  }, [controlled, hasThumbnail, shouldMountVideo, frameReady, videoFailed, freeSlot])

  // Controlled mode drives `active` purely from the prop.
  useEffect(() => {
    if (!controlled) return
    if (!hasVideo) {
      setActive(false)
      return
    }
    if (controlledActive) {
      setShouldMountVideo(true)
      setActive(true)
    } else {
      setActive(false)
    }
  }, [controlled, controlledActive, hasVideo])

  // Single play/pause effect driven by `active`.
  useEffect(() => {
    if (!shouldMountVideo) return
    const v = videoRef.current
    if (!v) return

    if (active) {
      try {
        v.currentTime = 0
      } catch {
        // Seek can throw if metadata isn't loaded yet — safe to ignore.
      }
      const p = v.play()
      if (p && typeof p.catch === "function") {
        p.catch(() => {
          // Autoplay restrictions; the next user gesture will retry.
        })
      }
    } else {
      v.pause()
      // Without a thumbnail we want the still poster frame to be visible when
      // the card is paused so the user sees a preview rather than wherever
      // the video happened to stop.
      if (!hasThumbnail) {
        try {
          v.currentTime = seekTimeForPoster(v)
        } catch {
          // ignore
        }
      }
    }
  }, [active, shouldMountVideo, hasThumbnail])

  const activate = useCallback(() => {
    if (controlled || !hasVideo) return
    setActive(true)
    if (hasThumbnail) {
      setShouldMountVideo(true)
    }
  }, [controlled, hasVideo, hasThumbnail])

  const deactivate = useCallback(() => {
    if (controlled || !hasVideo) return
    setActive(false)
  }, [controlled, hasVideo])

  // Video is visible (opacity-100) whenever the card is playing OR has a
  // poster ready to show. Underneath sits the thumbnail / placeholder / skeleton.
  const videoVisible = hasThumbnail ? active : active || frameReady

  // Background underneath the video element.
  const renderBackground = () => {
    if (hasThumbnail && reel.thumbnail) {
      return (
        <Image
          src={reel.thumbnail}
          alt={reel.thumbnailAlt}
          fill
          sizes="(max-width: 768px) 80vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      )
    }
    if (!hasThumbnail && videoFailed) {
      return (
        <Image
          src="/placeholder.svg"
          alt={reel.thumbnailAlt}
          fill
          sizes="(max-width: 768px) 80vw, 25vw"
          className="object-cover"
        />
      )
    }
    if (!hasThumbnail && !frameReady) {
      // Only show the skeleton until we have a real frame to display.
      return <div className="absolute inset-0 animate-pulse bg-neutral-800/80" aria-hidden />
    }
    return null
  }

  return (
    <Tag
      ref={containerRef as Ref<HTMLAnchorElement & HTMLDivElement>}
      {...(href ? { href, target: "_blank", rel: "noopener noreferrer" } : {})}
      onMouseEnter={activate}
      onMouseLeave={deactivate}
      onFocus={activate}
      onBlur={deactivate}
      onTouchStart={controlled ? undefined : activate}
      className={`group relative block aspect-[9/16] ${
        reel.comment ? "overflow-visible" : "overflow-hidden rounded-2xl border border-white/10 bg-[#1a1a1a] shadow-[0_10px_30px_-6px_rgba(0,0,0,0.7)]"
      } ${href ? "cursor-pointer" : ""}`}
    >
      <div
        className={
          reel.comment
            ? "absolute inset-0 overflow-hidden rounded-2xl border border-white/10 bg-[#1a1a1a] shadow-[0_10px_30px_-6px_rgba(0,0,0,0.7)]"
            : "contents"
        }
      >
      {renderBackground()}

      {shouldMountVideo && reel.videoUrl && !videoFailed && (
        <video
          ref={videoRef}
          src={reel.videoUrl}
          muted
          loop
          playsInline
          preload={hasThumbnail ? "auto" : "metadata"}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${
            videoVisible ? "opacity-100" : "opacity-0"
          }`}
          onLoadedMetadata={(e) => {
            // Has a thumbnail → no poster needed.
            // Currently active → let the play effect drive currentTime to 0.
            if (hasThumbnail || activeRef.current) return
            const v = e.currentTarget
            try {
              v.currentTime = seekTimeForPoster(v)
            } catch {
              setVideoFailed(true)
              freeSlot()
            }
          }}
          onSeeked={(e) => {
            if (hasThumbnail) return
            // Subsequent seeks (play-from-0, deactivate-to-poster) are no-ops
            // for state changes.
            if (frameReadyRef.current) return
            // If we're already active by the time the first seek resolves,
            // ignore the poster path — the user is watching playback.
            if (activeRef.current) return
            e.currentTarget.pause()
            setFrameReady(true)
            freeSlot()
          }}
          onError={() => {
            setVideoFailed(true)
            freeSlot()
          }}
        />
      )}

      {!reel.comment && (
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100" />
      )}
      </div>

      {reel.comment ? (
        <div className="pointer-events-none absolute inset-x-0 -bottom-4 z-20 flex justify-center md:-bottom-5">
          <div className="relative w-max max-w-[calc(100%+1.5rem)] rounded-2xl bg-white px-3.5 py-2.5 text-[13px] leading-snug text-[#121212] shadow-xl md:max-w-[calc(100%+2rem)] md:px-4 md:py-3 md:text-sm">
            <p>{reel.comment}</p>
            <span className="absolute -bottom-1.5 left-5 h-3 w-3 rotate-45 bg-white" />
          </div>
        </div>
      ) : (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-2 p-3 md:p-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100">
          <p className="line-clamp-2 text-sm md:text-base font-semibold text-white drop-shadow">
            {reel.title}
          </p>
        </div>
      )}
    </Tag>
  )
}

const InstagramReelCard = memo(InstagramReelCardImpl)
InstagramReelCard.displayName = "InstagramReelCard"

export default InstagramReelCard
