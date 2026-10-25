"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Play } from "lucide-react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import GalleryModalVideo from "@/components/gallery-modal-video"
import { client, deliveriesSectionQuery } from "@/lib/sanity"
import {
  transformSanitySocialReel,
  type SanitySocialReel,
  type SocialReel,
} from "@/lib/sanity/utils"
import { useLocale } from "@/lib/i18n/context"
import { cn } from "@/lib/utils"

type Section = {
  title?: string
  titleEn?: string
  items?: SanitySocialReel[]
}

export default function DeliveredCarsPage() {
  const { locale, t } = useLocale()
  const [section, setSection] = useState<Section | null>(null)
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<SocialReel | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const data = await client.fetch<Section | null>(deliveriesSectionQuery)
        setSection(data)
      } catch (error) {
        console.error("Error fetching delivered cars:", error)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const title =
    locale === "en" && section?.titleEn?.trim()
      ? section.titleEn.trim()
      : section?.title || t("gallery.delivered")

  const items = useMemo(() => {
    const list = section?.items ?? []
    return [...list]
      .reverse()
      .map((item) => transformSanitySocialReel(item, locale))
      .filter((item) => Boolean(item.thumbnail || item.videoUrl))
  }, [section, locale])

  return (
    <div className="flex min-h-screen flex-col">
      <section className="relative w-full overflow-hidden py-24">
        <Image src="/banner.jpg" alt={t("gallery.bgAlt")} fill className="z-0 object-cover" priority />
        <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/80 via-black/70 to-black/80" />
        <div className="container relative z-20 mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <Link
              href="/gallery"
              className="mb-6 inline-flex text-sm text-white/70 transition-colors hover:text-white"
            >
              {t("gallery.backToGallery")}
            </Link>
            <h1 className="text-4xl font-bold text-white md:text-5xl lg:text-6xl">{title}</h1>
          </div>
        </div>
      </section>

      <section className="bg-[#121212] py-16">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="flex items-center justify-center py-24">
              <p className="text-gray-400">{t("gallery.loading")}</p>
            </div>
          ) : items.length === 0 ? (
            <div className="flex items-center justify-center py-24">
              <p className="text-gray-400">{t("gallery.deliveriesEmpty")}</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-x-4 gap-y-12 md:grid-cols-3 lg:grid-cols-4">
              {items.map((item, index) => (
                <button
                  key={`${item.videoUrl ?? item.thumbnail ?? "car"}-${index}`}
                  type="button"
                  onClick={() => setSelected(item)}
                  className="group relative block aspect-[9/16] text-left"
                >
                  <div className="absolute inset-0 overflow-hidden rounded-2xl border border-white/10 bg-[#1a1a1a] shadow-[0_10px_30px_-6px_rgba(0,0,0,0.7)]">
                    {item.thumbnail ? (
                      <Image
                        src={item.thumbnail}
                        alt={item.thumbnailAlt}
                        fill
                        sizes="(max-width: 768px) 45vw, 25vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : null}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="rounded-full bg-black/55 p-3 transition-colors group-hover:bg-black/75">
                        <Play className="h-7 w-7 fill-white text-white md:h-8 md:w-8" />
                      </div>
                    </div>
                  </div>
                  {item.comment ? (
                    <div className="pointer-events-none absolute inset-x-0 -bottom-4 z-20 flex justify-center">
                      <div className="relative w-max max-w-[calc(100%+1rem)] rounded-2xl bg-white px-3 py-2 text-[12px] leading-snug text-[#121212] shadow-xl md:max-w-[calc(100%+1.5rem)] md:px-3.5 md:py-2.5 md:text-[13px]">
                        <p>{item.comment}</p>
                        <span className="absolute -bottom-1.5 left-4 h-3 w-3 rotate-45 bg-white" />
                      </div>
                    </div>
                  ) : null}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      <Dialog open={selected !== null} onOpenChange={() => setSelected(null)}>
        <DialogContent
          className={cn(
            "flex flex-col overflow-hidden border-0 bg-black/95 p-0",
            "!fixed !inset-0 !left-0 !right-0 !top-0 !bottom-0 !translate-x-0 !translate-y-0",
            "h-[100dvh] max-h-[100dvh] w-full max-w-none rounded-none",
            "max-md:!duration-100",
            "[&>button]:!fixed [&>button]:z-[60] [&>button]:flex [&>button]:size-11 [&>button]:items-center [&>button]:justify-center [&>button]:rounded-full",
            "[&>button]:border [&>button]:border-white/20 [&>button]:bg-black/75 [&>button]:text-white [&>button]:shadow-lg",
            "[&>button]:right-[max(0.75rem,env(safe-area-inset-right))] [&>button]:top-[max(0.75rem,env(safe-area-inset-top))]",
            "[&>button]:opacity-100 hover:[&>button]:bg-black/90 [&>button]:active:scale-95",
            "[&>button_svg]:!size-6"
          )}
        >
          <DialogTitle className="sr-only">{selected?.comment || selected?.thumbnailAlt || title}</DialogTitle>
          {selected?.videoUrl ? (
            <div
              className={cn(
                "relative flex min-h-0 flex-1 items-center justify-center px-2",
                "pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-[max(3.25rem,calc(env(safe-area-inset-top)+2.75rem))]"
              )}
            >
              <GalleryModalVideo
                key={selected.videoUrl}
                videoUrl={selected.videoUrl}
                poster={selected.thumbnail}
                posterAlt={selected.thumbnailAlt}
              />
            </div>
          ) : selected?.thumbnail ? (
            <div className="relative min-h-0 flex-1">
              <Image
                src={selected.thumbnail}
                alt={selected.thumbnailAlt}
                fill
                className="object-contain p-4"
                sizes="95vw"
                priority
              />
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  )
}
