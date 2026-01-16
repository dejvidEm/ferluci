export interface Vehicle {
  id: string
  make: string
  model: string
  year: number
  trim: string
  price: number
  mileage: number
  exteriorColor: string
  interiorColor: string
  fuelType: string
  transmission: string
  engine: string
  vin: string
  stockNumber: string
  description: string
  features: string[]
  images: string[]
  featured: boolean
}

export interface FilterOptions {
  make: string[]
  model: string[]
  year: number[]
  priceRange: [number, number]
  mileageRange: [number, number]
}
