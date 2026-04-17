"use client"

import { useState, useEffect, useMemo } from "react"
import Image from "next/image"
import MuxPlayer from "@mux/mux-player-react"
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
                  {item.type === 'video' ? (
                    item.thumbnail ? (
                      <Image
                        src={item.thumbnail}
                        alt={item.alt}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-110"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        priority={false}
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                        <p className="text-gray-400 text-sm">{t("gallery.videoError")}</p>
                      </div>
                    )
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
        <DialogContent className="max-w-7xl w-[95vw] h-[95vh] p-0 bg-black/95 border-0">
          <DialogTitle className="sr-only">
            {selectedMedia?.alt || t("gallery.dialogMedia")}
          </DialogTitle>
          {selectedMedia && (
            <div className="relative w-full h-full flex items-center justify-center">
              {selectedMedia.type === 'video' && selectedMedia.muxPlaybackId ? (
                <>
                  {/* Migration note: videos must now be uploaded in Sanity via Mux input.
                     Old file-based video uploads are not supported on /gallery anymore. */}
                  <MuxPlayer
                    playbackId={selectedMedia.muxPlaybackId}
                    streamType="on-demand"
                    autoPlay
                    poster={selectedMedia.thumbnail}
                    className="w-full h-full max-h-[95vh]"
                    style={{ width: "100%", height: "100%", maxHeight: "95vh" }}
                  />
                </>
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

