"use client"

import { useState } from "react"
import Image from "next/image"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"

// Gallery images - showroom photos
const galleryImages = [
  { src: "/about.jpeg", alt: "Showroom interior" },
  { src: "/bmw/1.png", alt: "Showroom vehicle 1" },
  { src: "/bmw/2.png", alt: "Showroom vehicle 2" },
  { src: "/bmw/3.png", alt: "Showroom vehicle 3" },
  { src: "/bmw/4.png", alt: "Showroom vehicle 4" },
  { src: "/bmw/5.png", alt: "Showroom vehicle 5" },
  { src: "/bmw/6.png", alt: "Showroom vehicle 6" },
  { src: "/bmw/7.png", alt: "Showroom vehicle 7" },
  { src: "/bmw/8.png", alt: "Showroom vehicle 8" },
]

export default function GalleryPage() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative w-full py-24 bg-gradient-to-b from-black via-[#2a0f1a] to-[#4a1a2a]">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              Galéria
            </h1>
            <p className="text-xl text-gray-200">
              Pozrite si našu showroom a vozidlá v našej ponuke
            </p>
          </div>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="py-16 bg-[#121212]">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {galleryImages.map((image, index) => (
              <div
                key={index}
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
              </div>
            ))}
          </div>
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

