"use client"

import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Fuel, Info, MapPin, Cog, Settings } from "lucide-react"
import { formatCurrency, formatNumber, translateFuelType, translateTransmission } from "@/lib/utils"
import type { Vehicle } from "@/lib/types"

interface VehicleCardProps {
  vehicle: Vehicle
  displayMode?: "grid" | "list"
}

export default function VehicleCard({ vehicle, displayMode = "grid" }: VehicleCardProps) {
  const router = useRouter()

  const handleCardClick = () => {
    router.push(`/ponuka/${vehicle.id}`)
  }

  const handleContactClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    router.push(`/contact?vehicle=${vehicle.id}`)
  }

  if (displayMode === "list") {
    return (
      <Card 
        className="relative overflow-hidden cursor-pointer hover:shadow-lg transition-all bg-[#121212] border border-white/20"
        onClick={handleCardClick}
      >
        {/* Red gradient blob at bottom */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-48 h-32 bg-gradient-to-t from-red-600/40 via-red-500/30 to-transparent rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex flex-row relative z-10">
          <div className="relative w-64 h-48 flex-shrink-0 overflow-hidden">
            <Image
              src={vehicle.images[0] || "/placeholder.svg"}
              alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
              fill
              className="object-cover transition-transform hover:scale-105"
            />
            {vehicle.featured && <Badge className="absolute top-2 left-2 z-10">Odporúčané</Badge>}
          </div>
          <div className="flex-1 flex flex-col relative z-10">
            <CardContent className="p-6 flex-1 flex flex-col justify-between">
              <div>
                <div className="mb-2 flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-xl mb-1">
                      {vehicle.year} {vehicle.make} {vehicle.model}
                    </h3>
                  </div>
                  <div className="flex flex-col items-end ml-4">
                    {vehicle.showOldPrice && vehicle.oldPrice && (
                      <span className="text-sm text-muted-foreground line-through mb-1">
                        {formatCurrency(vehicle.oldPrice)}
                      </span>
                    )}
                    <span className="font-bold text-xl text-primary">{formatCurrency(vehicle.price)}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mt-4">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{formatNumber(vehicle.mileage)} km</span>
                  </div>
                  <div className="flex items-center">
                    <Fuel className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{translateFuelType(vehicle.fuelType)}</span>
                  </div>
                  <div className="flex items-center">
                    <Cog className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{vehicle.engine}</span>
                  </div>
                  <div className="flex items-center">
                    <Settings className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{translateTransmission(vehicle.transmission)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="p-6 pt-0 flex gap-2 justify-end" onClick={(e) => e.stopPropagation()}>
              <Button 
                variant="outline" 
                className="flex-1 max-w-[200px]"
                onClick={(e) => {
                  e.stopPropagation()
                  router.push(`/ponuka/${vehicle.id}`)
                }}
              >
                <Info className="h-4 w-4 mr-2" /> Detaily
              </Button>
              <Button 
                className="flex-1 max-w-[200px]"
                onClick={handleContactClick}
              >
                Kontakt
              </Button>
            </CardFooter>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card 
      className="relative overflow-hidden cursor-pointer hover:shadow-lg transition-all bg-[#121212] border border-white/10"
      onClick={handleCardClick}
    >
      {/* Red gradient blob at bottom */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-40 h-24 bg-gradient-to-t from-red-600/40 via-red-500/30 to-transparent rounded-full blur-3xl pointer-events-none z-0"></div>
      <div className="relative aspect-[16/9] overflow-hidden z-10">
        <Image
          src={vehicle.images[0] || "/placeholder.svg"}
          alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
          fill
          className="object-cover transition-transform hover:scale-105"
        />
        {vehicle.featured && <Badge className="absolute top-2 left-2 z-10">Odporúčané</Badge>}
      </div>
      <CardContent className="p-4 relative z-10">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="font-semibold text-lg">
            {vehicle.year} {vehicle.make} {vehicle.model}
          </h3>
          <div className="flex flex-col items-end">
            {vehicle.showOldPrice && vehicle.oldPrice && (
              <span className="text-sm text-muted-foreground line-through mb-1">
                {formatCurrency(vehicle.oldPrice)}
              </span>
            )}
          <span className="font-bold text-lg text-primary">{formatCurrency(vehicle.price)}</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center">
            <MapPin className="h-4 w-4 mr-1 text-muted-foreground" />
            <span>{formatNumber(vehicle.mileage)} km</span>
          </div>
          <div className="flex items-center">
            <Fuel className="h-4 w-4 mr-1 text-muted-foreground" />
            <span>{translateFuelType(vehicle.fuelType)}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex gap-2 relative z-10" onClick={(e) => e.stopPropagation()}>
        <Button 
          variant="outline" 
          className="flex-1"
          onClick={(e) => {
            e.stopPropagation()
            router.push(`/ponuka/${vehicle.id}`)
          }}
        >
          <Info className="h-4 w-4 mr-2" /> Detaily
        </Button>
        <Button 
          className="flex-1"
          onClick={handleContactClick}
        >
          Kontakt
        </Button>
      </CardFooter>
    </Card>
  )
}
