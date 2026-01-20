"use client"

import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Fuel, Info, MapPin } from "lucide-react"
import { formatCurrency, formatNumber, translateFuelType } from "@/lib/utils"
import type { Vehicle } from "@/lib/types"

interface VehicleCardProps {
  vehicle: Vehicle
}

export default function VehicleCard({ vehicle }: VehicleCardProps) {
  const router = useRouter()

  const handleCardClick = () => {
    router.push(`/ponuka/${vehicle.id}`)
  }

  const handleContactClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    router.push(`/contact?vehicle=${vehicle.id}`)
  }

  return (
    <Card 
      className="overflow-hidden cursor-pointer hover:shadow-lg transition-all"
      onClick={handleCardClick}
    >
      <div className="relative aspect-[16/9] overflow-hidden">
        <Image
          src={vehicle.images[0] || "/placeholder.svg"}
          alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
          fill
          className="object-cover transition-transform hover:scale-105"
        />
        {vehicle.featured && <Badge className="absolute top-2 left-2 z-10">Odporúčané</Badge>}
      </div>
      <CardContent className="p-4">
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
        <p className="text-sm text-muted-foreground mb-4">{vehicle.trim}</p>
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
      <CardFooter className="p-4 pt-0 flex gap-2" onClick={(e) => e.stopPropagation()}>
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
