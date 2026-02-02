import { groq } from 'next-sanity'

export const vehiclesQuery = groq`*[_type == "vehicle"] | order(year desc, _createdAt desc) {
  _id,
  make,
  model,
  year,
  price,
  showOldPrice,
  oldPrice,
  mileage,
  exteriorColor,
  interiorColor,
  fuelType,
  transmission,
  pohon,
  engine,
  vin,
  stockNumber,
  description,
  features,
  images,
  featured,
  "slug": slug.current
}`

export const vehicleBySlugQuery = groq`*[_type == "vehicle" && slug.current == $slug][0] {
  _id,
  make,
  model,
  year,
  price,
  showOldPrice,
  oldPrice,
  mileage,
  exteriorColor,
  interiorColor,
  fuelType,
  transmission,
  pohon,
  engine,
  vin,
  stockNumber,
  description,
  features,
  images,
  featured,
  "slug": slug.current
}`

export const vehicleByIdQuery = groq`*[_type == "vehicle" && _id == $id][0] {
  _id,
  make,
  model,
  year,
  price,
  showOldPrice,
  oldPrice,
  mileage,
  exteriorColor,
  interiorColor,
  fuelType,
  transmission,
  pohon,
  engine,
  vin,
  stockNumber,
  description,
  features,
  images,
  featured,
  "slug": slug.current
}`

export const featuredVehiclesQuery = groq`*[_type == "vehicle" && featured == true] | order(year desc, _createdAt desc) [0...6] {
  _id,
  make,
  model,
  year,
  price,
  showOldPrice,
  oldPrice,
  mileage,
  exteriorColor,
  interiorColor,
  fuelType,
  transmission,
  pohon,
  engine,
  vin,
  stockNumber,
  description,
  features,
  images,
  featured,
  "slug": slug.current
}`

export const galleryImagesQuery = groq`*[_type == "gallery"] | order(order asc, _createdAt desc) {
  _id,
  title,
  mediaType,
  image,
  video {
    asset-> {
      _id,
      url,
      mimeType,
      size
    }
  },
  videoThumbnail,
  order
}`

export const galleryPageQuery = groq`*[_type == "galleryPage"][0] {
  heroTitle,
  heroDescription,
  heroImage
}`

export const servicesPageQuery = groq`*[_type == "servicesPage"][0] {
  heroTitle,
  heroImage,
  serviceCards[] {
    title,
    description
  },
  financingSection {
    title,
    description,
    image
  },
  warrantySection {
    title,
    description
  },
  showroomSection {
    title,
    description,
    image
  },
  benefitsSection {
    title,
    description
  },
  whyChooseSection {
    title,
    items[] {
      title,
      description
    }
  },
  ctaSection {
    title,
    description,
    image
  }
}`

export const aboutPageQuery = groq`*[_type == "aboutPage"][0] {
  heroTitle,
  heroDescription,
  heroImage,
  valuesSection {
    title,
    values[] {
      title,
      description
    }
  },
  whyChooseSection {
    title,
    items[] {
      title,
      description
    }
  },
  ctaSection {
    title,
    description,
    image
  }
}`

export const faqQuery = groq`*[_type == "faq"][0] {
  title,
  items[] | order(order asc) {
    question,
    answer,
    order
  }
}`

export const contactInfoQuery = groq`*[_type == "contactInfo"][0] {
  address {
    street,
    city,
    postalCode,
    coordinates {
      lat,
      lng
    }
  },
  phone,
  email,
  openingHours {
    mondayFriday,
    saturday,
    sunday
  }
}`

export const homePageQuery = groq`*[_type == "homePage"][0] {
  heroSubheading,
  heroHeading,
  heroHighlightedWord,
  heroDescription1,
  heroDescription2,
  servicesSection {
    title,
    serviceCards[] {
      title,
      description
    }
  }
}`

