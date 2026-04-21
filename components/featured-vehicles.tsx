"use client"

import { useEffect, useState } from "react"
import VehicleCard from "@/components/vehicle-card"
import { client, featuredVehiclesQuery, recentVehiclesQuery } from "@/lib/sanity"
import { transformSanityVehicle } from "@/lib/sanity/utils"
import type { Vehicle } from "@/lib/types"
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from "@/components/ui/carousel"
import { cn } from "@/lib/utils"

interface FeaturedVehiclesProps {
  onApiChange?: (api: CarouselApi | undefined) => void
  /** Home page header: hide carousel arrows when ≤ 2 */
  onCountChange?: (count: number) => void
}

export default function FeaturedVehicles({ onApiChange, onCountChange }: FeaturedVehiclesProps) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [api, setApi] = useState<CarouselApi>()

  useEffect(() => {
    async function fetchVehicles() {
      try {
        const featured = await client.fetch(featuredVehiclesQuery)
        if (featured && featured.length > 0) {
          setVehicles(featured.map(transformSanityVehicle))
          return
        }
        const recent = await client.fetch(recentVehiclesQuery)
        setVehicles((recent ?? []).map(transformSanityVehicle))
      } catch (error) {
        console.error("Error fetching featured / recent vehicles:", error)
      }
    }
    fetchVehicles()
  }, [])

  useEffect(() => {
    onCountChange?.(vehicles.length)
  }, [vehicles.length, onCountChange])

  useEffect(() => {
    if (!onApiChange) return
    if (vehicles.length <= 2) {
      onApiChange(undefined)
    } else {
      onApiChange(api)
    }
  }, [vehicles.length, api, onApiChange])

  if (vehicles.length === 0) {
    return null
  }

  const fewCards = vehicles.length <= 2

  if (fewCards) {
    return (
      <div className="flex justify-center px-1">
        <div
          className={cn(
            "flex w-full max-w-5xl flex-col items-center gap-6 md:gap-8 sm:flex-row sm:flex-wrap sm:justify-center"
          )}
        >
          {vehicles.map((vehicle) => (
            <div
              key={vehicle.id}
              className={cn(
                "w-full max-w-md shrink-0",
                vehicles.length === 2 && "sm:w-[min(22rem,calc(50vw-2.5rem))]"
              )}
            >
              <VehicleCard vehicle={vehicle} />
            </div>
          ))}
        </div>
      </div>
    )
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
          {vehicles.map((vehicle) => (
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
