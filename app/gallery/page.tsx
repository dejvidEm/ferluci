"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Play } from "lucide-react"
import { client, galleryImagesQuery, galleryPageQuery } from "@/lib/sanity"
import { transformSanityGalleryImage, type GalleryImage, getImageUrl, type GalleryPageData } from "@/lib/sanity/utils"

export default function GalleryPage() {
  const [selectedMedia, setSelectedMedia] = useState<GalleryImage | null>(null)
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([])
  const [pageData, setPageData] = useState<GalleryPageData | null>(null)
  const [loading, setLoading] = useState(true)
  const [videoErrors, setVideoErrors] = useState<Set<string>>(new Set())

  useEffect(() => {
    async function fetchGalleryData() {
      try {
        const [imagesData, pageDataResult] = await Promise.all([
          client.fetch(galleryImagesQuery),
          client.fetch(galleryPageQuery)
        ])
        
        if (imagesData && imagesData.length > 0) {
          const transformedImages = imagesData.map(transformSanityGalleryImage)
          setGalleryImages(transformedImages)
        }
        
        if (pageDataResult) {
          setPageData(pageDataResult)
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
          alt={pageData?.heroImage?.alt || "Gallery Background"}
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
              {pageData?.heroTitle || "Galéria"}
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
              <p className="text-gray-400">Načítavanie galérie...</p>
            </div>
          ) : galleryImages.length === 0 ? (
            <div className="flex items-center justify-center py-24">
              <p className="text-gray-400">V galérii zatiaľ nie sú žiadne obrázky.</p>
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
                    <>
                      {videoErrors.has(item.id) && item.thumbnail ? (
                        <Image
                          src={item.thumbnail}
                          alt={item.alt}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-110"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                      ) : (
                        <video
                          src={item.videoUrl}
                          preload="auto"
                          poster={item.thumbnail || undefined}
                          className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                          muted
                          playsInline
                          onLoadedData={(e) => {
                            // Seek to first frame to ensure it's visible
                            const video = e.currentTarget
                            if (video.readyState >= 2) {
                              video.currentTime = 0.01
                            }
                          }}
                          onLoadedMetadata={(e) => {
                            // Ensure first frame is displayed
                            const video = e.currentTarget
                            if (video.duration > 0 && video.readyState >= 2) {
                              video.currentTime = 0.01
                            }
                          }}
                          onError={() => {
                            console.error('Video load error for:', item.videoUrl)
                            setVideoErrors((prev) => new Set(prev).add(item.id))
                          }}
                        />
                      )}
                    </>
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
            {selectedMedia?.alt || "Gallery media"}
          </DialogTitle>
          {selectedMedia && (
            <div className="relative w-full h-full flex items-center justify-center">
              {selectedMedia.type === 'video' && selectedMedia.videoUrl ? (
                <video
                  src={selectedMedia.videoUrl}
                  controls
                  autoPlay
                  className="max-w-full max-h-full w-auto h-auto"
                  style={{ maxHeight: '95vh' }}
                >
                  Váš prehliadač nepodporuje prehrávanie videa.
                </video>
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

