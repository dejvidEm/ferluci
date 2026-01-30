"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { client, galleryImagesQuery } from "@/lib/sanity"
import { transformSanityGalleryImage, type GalleryImage } from "@/lib/sanity/utils"

export default function GalleryPage() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchGalleryImages() {
      try {
        const data = await client.fetch(galleryImagesQuery)
        if (data && data.length > 0) {
          const transformedImages = data.map(transformSanityGalleryImage)
          setGalleryImages(transformedImages)
        }
      } catch (error) {
        console.error("Error fetching gallery images:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchGalleryImages()
  }, [])

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative w-full py-24 overflow-hidden">
        {/* Background Image */}
        <Image
          src="/banner.jpg"
          alt="Gallery Background"
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
              Galéria
            </h1>
            <p className="text-xl text-gray-200">
              Pozrite si náš showroom a vozidlá v našej ponuke
            </p>
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
              {galleryImages.map((image) => (
                <div
                  key={image.id}
                  className="relative group cursor-pointer overflow-hidden rounded-lg bg-[#1a1a1a] aspect-square"
                  onClick={() => setSelectedImage(image.src)}
                >
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-110"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                  {/* Title Overlay - Bottom */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/60 to-transparent p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <p className="text-white font-medium text-sm md:text-base">{image.title}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Image Modal */}
      <Dialog open={selectedImage !== null} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-7xl w-[95vw] h-[95vh] p-0 bg-black/95 border-0">
          <DialogTitle className="sr-only">
            {selectedImage 
              ? galleryImages.find(img => img.src === selectedImage)?.alt || "Gallery image"
              : "Gallery image"
            }
          </DialogTitle>
          {selectedImage && (
            <div className="relative w-full h-full flex items-center justify-center">
              <Image
                src={selectedImage}
                alt={galleryImages.find(img => img.src === selectedImage)?.alt || "Gallery image"}
                fill
                className="object-contain p-4"
                sizes="95vw"
                priority
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

