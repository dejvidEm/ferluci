import { groq } from 'next-sanity'

export const vehiclesQuery = groq`*[_type == "vehicle"] | order(_createdAt desc) {
  _id,
  _createdAt,
  make,
  model,
  year,
  price,
  odpocetDph,
  priceOdpocetDph,
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
  odpocetDph,
  priceOdpocetDph,
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
  odpocetDph,
  priceOdpocetDph,
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
  odpocetDph,
  priceOdpocetDph,
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
  titleEn,
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
  heroTitleEn,
  heroDescription,
  heroDescriptionEn,
  heroImage
}`

export const servicesPageQuery = groq`*[_type == "servicesPage"][0] {
  heroTitle,
  heroTitleEn,
  heroImage,
  serviceCards[] {
    title,
    titleEn,
    description,
    descriptionEn
  },
  financingSection {
    title,
    titleEn,
    description,
    descriptionEn,
    image
  },
  warrantySection {
    title,
    titleEn,
    description,
    descriptionEn
  },
  showroomSection {
    title,
    titleEn,
    description,
    descriptionEn,
    image
  },
  benefitsSection {
    title,
    titleEn,
    description,
    descriptionEn
  },
  whyChooseSection {
    title,
    titleEn,
    items[] {
      title,
      titleEn,
      description,
      descriptionEn
    }
  },
  ctaSection {
    title,
    titleEn,
    description,
    descriptionEn,
    image
  }
}`

export const aboutPageQuery = groq`*[_type == "aboutPage"][0] {
  heroTitle,
  heroTitleEn,
  heroDescription,
  heroDescriptionEn,
  heroImage,
  valuesSection {
    title,
    titleEn,
    values[] {
      title,
      titleEn,
      description,
      descriptionEn
    }
  },
  whyChooseSection {
    title,
    titleEn,
    items[] {
      title,
      titleEn,
      description,
      descriptionEn
    }
  },
  ctaSection {
    title,
    titleEn,
    description,
    descriptionEn,
    image
  }
}`

export const faqQuery = groq`*[_type == "faq"][0] {
  title,
  titleEn,
  items[] | order(order asc) {
    question,
    questionEn,
    answer,
    answerEn,
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
    sunday,
    mondayFridayEn,
    saturdayEn,
    sundayEn
  }
}`

export const homePageQuery = groq`*[_type == "homePage"][0] {
  heroSubheading,
  heroSubheadingEn,
  heroHeading,
  heroHeadingEn,
  heroHighlightedWord,
  heroHighlightedWordEn,
  heroDescription1,
  heroDescription1En,
  heroDescription2,
  heroDescription2En,
  servicesSection {
    title,
    titleEn,
    serviceCards[] {
      title,
      titleEn,
      description,
      descriptionEn
    }
  }
}`

