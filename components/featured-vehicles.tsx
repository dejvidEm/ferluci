import VehicleCard from "@/components/vehicle-card"
import { vehicles } from "@/lib/data"

export default function FeaturedVehicles() {
  // Get 3 featured vehicles
  const featuredVehicles = vehicles.filter((vehicle) => vehicle.featured).slice(0, 3)

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {featuredVehicles.map((vehicle) => (
        <VehicleCard key={vehicle.id} vehicle={vehicle} />
      ))}
    </div>
  )
}
