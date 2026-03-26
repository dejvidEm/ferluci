export interface Vehicle {
  id: string
  make: string
  model: string
  year: number
  price: number
  odpocetDph?: boolean
  priceOdpocetDph?: number
  showOldPrice?: boolean
  oldPrice?: number
  mileage: number
  exteriorColor: string
  interiorColor: string
  fuelType: string
  transmission: string
  pohon: string
  engine: string
  vin: string
  stockNumber: string
  description: string
  features: string[]
  images: string[]
  featured: boolean
  /** ISO timestamp when the listing was created in CMS (for sort by listing age) */
  listingCreatedAt?: string
}

export interface FilterOptions {
  make: string[]
  model: string[]
  year: number[]
  priceRange: [number, number]
  mileageRange: [number, number]
}
