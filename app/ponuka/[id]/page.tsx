"use client"

import { use, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Car, Check, ChevronLeft, ChevronRight, Fuel, Info, MapPin, Share2, Sliders, Gauge } from "lucide-react"
import { vehicles } from "@/lib/data"
import { formatCurrency, formatNumber } from "@/lib/utils"
import FAQ from "@/components/faq"

export default function VehicleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const vehicle = vehicles.find((v) => v.id === id)
  const [activeImageIndex, setActiveImageIndex] = useState(0)

  if (!vehicle) {
    notFound()
  }

  const nextImage = () => {
    setActiveImageIndex((prev) => (prev === vehicle.images.length - 1 ? 0 : prev + 1))
  }

  const prevImage = () => {
    setActiveImageIndex((prev) => (prev === 0 ? vehicle.images.length - 1 : prev - 1))
  }

  const selectImage = (index: number) => {
    setActiveImageIndex(index)
  }

  // Extract horsepower from engine if available, otherwise use a default
  const getHorsepower = () => {
    // Try to extract from engine string or use default
    const match = vehicle.engine.match(/(\d+)\s*hp/i) || vehicle.engine.match(/(\d+)\s*HP/i)
    return match ? match[1] + " hp" : "N/A"
  }

  return (
    <div className="min-h-screen bg-[#1a0a10]">
      {/* Mobile Layout */}
      <div className="md:hidden">
        {/* Main Image - Full Width */}
        <div className="relative w-full aspect-[4/3] overflow-hidden">
          <Image
            src={vehicle.images[activeImageIndex] || "/placeholder.svg"}
            alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
            fill
            className="object-cover"
            priority
          />
          
          {/* Floating Back Button - Top Left */}
          <Link
            href="/ponuka"
            className="absolute top-4 left-4 z-20 w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center hover:bg-black/70 transition-colors"
          >
            <ChevronLeft className="h-5 w-5 text-white" />
          </Link>

          {/* Floating Info Button - Top Right */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm hover:bg-black/70 text-white"
            asChild
          >
            <Link href={`/contact?vehicle=${vehicle.id}`}>
              <Info className="h-5 w-5" />
            </Link>
          </Button>

          {/* Image Dots Indicator - Bottom Center */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {vehicle.images.map((_, index) => (
              <button
                key={index}
                onClick={() => selectImage(index)}
                className={`rounded-full transition-all ${
                  index === activeImageIndex ? "bg-white w-6 h-2" : "bg-white/50 w-2 h-2"
                }`}
                aria-label={`Go to image ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Content Section */}
        <div className="container mx-auto px-4 py-6">
          {/* Thumbnail Gallery */}
          <div className="flex overflow-x-auto gap-3 pb-4 scrollbar-hide mb-6">
            {vehicle.images.map((image, index) => (
              <div
                key={index}
                className={`relative w-24 h-24 flex-shrink-0 cursor-pointer rounded-xl overflow-hidden transition-all ${
                  index === activeImageIndex ? "ring-2 ring-primary" : "opacity-70 hover:opacity-100"
                }`}
                onClick={() => selectImage(index)}
              >
                <Image
                  src={image || "/placeholder.svg"}
                  alt={`${vehicle.year} ${vehicle.make} ${vehicle.model} - Image ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>

          {/* Title and Price Row */}
          <div className="flex items-start justify-between mb-4">
            <h1 className="text-2xl font-bold text-white flex-1 pr-4">
              {vehicle.year} {vehicle.make} {vehicle.model}
            </h1>
            <Badge className="bg-primary/20 text-primary border-primary/50 px-4 py-2 text-base font-semibold whitespace-nowrap">
              {formatCurrency(vehicle.price)}
            </Badge>
          </div>

          {/* Overview Section */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-3">Overview</h3>
            <p className="text-gray-300 text-sm leading-relaxed mb-6">
              {vehicle.description}
            </p>
          </div>

          {/* Features Section */}
          <div className="mb-6 border-t border-gray-700/50 pt-6">
            <h3 className="text-lg font-semibold text-white mb-4">Key Features</h3>
            <ul className="space-y-3">
              {vehicle.features.map((feature, index) => (
                <li key={index} className="flex items-start">
                  <Check className="h-5 w-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300 text-sm">{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Specifications Section */}
          <div className="mb-6 border-t border-gray-700/50 pt-6">
            <h3 className="text-lg font-semibold text-white mb-4">Specifications</h3>
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-gray-700/30">
                <span className="text-gray-400 text-sm">Make</span>
                <span className="text-white text-sm font-medium">{vehicle.make}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-700/30">
                <span className="text-gray-400 text-sm">Model</span>
                <span className="text-white text-sm font-medium">{vehicle.model}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-700/30">
                <span className="text-gray-400 text-sm">Year</span>
                <span className="text-white text-sm font-medium">{vehicle.year}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-700/30">
                <span className="text-gray-400 text-sm">Trim</span>
                <span className="text-white text-sm font-medium">{vehicle.trim}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-700/30">
                <span className="text-gray-400 text-sm">Mileage</span>
                <span className="text-white text-sm font-medium">{formatNumber(vehicle.mileage)} miles</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-700/30">
                <span className="text-gray-400 text-sm">Exterior Color</span>
                <span className="text-white text-sm font-medium">{vehicle.exteriorColor}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-700/30">
                <span className="text-gray-400 text-sm">Interior Color</span>
                <span className="text-white text-sm font-medium">{vehicle.interiorColor}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-700/30">
                <span className="text-gray-400 text-sm">Fuel Type</span>
                <span className="text-white text-sm font-medium">{vehicle.fuelType}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-700/30">
                <span className="text-gray-400 text-sm">Transmission</span>
                <span className="text-white text-sm font-medium">{vehicle.transmission}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-400 text-sm">Engine</span>
                <span className="text-white text-sm font-medium">{vehicle.engine}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Button - Full Width, Bottom */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-[#1a0a10] border-t border-gray-800/50 z-30">
          <Button className="w-full bg-primary hover:bg-primary/90 text-white rounded-xl h-12 text-base font-semibold" asChild>
            <Link href={`/contact?vehicle=${vehicle.id}`}>Kontaktovať</Link>
          </Button>
        </div>

        {/* Add bottom padding for fixed button */}
        <div className="h-20"></div>
      </div>

      {/* Desktop Layout - Original Design */}
      <div className="hidden md:block">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <Link href="/ponuka" className="flex items-center text-primary hover:underline">
              <ChevronLeft className="h-4 w-4 mr-1" /> Back to Ponuka
            </Link>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Images */}
            <div className="lg:col-span-2">
              {/* Main Image */}
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl mb-4">
                <Image
                  src={vehicle.images[activeImageIndex] || "/placeholder.svg"}
                  alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                  fill
                  className="object-cover"
                  priority
                />
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full opacity-80 hover:opacity-100 z-10"
                  onClick={prevImage}
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full opacity-80 hover:opacity-100 z-10"
                  onClick={nextImage}
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
              </div>

              {/* Thumbnail Gallery */}
              <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide mb-6">
                {vehicle.images.map((image, index) => (
                  <div
                    key={index}
                    className={`relative w-24 h-24 flex-shrink-0 cursor-pointer rounded-xl overflow-hidden transition-all ${
                      index === activeImageIndex ? "ring-2 ring-primary" : "opacity-70 hover:opacity-100"
                    }`}
                    onClick={() => selectImage(index)}
                  >
                    <Image
                      src={image || "/placeholder.svg"}
                      alt={`${vehicle.year} ${vehicle.make} ${vehicle.model} - Image ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>

              {/* Tabs Section */}
              <Tabs defaultValue="overview" className="mt-8">
                <TabsList className="grid grid-cols-3 w-full">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="features">Features</TabsTrigger>
                  <TabsTrigger value="specs">Specifications</TabsTrigger>
                </TabsList>
                <TabsContent value="overview" className="pt-4">
                  <h3 className="text-xl font-semibold mb-3 text-gray-100">Vehicle Description</h3>
                  <p className="text-gray-300 mb-6 leading-relaxed">{vehicle.description}</p>
                </TabsContent>
                <TabsContent value="features" className="pt-4">
                  <h3 className="text-xl font-semibold mb-3 text-gray-100">Key Features</h3>
                  <ul className="grid md:grid-cols-2 gap-2">
                    {vehicle.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <Check className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </TabsContent>
                <TabsContent value="specs" className="pt-4">
                  <h3 className="text-xl font-semibold mb-3 text-gray-100">Vehicle Specifications</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="font-medium text-gray-200">Make:</div>
                      <div className="text-gray-300">{vehicle.make}</div>
                      <div className="font-medium text-gray-200">Model:</div>
                      <div className="text-gray-300">{vehicle.model}</div>
                      <div className="font-medium text-gray-200">Year:</div>
                      <div className="text-gray-300">{vehicle.year}</div>
                      <div className="font-medium text-gray-200">Trim:</div>
                      <div className="text-gray-300">{vehicle.trim}</div>
                      <div className="font-medium text-gray-200">Mileage:</div>
                      <div className="text-gray-300">{formatNumber(vehicle.mileage)} miles</div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="font-medium text-gray-200">Exterior Color:</div>
                      <div className="text-gray-300">{vehicle.exteriorColor}</div>
                      <div className="font-medium text-gray-200">Interior Color:</div>
                      <div className="text-gray-300">{vehicle.interiorColor}</div>
                      <div className="font-medium text-gray-200">Fuel Type:</div>
                      <div className="text-gray-300">{vehicle.fuelType}</div>
                      <div className="font-medium text-gray-200">Transmission:</div>
                      <div className="text-gray-300">{vehicle.transmission}</div>
                      <div className="font-medium text-gray-200">Engine:</div>
                      <div className="text-gray-300">{vehicle.engine}</div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* Right Column - Details and Actions */}
            <div>
              <div className="bg-[#2a0f1a]/50 backdrop-blur-sm rounded-2xl p-6 sticky top-24 border-0">
                <div className="flex items-center justify-between mb-4">
                  <h1 className="text-2xl font-bold text-gray-100 pr-2">
                    {vehicle.year} {vehicle.make} {vehicle.model}
                  </h1>
                  <Button variant="ghost" size="icon" className="flex-shrink-0">
                    <Share2 className="h-5 w-5" />
                  </Button>
                </div>

                <div className="mb-2">
                  <Badge variant="outline" className="text-sm font-normal">
                    Stock# {vehicle.stockNumber}
                  </Badge>
                </div>

                <p className="text-lg text-muted-foreground mb-6">{vehicle.trim}</p>

                <div className="text-3xl font-bold text-primary mb-6">{formatCurrency(vehicle.price)}</div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 mr-2 text-muted-foreground flex-shrink-0" />
                    <span className="text-gray-300">{formatNumber(vehicle.mileage)} miles</span>
                  </div>
                  <div className="flex items-center">
                    <Fuel className="h-5 w-5 mr-2 text-muted-foreground flex-shrink-0" />
                    <span className="text-gray-300">{vehicle.fuelType}</span>
                  </div>
                  <div className="flex items-center">
                    <Sliders className="h-5 w-5 mr-2 text-muted-foreground flex-shrink-0" />
                    <span className="text-gray-300">{vehicle.transmission}</span>
                  </div>
                  <div className="flex items-center">
                    <Car className="h-5 w-5 mr-2 text-muted-foreground flex-shrink-0" />
                    <span className="text-gray-300">{vehicle.engine}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <Button className="w-full" size="lg" asChild>
                    <Link href={`/contact?vehicle=${vehicle.id}`}>Contact Dealer</Link>
                  </Button>
                  <Button variant="outline" className="w-full" size="lg" asChild>
                    <Link href={`/contact?vehicle=${vehicle.id}&action=test-drive`}>
                      <Calendar className="h-5 w-5 mr-2" />
                      Schedule Test Drive
                    </Link>
                  </Button>
                  <Button variant="secondary" className="w-full" size="lg">
                    <Info className="h-5 w-5 mr-2" />
                    Request More Info
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="md:mt-8">
        <FAQ />
      </div>
    </div>
  )
}
