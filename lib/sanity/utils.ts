import type { Vehicle } from '@/lib/types'
import { urlFor } from './image'

export interface GalleryImage {
  id: string
  title: string
  src: string
  alt: string
}

export interface SanityGalleryImage {
  _id: string
  title: string
  image: {
    _type: 'image'
    asset: any
    alt?: string
  }
  order?: number
}

export interface SanityVehicle {
  _id: string
  id?: string
  make: string
  model: string
  year: number
  price: number
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
  images: Array<{
    _type: 'image'
    asset: any
    alt?: string
  }>
  featured: boolean
  slug: string
}

export function transformSanityVehicle(vehicle: SanityVehicle): Vehicle {
  return {
    id: vehicle._id,
    make: vehicle.make,
    model: vehicle.model,
    year: vehicle.year,
    price: vehicle.price,
    showOldPrice: vehicle.showOldPrice || false,
    oldPrice: vehicle.oldPrice,
    mileage: vehicle.mileage,
    exteriorColor: vehicle.exteriorColor,
    interiorColor: vehicle.interiorColor,
    fuelType: vehicle.fuelType,
    transmission: vehicle.transmission,
    pohon: vehicle.pohon,
    engine: vehicle.engine,
    vin: vehicle.vin,
    stockNumber: vehicle.stockNumber,
    description: vehicle.description,
    features: vehicle.features || [],
    images: vehicle.images && vehicle.images.length > 0
      ? vehicle.images.map((img) => {
          try {
            return urlFor(img).width(800).height(600).url()
          } catch (error) {
            console.error('Error generating image URL:', error)
            return '/placeholder.svg'
          }
        })
      : ['/placeholder.svg'],
    featured: vehicle.featured || false,
  }
}

export function transformSanityGalleryImage(galleryImage: SanityGalleryImage): GalleryImage {
  return {
    id: galleryImage._id,
    title: galleryImage.title,
    src: galleryImage.image
      ? (() => {
          try {
            return urlFor(galleryImage.image).width(1200).height(1200).url()
          } catch (error) {
            console.error('Error generating gallery image URL:', error)
            return '/placeholder.svg'
          }
        })()
      : '/placeholder.svg',
    alt: galleryImage.image?.alt || galleryImage.title || 'Gallery image',
  }
}

