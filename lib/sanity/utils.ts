import type { Vehicle } from '@/lib/types'
import { urlFor } from './image'

export interface GalleryImage {
  id: string
  title: string
  src: string
  alt: string
  type: 'image' | 'video'
  videoUrl?: string
  thumbnail?: string
}

export interface SanityGalleryImage {
  _id: string
  title: string
  mediaType?: 'image' | 'video'
  image?: {
    _type: 'image'
    asset: any
    alt?: string
  }
  video?: {
    asset?: {
      _id: string
      url: string
      mimeType?: string
      size?: number
    }
  }
  videoThumbnail?: {
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
  const mediaType = galleryImage.mediaType || (galleryImage.image ? 'image' : 'video')
  
  if (mediaType === 'video') {
    const videoUrl = galleryImage.video?.asset?.url || ''
    const thumbnail = galleryImage.videoThumbnail
      ? (() => {
          try {
            return urlFor(galleryImage.videoThumbnail).width(1200).height(1200).url()
          } catch (error) {
            console.error('Error generating video thumbnail URL:', error)
            return undefined
          }
        })()
      : undefined
    
    return {
      id: galleryImage._id,
      title: galleryImage.title,
      src: thumbnail || videoUrl, // Use video URL as fallback if no thumbnail
      alt: galleryImage.videoThumbnail?.alt || galleryImage.title || 'Gallery video',
      type: 'video',
      videoUrl,
      thumbnail,
    }
  }
  
  // Image type
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
    type: 'image',
  }
}

export interface SanityImage {
  _type: 'image'
  asset: any
  alt?: string
}

export interface ServicesPageData {
  heroTitle?: string
  heroImage?: SanityImage
  serviceCards?: Array<{
    title: string
    description: string
  }>
  financingSection?: {
    title: string
    description: string
    image?: SanityImage
  }
  warrantySection?: {
    title: string
    description: string
  }
  showroomSection?: {
    title: string
    description: string
    image?: SanityImage
  }
  benefitsSection?: {
    title: string
    description: string
  }
  whyChooseSection?: {
    title: string
    items?: Array<{
      title: string
      description: string
    }>
  }
  ctaSection?: {
    title: string
    description: string
    image?: SanityImage
  }
}

export interface AboutPageData {
  heroTitle?: string
  heroDescription?: string
  heroImage?: SanityImage
  valuesSection?: {
    title: string
    values?: Array<{
      title: string
      description: string
    }>
  }
  whyChooseSection?: {
    title: string
    items?: Array<{
      title: string
      description: string
    }>
  }
  ctaSection?: {
    title: string
    description: string
    image?: SanityImage
  }
}

export function getImageUrl(image: SanityImage | undefined, fallback: string = '/placeholder.svg'): string {
  if (!image) return fallback
  try {
    return urlFor(image).width(1920).height(1080).url()
  } catch (error) {
    console.error('Error generating image URL:', error)
    return fallback
  }
}

export interface FAQData {
  title?: string
  items?: Array<{
    question: string
    answer: string
    order?: number
  }>
}

export interface SanityFAQ {
  title?: string
  items?: Array<{
    question: string
    answer: string
    order?: number
  }>
}

export interface ContactInfo {
  address?: {
    street: string
    city: string
    postalCode: string
    coordinates?: {
      lat: number
      lng: number
    }
  }
  phone?: string
  email?: string
  openingHours?: {
    mondayFriday: string
    saturday: string
    sunday: string
  }
}

export interface SanityContactInfo {
  address?: {
    street: string
    city: string
    postalCode: string
  }
  phone?: string
  email?: string
  openingHours?: {
    mondayFriday: string
    saturday: string
    sunday: string
  }
}

export interface GalleryPageData {
  heroTitle?: string
  heroDescription?: string
  heroImage?: SanityImage
}

export interface HomePageData {
  heroSubheading?: string
  heroHeading?: string
  heroHighlightedWord?: string
  heroDescription1?: string
  heroDescription2?: string
  servicesSection?: {
    title?: string
    serviceCards?: Array<{
      title: string
      description: string
    }>
  }
}

