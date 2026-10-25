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

function maxPreviewSlots() {
  if (typeof navigator === "undefined") return MAX_CONCURRENT_PREVIEWS
  const connection = (
    navigator as Navigator & {
      connection?: { saveData?: boolean; effectiveType?: string }
    }
  ).connection
  if (!connection) return MAX_CONCURRENT_PREVIEWS
  if (connection.saveData) return 1
  const type = connection.effectiveType
  if (type === "slow-2g" || type === "2g" || type === "3g") return 1
  return MAX_CONCURRENT_PREVIEWS
}

function acquireSlot(): Promise<void> {
  return new Promise((resolve) => {
    const grant = () => {
      activeLoads++
      resolve()
    }
    if (activeLoads < maxPreviewSlots()) {
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

/** Safari paints a blank white frame if we seek before data arrives. A media
 * fragment makes it decode that frame itself. */
function withPosterTime(url: string): string {
  const base = url.split("#")[0]
  return `${base}#t=0.1`
}

type Props = {
  reel: SocialReel
  fallbackHref: string
  /**
   * When false, the card stays a shell and does not request video bytes.
   * Used to reveal a long list gradually.
   */
  canLoad?: boolean
  /**
   * Drop the video element once the card leaves the viewport so a long list
   * does not keep every file decoded.
   */
  virtualize?: boolean
  /**
   * When provided, hover/touch events are ignored and the card plays iff
   * this is true. In a virtualized slider only that centered card opens a
   * video; neighbours stay dark shells until they become the active slide.
   * Undefined => default desktop behaviour (hover to play).
   */
  controlledActive?: boolean
}

function InstagramReelCardImpl({
  reel,
  fallbackHref,
  canLoad = true,
  virtualize = false,
  controlledActive,
}: Props) {
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
  const [isPlaying, setIsPlaying] = useState(false)

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
  useEffect(() => {
    if (!shouldMountVideo) setIsPlaying(false)
  }, [shouldMountVideo])

  const freeSlot = useCallback(() => {
    if (!oweSlot.current) return
    oweSlot.current = false
    releaseSlot()
  }, [])

  useEffect(() => {
    if (canLoad) return
    setShouldMountVideo(false)
    setActive(false)
    setFrameReady(false)
    freeSlot()
  }, [canLoad, freeSlot])

  // Frame-fallback IO for desktop cards without a thumbnail. A virtualized
  // phone slider skips this: only the centered slide mounts a video.
  // Virtualized cards release the video again once they leave the viewport.
  useEffect(() => {
    if (!canLoad || hasThumbnail || !hasVideo) return
    // On a phone slider, only the centered card may open a video. The peeking
    // neighbour stays a lightweight shell so a weak connection is not asked
    // for two files at once.
    if (controlled && virtualize) return
    const root = containerRef.current
    if (!root) return

    let cancelled = false
    const visibleRef = { current: false }
    const mount = () => {
      if (controlled) {
        if (cancelled || shouldMountVideoRef.current) return
        setShouldMountVideo(true)
        return
      }

      ;(async () => {
        if (shouldMountVideoRef.current) return
        await acquireSlot()
        if (cancelled || !visibleRef.current || shouldMountVideoRef.current) {
          releaseSlot()
          return
        }
        oweSlot.current = true
        setShouldMountVideo(true)
      })()
    }

    const io = new IntersectionObserver(
      (entries) => {
        const hit = entries.some((e) => e.isIntersecting)
        visibleRef.current = hit
        if (!hit) {
          if (!virtualize || activeRef.current) return
          setShouldMountVideo(false)
          setFrameReady(false)
          freeSlot()
          return
        }
        if (!virtualize) io.disconnect()
        mount()
      },
      { rootMargin: virtualize ? "0px" : controlled ? "40px" : "240px", threshold: 0.01 }
    )
    io.observe(root)
    return () => {
      cancelled = true
      io.disconnect()
    }
  }, [canLoad, controlled, freeSlot, hasThumbnail, hasVideo, virtualize])

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
    if (!controlled || !canLoad) return
    if (!hasVideo) {
      setActive(false)
      return
    }
    if (controlledActive) {
      setShouldMountVideo(true)
      setActive(true)
    } else {
      setActive(false)
      if (virtualize) {
        setShouldMountVideo(false)
        setFrameReady(false)
        freeSlot()
      }
    }
  }, [canLoad, controlled, controlledActive, freeSlot, hasVideo, virtualize])

  // Single play/pause effect driven by `active`.
  useEffect(() => {
    if (!shouldMountVideo) return
    const v = videoRef.current
    if (!v) return

    const play = () => {
      if (!activeRef.current) return
      v.muted = true
      const p = v.play()
      if (p && typeof p.catch === "function") {
        p.catch(() => {
          // Autoplay can wait for a tap. The photo stays visible until then.
        })
      }
    }

    if (active) {
      play()
      v.addEventListener("loadeddata", play)
      v.addEventListener("canplay", play)
    } else {
      v.pause()
    }

    return () => {
      v.removeEventListener("loadeddata", play)
      v.removeEventListener("canplay", play)
    }
  }, [active, shouldMountVideo, hasThumbnail])

  const activate = useCallback(() => {
    if (controlled) {
      const v = videoRef.current
      if (!v) return
      v.muted = true
      v.play()?.catch(() => {})
      return
    }
    if (!hasVideo) return
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
  const videoVisible = hasThumbnail ? isPlaying : active || frameReady

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
      onTouchStart={activate}
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
          ref={(node) => {
            videoRef.current = node
            // Safari ignores the muted attribute for autoplay unless the property is set.
            if (node) node.muted = true
          }}
          src={hasThumbnail || virtualize ? reel.videoUrl : withPosterTime(reel.videoUrl)}
          poster={hasThumbnail ? reel.thumbnail : undefined}
          muted
          loop
          playsInline
          preload={active ? "auto" : "metadata"}
          fetchPriority={active ? "high" : "low"}
          // No opacity transition on the element itself: Safari paints that as a
          // blank white box. The photo stays up until playback actually starts.
          className={`absolute inset-0 z-[2] h-full w-full bg-transparent object-cover [transform:translateZ(0)] ${
            hasThumbnail && !videoVisible ? "invisible" : ""
          }`}
          onPlaying={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onLoadedData={(e) => {
            if (hasThumbnail || frameReadyRef.current) return
            const v = e.currentTarget
            if (v.readyState < 2) return
            if (!activeRef.current) v.pause()
            setFrameReady(true)
            freeSlot()
          }}
          onError={() => {
            setVideoFailed(true)
            freeSlot()
          }}
        />
      )}

      {!hasThumbnail && shouldMountVideo && !frameReady && !videoFailed && (
        <div className="absolute inset-0 z-[1] animate-pulse bg-neutral-800" aria-hidden />
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
