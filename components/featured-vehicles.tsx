"use client"

import { useEffect, useState } from "react"
import VehicleCard from "@/components/vehicle-card"
import { client, featuredVehiclesQuery } from "@/lib/sanity"
import { transformSanityVehicle } from "@/lib/sanity/utils"
import type { Vehicle } from "@/lib/types"

export default function FeaturedVehicles() {
  const [featuredVehicles, setFeaturedVehicles] = useState<Vehicle[]>([])

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

  if (featuredVehicles.length === 0) {
    return null
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {featuredVehicles.map((vehicle) => (
        <VehicleCard key={vehicle.id} vehicle={vehicle} />
      ))}
    </div>
  )
}
