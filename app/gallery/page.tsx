"use client"

import { useState, useEffect, useMemo } from "react"
import Image from "next/image"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Play } from "lucide-react"
import { client, galleryImagesQuery, galleryPageQuery } from "@/lib/sanity"
import {
  transformSanityGalleryImage,
  type GalleryImage,
  getImageUrl,
  type GalleryPageData,
  type SanityGalleryImage,
} from "@/lib/sanity/utils"
import { useLocale } from "@/lib/i18n/context"
import { localizeGalleryPage } from "@/lib/sanity/localize"
import GalleryVideoThumbnail from "@/components/gallery-video-thumbnail"
import GalleryModalVideo from "@/components/gallery-modal-video"
import { cn } from "@/lib/utils"

export default function GalleryPage() {
  const { locale, t } = useLocale()
  const [selectedMedia, setSelectedMedia] = useState<GalleryImage | null>(null)
  const [rawImages, setRawImages] = useState<SanityGalleryImage[]>([])
  const [rawPageData, setRawPageData] = useState<
    GalleryPageData & { heroTitleEn?: string; heroDescriptionEn?: string }
  | null>(null)
  const [loading, setLoading] = useState(true)

  const pageData = useMemo(
    () => (rawPageData ? localizeGalleryPage(rawPageData, locale) : null),
    [rawPageData, locale]
  )

  const galleryImages = useMemo(
    () => rawImages.map((img) => transformSanityGalleryImage(img, locale)),
    [rawImages, locale]
  )

  useEffect(() => {
    async function fetchGalleryData() {
      try {
        const [imagesData, pageDataResult] = await Promise.all([
          client.fetch(galleryImagesQuery),
          client.fetch(galleryPageQuery)
        ])
        
        if (imagesData && imagesData.length > 0) {
          setRawImages(imagesData)
        }

        if (pageDataResult) {
          setRawPageData(pageDataResult)
        }
      } catch (error) {
        console.error("Error fetching gallery data:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchGalleryData()
  }, [])

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative w-full py-24 overflow-hidden">
        {/* Background Image */}
        <Image
          src={pageData?.heroImage ? getImageUrl(pageData.heroImage) : "/banner.jpg"}
          alt={pageData?.heroImage?.alt || t("gallery.bgAlt")}
          fill
          className="object-cover z-0"
          priority
        />
        {/* Dark Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/70 to-black/80 z-10"></div>
        {/* Content */}
        <div className="container mx-auto px-4 relative z-20">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              {pageData?.heroTitle || t("gallery.heroFallback")}
            </h1>
            {pageData?.heroDescription && (
            <p className="text-xl text-gray-200">
                {pageData.heroDescription}
            </p>
            )}
          </div>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="py-16 bg-[#121212]">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="flex items-center justify-center py-24">
              <p className="text-gray-400">{t("gallery.loading")}</p>
            </div>
          ) : galleryImages.length === 0 ? (
            <div className="flex items-center justify-center py-24">
              <p className="text-gray-400">{t("gallery.empty")}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {galleryImages.map((item) => (
                <div
                  key={item.id}
                  className="relative group cursor-pointer overflow-hidden rounded-lg bg-[#1a1a1a] aspect-square"
                  onClick={() => setSelectedMedia(item)}
                >
                  {item.type === 'video' && item.videoUrl ? (
                    <GalleryVideoThumbnail
                      thumbnail={item.thumbnail}
                      videoUrl={item.videoUrl}
                      alt={item.alt}
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      imageClassName="object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                  ) : (
                  <Image
                      src={item.src}
                      alt={item.alt}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-110"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                  {/* Play Icon for Videos */}
                  {item.type === 'video' && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-black/60 rounded-full p-4 group-hover:bg-black/80 transition-colors duration-300">
                        <Play className="h-12 w-12 text-white fill-white" />
                      </div>
                    </div>
                  )}
                  {/* Title Overlay - Bottom */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/60 to-transparent p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <p className="text-white font-medium text-sm md:text-base">{item.title}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Media Modal */}
      <Dialog open={selectedMedia !== null} onOpenChange={() => setSelectedMedia(null)}>
        <DialogContent
          className={cn(
            "flex flex-col overflow-hidden border-0 bg-black/95 p-0",
            /* Full viewport — no translate centering (that clips the top / hides X on mobile). */
            "!fixed !inset-0 !left-0 !right-0 !top-0 !bottom-0 !translate-x-0 !translate-y-0",
            "h-[100dvh] max-h-[100dvh] w-full max-w-none rounded-none",
            /* Shorter motion on phone — less contention with video decode while modal opens */
            "max-md:!duration-100",
            /* Radix close button: fixed corner + safe area + touch-sized target */
            "[&>button]:!fixed [&>button]:z-[60] [&>button]:flex [&>button]:size-11 [&>button]:items-center [&>button]:justify-center [&>button]:rounded-full",
            "[&>button]:border [&>button]:border-white/20 [&>button]:bg-black/75 [&>button]:text-white [&>button]:shadow-lg",
            "[&>button]:right-[max(0.75rem,env(safe-area-inset-right))] [&>button]:top-[max(0.75rem,env(safe-area-inset-top))]",
            "[&>button]:opacity-100 hover:[&>button]:bg-black/90 [&>button]:active:scale-95",
            "[&>button_svg]:!size-6"
          )}
        >
          <DialogTitle className="sr-only">
            {selectedMedia?.alt || t("gallery.dialogMedia")}
          </DialogTitle>
          {selectedMedia && (
            <div
              className={cn(
                "relative flex min-h-0 flex-1 items-center justify-center px-2",
                "pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-[max(3.25rem,calc(env(safe-area-inset-top)+2.75rem))]"
              )}
            >
              {selectedMedia.type === 'video' && selectedMedia.videoUrl ? (
                <GalleryModalVideo
                  key={selectedMedia.id}
                  videoUrl={selectedMedia.videoUrl}
                  poster={selectedMedia.thumbnail}
                  posterAlt={selectedMedia.alt}
                />
              ) : (
              <Image
                  src={selectedMedia.src}
                  alt={selectedMedia.alt}
                fill
                className="object-contain p-4"
                sizes="95vw"
                priority
              />
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

