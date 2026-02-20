"use client"

import { useEffect, useState } from "react"
import VehicleCard from "@/components/vehicle-card"
import { client, featuredVehiclesQuery } from "@/lib/sanity"
import { transformSanityVehicle } from "@/lib/sanity/utils"
import type { Vehicle } from "@/lib/types"
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from "@/components/ui/carousel"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ArrowRight } from "lucide-react"

interface FeaturedVehiclesProps {
  onApiChange?: (api: CarouselApi) => void
}

export default function FeaturedVehicles({ onApiChange }: FeaturedVehiclesProps) {
  const [featuredVehicles, setFeaturedVehicles] = useState<Vehicle[]>([])
  const [api, setApi] = useState<CarouselApi>()
  const [canScrollPrev, setCanScrollPrev] = useState(false)
  const [canScrollNext, setCanScrollNext] = useState(false)

  useEffect(() => {
    async function fetchFeaturedVehicles() {
      try {
        const data = await client.fetch(featuredVehiclesQuery)
        const transformedVehicles = data.map(transformSanityVehicle)
        setFeaturedVehicles(transformedVehicles)
      } catch (error) {
        console.error("Error fetching featured vehicles:", error)
      }
    }
    fetchFeaturedVehicles()
  }, [])

  useEffect(() => {
    if (!api) {
      return
    }

    if (onApiChange) {
      onApiChange(api)
    }

    const updateState = () => {
      setCanScrollPrev(api.canScrollPrev())
      setCanScrollNext(api.canScrollNext())
    }

    updateState()
    api.on("select", updateState)
    api.on("reInit", updateState)

    return () => {
      api.off("select", updateState)
      api.off("reInit", updateState)
    }
  }, [api, onApiChange])

  if (featuredVehicles.length === 0) {
    return null
  }

  return (
    <div className="relative">
      <Carousel
        setApi={setApi}
        opts={{
          align: "start",
          slidesToScroll: 1,
          breakpoints: {
            "(min-width: 768px)": {
              align: "start",
              slidesToScroll: 1,
            },
          },
        }}
        className="w-full overflow-visible"
      >
        <CarouselContent className="-ml-2 md:-ml-4">
          {featuredVehicles.map((vehicle) => (
            <CarouselItem 
              key={vehicle.id} 
              className="pl-2 md:pl-4 basis-[90%] md:basis-1/2 lg:basis-1/3"
            >
              <VehicleCard vehicle={vehicle} />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  )
}
