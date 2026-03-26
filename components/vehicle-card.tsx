"use client"

import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Fuel, Info, MapPin, Cog, Settings, Calendar } from "lucide-react"
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
        className="relative flex h-full flex-col overflow-hidden cursor-pointer hover:shadow-lg transition-all bg-[#121212] border border-white/20"
        onClick={handleCardClick}
      >
        {/* Red gradient blob at bottom */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-48 h-32 bg-gradient-to-t from-red-600/40 via-red-500/30 to-transparent rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex flex-1 flex-row min-h-0 relative z-10">
          <div className="relative w-64 h-48 flex-shrink-0 overflow-hidden">
            <Image
              src={vehicle.images[0] || "/placeholder.svg"}
              alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
              fill
              className="object-cover transition-transform hover:scale-105"
            />
            {vehicle.featured && <Badge className="absolute top-2 left-2 z-10">Odporúčané</Badge>}
          </div>
          <div className="flex min-h-[12rem] min-w-0 flex-1 flex-col relative z-10">
            <CardContent className="flex flex-1 flex-col p-6 pb-0">
              <div className="flex flex-1 flex-col">
                <div className="mb-2 flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-xl leading-snug">
                      {vehicle.make} {vehicle.model}
                    </h3>
                  </div>
                  <div className="flex flex-col items-end ml-2 shrink-0 text-right">
                    {vehicle.showOldPrice && vehicle.oldPrice && (
                      <span className="text-sm text-muted-foreground line-through mb-1">
                        {formatCurrency(vehicle.oldPrice)}
                      </span>
                    )}
                    <span className="font-bold text-xl text-primary">{formatCurrency(vehicle.price)}</span>
                    {vehicle.odpocetDph && vehicle.priceOdpocetDph != null && (
                      <span className="text-xs text-muted-foreground mt-1">
                        Odpočet DPH: {formatCurrency(vehicle.priceOdpocetDph)}
                      </span>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-x-4 gap-y-2 text-sm mt-4">
                  <div className="flex items-center min-w-0 md:col-span-1">
                    <MapPin className="h-4 w-4 mr-2 text-muted-foreground shrink-0" />
                    <span className="whitespace-nowrap tabular-nums">{formatNumber(vehicle.mileage)} km</span>
                  </div>
                  <div className="flex items-center min-w-0">
                    <Fuel className="h-4 w-4 mr-2 text-muted-foreground shrink-0" />
                    <span className="truncate">{translateFuelType(vehicle.fuelType)}</span>
                  </div>
                  <div className="flex items-center min-w-0">
                    <Cog className="h-4 w-4 mr-2 text-muted-foreground shrink-0" />
                    <span className="truncate">{vehicle.engine}</span>
                  </div>
                  <div className="flex items-center min-w-0">
                    <Settings className="h-4 w-4 mr-2 text-muted-foreground shrink-0" />
                    <span className="truncate">{translateTransmission(vehicle.transmission)}</span>
                  </div>
                  <div className="flex items-center justify-start md:justify-end min-w-0 shrink-0">
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground shrink-0" />
                    <span className="tabular-nums whitespace-nowrap">{vehicle.year}</span>
                  </div>
                </div>
                <div className="flex-1 min-h-2" aria-hidden="true" />
              </div>
            </CardContent>
            <CardFooter className="mt-auto border-0 bg-transparent p-6 pt-4 flex gap-2 justify-end" onClick={(e) => e.stopPropagation()}>
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
      className="relative flex h-full flex-col overflow-hidden cursor-pointer hover:shadow-lg transition-all bg-[#121212] border border-white/10"
      onClick={handleCardClick}
    >
      {/* Red gradient blob at bottom */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-40 h-24 bg-gradient-to-t from-red-600/40 via-red-500/30 to-transparent rounded-full blur-3xl pointer-events-none z-0"></div>
      <div className="relative aspect-[16/9] shrink-0 overflow-hidden z-10">
        <Image
          src={vehicle.images[0] || "/placeholder.svg"}
          alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
          fill
          className="object-cover transition-transform hover:scale-105"
        />
        {vehicle.featured && <Badge className="absolute top-2 left-2 z-10">Odporúčané</Badge>}
      </div>
      <CardContent className="flex flex-1 flex-col p-4 pb-0 relative z-10 min-h-0">
        <div className="mb-4 flex items-start justify-between gap-3 min-w-0">
          <h3 className="font-semibold text-lg min-w-0 flex-1 leading-snug">
            {vehicle.make} {vehicle.model}
          </h3>
          <div className="flex flex-col items-end text-right shrink-0">
            {vehicle.showOldPrice && vehicle.oldPrice && (
              <span className="text-sm text-muted-foreground line-through mb-1">
                {formatCurrency(vehicle.oldPrice)}
              </span>
            )}
            <span className="font-bold text-lg text-primary">{formatCurrency(vehicle.price)}</span>
            {vehicle.odpocetDph && vehicle.priceOdpocetDph != null && (
              <span className="text-xs text-muted-foreground mt-0.5">
                Odpočet DPH: {formatCurrency(vehicle.priceOdpocetDph)}
              </span>
            )}
          </div>
        </div>
        <div className="grid grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)_auto] gap-x-2 gap-y-1 items-center text-sm">
          <div className="flex items-center min-w-0">
            <MapPin className="h-4 w-4 mr-1.5 text-muted-foreground shrink-0" />
            <span className="whitespace-nowrap tabular-nums">
              {formatNumber(vehicle.mileage)} km
            </span>
          </div>
          <div className="flex items-center min-w-0">
            <Fuel className="h-4 w-4 mr-1.5 text-muted-foreground shrink-0" />
            <span className="truncate">{translateFuelType(vehicle.fuelType)}</span>
          </div>
          <div className="flex items-center justify-end gap-1.5 pl-1 shrink-0">
            <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="tabular-nums whitespace-nowrap">{vehicle.year}</span>
          </div>
        </div>
        <div className="flex-1 min-h-2" aria-hidden="true" />
      </CardContent>
      <CardFooter className="mt-auto p-4 pt-4 flex gap-2 relative z-10 border-0 bg-transparent" onClick={(e) => e.stopPropagation()}>
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
