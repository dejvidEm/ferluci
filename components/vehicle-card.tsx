import Image from "next/image"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Fuel, Info, MapPin } from "lucide-react"
import { formatCurrency, formatNumber } from "@/lib/utils"
import type { Vehicle } from "@/lib/types"

interface VehicleCardProps {
  vehicle: Vehicle
}

export default function VehicleCard({ vehicle }: VehicleCardProps) {
  return (
    <Card className="overflow-hidden">
      <div className="relative aspect-[16/9] overflow-hidden">
        <Image
          src={vehicle.images[0] || "/placeholder.svg"}
          alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
          fill
          className="object-cover transition-transform hover:scale-105"
        />
        {vehicle.featured && <Badge className="absolute top-2 left-2 z-10">Featured</Badge>}
      </div>
      <CardContent className="p-4">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="font-semibold text-lg">
            {vehicle.year} {vehicle.make} {vehicle.model}
          </h3>
          <span className="font-bold text-lg text-primary">{formatCurrency(vehicle.price)}</span>
        </div>
        <p className="text-sm text-muted-foreground mb-4">{vehicle.trim}</p>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center">
            <MapPin className="h-4 w-4 mr-1 text-muted-foreground" />
            <span>{formatNumber(vehicle.mileage)} miles</span>
          </div>
          <div className="flex items-center">
            <Fuel className="h-4 w-4 mr-1 text-muted-foreground" />
            <span>{vehicle.fuelType}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex gap-2">
        <Button asChild variant="outline" className="flex-1">
          <Link href={`/ponuka/${vehicle.id}`}>
            <Info className="h-4 w-4 mr-2" /> Details
          </Link>
        </Button>
        <Button asChild className="flex-1">
          <Link href={`/contact?vehicle=${vehicle.id}`}>Contact</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
