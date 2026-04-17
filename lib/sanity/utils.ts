import type { Vehicle } from '@/lib/types'
import type { Locale } from '@/lib/i18n/config'
import { urlFor } from './image'

export interface GalleryImage {
  id: string
  title: string
  src: string
  alt: string
  type: 'image' | 'video'
  muxPlaybackId?: string
  thumbnail?: string
}

export interface SanityGalleryImage {
  _id: string
  title: string
  titleEn?: string
  mediaType?: 'image' | 'video'
  image?: {
    _type: 'image'
    asset: any
    alt?: string
  }
  muxPlaybackId?: string
  videoThumbnail?: {
    _type: 'image'
    asset: any
    alt?: string
  }
  order?: number
}

export interface SanityVehicle {
  _id: string
  _createdAt?: string
  id?: string
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
    odpocetDph: vehicle.odpocetDph || false,
    priceOdpocetDph: vehicle.priceOdpocetDph,
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
    listingCreatedAt: vehicle._createdAt,
  }
}

export function transformSanityGalleryImage(
  galleryImage: SanityGalleryImage,
  locale?: Locale
): GalleryImage {
  const resolvedTitle =
    locale === "en" && galleryImage.titleEn?.trim()
      ? galleryImage.titleEn.trim()
      : galleryImage.title
  const mediaType = galleryImage.mediaType || (galleryImage.image ? 'image' : 'video')

  if (mediaType === 'video') {
    const muxPlaybackId = galleryImage.muxPlaybackId || ''
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
    
    const muxThumbnail = muxPlaybackId
      ? `https://image.mux.com/${encodeURIComponent(muxPlaybackId)}/thumbnail.jpg?time=1&width=800`
      : undefined

    return {
      id: galleryImage._id,
      title: resolvedTitle,
      src: thumbnail || muxThumbnail || '/placeholder.svg',
      alt: galleryImage.videoThumbnail?.alt || resolvedTitle || 'Gallery video',
      type: 'video',
      muxPlaybackId,
      thumbnail: thumbnail || muxThumbnail,
    }
  }
  
  // Image type
  return {
    id: galleryImage._id,
    title: resolvedTitle,
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
    alt: galleryImage.image?.alt || resolvedTitle || 'Gallery image',
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
    mondayFridayEn?: string
    saturdayEn?: string
    sundayEn?: string
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
    mondayFridayEn?: string
    saturdayEn?: string
    sundayEn?: string
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

