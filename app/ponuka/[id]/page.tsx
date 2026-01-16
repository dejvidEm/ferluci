"use client"

import { use, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Car, Check, ChevronLeft, ChevronRight, Fuel, Info, MapPin, Share2, Sliders } from "lucide-react"
import { vehicles } from "@/lib/data"
import { formatCurrency } from "@/lib/utils"
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/ponuka" className="flex items-center text-primary hover:underline">
          <ChevronLeft className="h-4 w-4 mr-1" /> Back to Ponuka
        </Link>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column - Images */}
        <div className="lg:col-span-2">
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl mb-4">
            <Image
              src={vehicle.images[activeImageIndex] || "/placeholder.svg"}
              alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
              fill
              className="object-cover"
            />
            <Button
              variant="secondary"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full opacity-80 hover:opacity-100"
              onClick={prevImage}
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full opacity-80 hover:opacity-100"
              onClick={nextImage}
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          </div>

          <div className="flex overflow-x-auto gap-2 pb-2">
            {vehicle.images.map((image, index) => (
              <div
                key={index}
                className={`relative w-24 h-24 flex-shrink-0 cursor-pointer rounded-xl overflow-hidden ${
                  index === activeImageIndex ? "ring-2 ring-primary" : ""
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

          <Tabs defaultValue="overview" className="mt-8">
            <TabsList className="grid grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="features">Features</TabsTrigger>
              <TabsTrigger value="specs">Specifications</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="pt-4">
              <h3 className="text-xl font-semibold mb-3">Vehicle Description</h3>
              <p className="text-gray-300 mb-6">{vehicle.description}</p>
            </TabsContent>
            <TabsContent value="features" className="pt-4">
              <h3 className="text-xl font-semibold mb-3">Key Features</h3>
              <ul className="grid md:grid-cols-2 gap-2">
                {vehicle.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <Check className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </TabsContent>
            <TabsContent value="specs" className="pt-4">
              <h3 className="text-xl font-semibold mb-3">Vehicle Specifications</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="grid grid-cols-2 gap-2">
                  <div className="font-medium">Make:</div>
                  <div>{vehicle.make}</div>

                  <div className="font-medium">Model:</div>
                  <div>{vehicle.model}</div>

                  <div className="font-medium">Year:</div>
                  <div>{vehicle.year}</div>

                  <div className="font-medium">Trim:</div>
                  <div>{vehicle.trim}</div>

                  <div className="font-medium">Mileage:</div>
                  <div>{vehicle.mileage.toLocaleString()} miles</div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="font-medium">Exterior Color:</div>
                  <div>{vehicle.exteriorColor}</div>

                  <div className="font-medium">Interior Color:</div>
                  <div>{vehicle.interiorColor}</div>

                  <div className="font-medium">Fuel Type:</div>
                  <div>{vehicle.fuelType}</div>

                  <div className="font-medium">Transmission:</div>
                  <div>{vehicle.transmission}</div>

                  <div className="font-medium">Engine:</div>
                  <div>{vehicle.engine}</div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Column - Details and Actions */}
        <div>
          <div className="bg-[#2a0f1a]/50 backdrop-blur-sm rounded-2xl p-6 sticky top-24 border-0">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold">
                {vehicle.year} {vehicle.make} {vehicle.model}
              </h1>
              <Button variant="ghost" size="icon">
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
                <MapPin className="h-5 w-5 mr-2 text-muted-foreground" />
                <span>{vehicle.mileage.toLocaleString()} miles</span>
              </div>
              <div className="flex items-center">
                <Fuel className="h-5 w-5 mr-2 text-muted-foreground" />
                <span>{vehicle.fuelType}</span>
              </div>
              <div className="flex items-center">
                <Sliders className="h-5 w-5 mr-2 text-muted-foreground" />
                <span>{vehicle.transmission}</span>
              </div>
              <div className="flex items-center">
                <Car className="h-5 w-5 mr-2 text-muted-foreground" />
                <span>{vehicle.engine}</span>
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

      {/* FAQ */}
      <FAQ />
    </div>
  )
}
