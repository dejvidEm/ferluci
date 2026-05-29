"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import InstagramReelCard from "@/components/instagram-reel-card"
import type { SocialReel } from "@/lib/sanity/utils"

type Props = {
  reels: SocialReel[]
  fallbackHref: string
}

/**
 * Responsive reel layout.
 *
 * Mobile (`< md`) – snap slider:
 *   - Only the currently-centred slide loads & plays its video. Off-screen
 *     slides hold a placeholder/thumbnail and do not request any bytes.
 *   - When the user swipes, the previous slide pauses and the new active
 *     slide mounts + plays its video (sticky mount: the element stays in
 *     the DOM after first use so swiping back is instant).
 *   - When the entire slider scrolls out of viewport, all playback stops so
 *     we don't burn battery / CPU on a hidden element.
 *   - Scroll events are throttled via requestAnimationFrame.
 *
 * Desktop (`md+`) – 4-up grid with the existing hover-to-play behaviour.
 *
 * The two layouts are siblings hidden via responsive classes. Hidden cards
 * never run effects against real DOM (display:none stops IO from firing) so
 * the cost of rendering both is just a few React nodes.
 */
export default function SocialReelsList({ reels, fallbackHref }: Props) {
  const scrollerRef = useRef<HTMLDivElement>(null)
  const rafIdRef = useRef<number | null>(null)

  const [progress, setProgress] = useState(0)
  const [thumbRatio, setThumbRatio] = useState(1)
  const [activeIndex, setActiveIndex] = useState(0)
  const [sliderInView, setSliderInView] = useState(false)

  const recalc = useCallback(() => {
    const el = scrollerRef.current
    if (!el) return

    // Scrollbar metrics.
    const max = el.scrollWidth - el.clientWidth
    setProgress(max > 0 ? Math.max(0, Math.min(1, el.scrollLeft / max)) : 0)
    setThumbRatio(
      el.scrollWidth > 0 ? Math.max(0.1, Math.min(1, el.clientWidth / el.scrollWidth)) : 1
    )

    // Which child is closest to the viewport centre? That's the active slide.
    const viewportCenter = el.scrollLeft + el.clientWidth / 2
    const children = el.children
    let bestIndex = 0
    let bestDistance = Number.POSITIVE_INFINITY
    for (let i = 0; i < children.length; i++) {
      const child = children[i] as HTMLElement
      const childCenter = child.offsetLeft + child.offsetWidth / 2
      const distance = Math.abs(childCenter - viewportCenter)
      if (distance < bestDistance) {
        bestDistance = distance
        bestIndex = i
      }
    }
    setActiveIndex((prev) => (prev === bestIndex ? prev : bestIndex))
  }, [])

  const onScroll = useCallback(() => {
    if (rafIdRef.current !== null) return
    rafIdRef.current = requestAnimationFrame(() => {
      rafIdRef.current = null
      recalc()
    })
  }, [recalc])

  useEffect(() => {
    const el = scrollerRef.current
    if (!el) return
    recalc()
    el.addEventListener("scroll", onScroll, { passive: true })
    const ro = new ResizeObserver(onScroll)
    ro.observe(el)
    return () => {
      el.removeEventListener("scroll", onScroll)
      ro.disconnect()
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current)
        rafIdRef.current = null
      }
    }
  }, [onScroll, recalc])

  // Pause everything when the slider is off-screen so we don't waste CPU /
  // battery decoding video the user can't see.
  useEffect(() => {
    const el = scrollerRef.current
    if (!el) return
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.some((e) => e.isIntersecting)
        setSliderInView((prev) => (prev === visible ? prev : visible))
      },
      { threshold: 0.1 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  const scrollbarVisible = thumbRatio < 0.999

  return (
    <>
      {/* Mobile / small tablet: snap slider with centered active slide */}
      <div className="md:hidden -mx-4">
        <div
          ref={scrollerRef}
          className="flex gap-3 overflow-x-auto snap-x snap-mandatory scroll-smooth px-[10vw] pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {reels.map((reel, index) => (
            <div key={index} className="snap-center shrink-0 w-[80vw] max-w-[360px]">
              <InstagramReelCard
                reel={reel}
                fallbackHref={fallbackHref}
                controlledActive={sliderInView && index === activeIndex}
              />
            </div>
          ))}
        </div>

        {scrollbarVisible && (
          <div
            className="relative mx-auto mt-5 h-[3px] w-1/2 max-w-[200px] overflow-hidden rounded-full bg-white/10"
            aria-hidden
          >
            <div
              className="absolute inset-y-0 rounded-full bg-primary"
              style={{
                width: `${thumbRatio * 100}%`,
                left: `${progress * (1 - thumbRatio) * 100}%`,
              }}
            />
          </div>
        )}
      </div>

      {/* Desktop: regular 4-up grid (hover to play) */}
      <div className="hidden md:grid md:grid-cols-4 gap-6">
        {reels.map((reel, index) => (
          <InstagramReelCard key={index} reel={reel} fallbackHref={fallbackHref} />
        ))}
      </div>
    </>
  )
}
