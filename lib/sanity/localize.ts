import type { Locale } from "@/lib/i18n/config"
import type {
  AboutPageData,
  ContactInfo,
  FAQData,
  GalleryPageData,
  HomePageData,
  ServicesPageData,
} from "@/lib/sanity/utils"

function str(sk: string | undefined, en: string | undefined, locale: Locale): string | undefined {
  if (locale === "en" && en && en.trim()) return en
  return sk
}

/** Raw CMS shapes include optional *En fields (see GROQ queries). */
export function localizeHomePage(raw: HomePageData, locale: Locale): HomePageData {
  if (locale === "sk") return raw as HomePageData

  const r = raw as HomePageData & {
    heroSubheadingEn?: string
    heroHeadingEn?: string
    heroHighlightedWordEn?: string
    heroDescription1En?: string
    heroDescription2En?: string
  }

  const serviceCards = r.servicesSection?.serviceCards?.map((c) => {
    const x = c as { title: string; description: string; titleEn?: string; descriptionEn?: string }
    return {
      title: str(x.title, x.titleEn, locale) ?? x.title,
      description: str(x.description, x.descriptionEn, locale) ?? x.description,
    }
  })

  const ss = r.servicesSection as
    | (NonNullable<HomePageData["servicesSection"]> & { titleEn?: string })
    | undefined

  return {
    ...r,
    heroSubheading: str(r.heroSubheading, r.heroSubheadingEn, locale) ?? r.heroSubheading,
    heroHeading: str(r.heroHeading, r.heroHeadingEn, locale) ?? r.heroHeading,
    heroHighlightedWord: str(r.heroHighlightedWord, r.heroHighlightedWordEn, locale) ?? r.heroHighlightedWord,
    heroDescription1: str(r.heroDescription1, r.heroDescription1En, locale) ?? r.heroDescription1,
    heroDescription2: str(r.heroDescription2, r.heroDescription2En, locale) ?? r.heroDescription2,
    servicesSection: ss
      ? {
          title: str(ss.title, ss.titleEn, locale) ?? ss.title,
          serviceCards: serviceCards ?? ss.serviceCards,
        }
      : r.servicesSection,
  }
}

export function localizeGalleryPage(
  raw: GalleryPageData & { heroTitleEn?: string; heroDescriptionEn?: string },
  locale: Locale
): GalleryPageData {
  if (locale === "sk") return raw
  return {
    ...raw,
    heroTitle: str(raw.heroTitle, raw.heroTitleEn, locale) ?? raw.heroTitle,
    heroDescription: str(raw.heroDescription, raw.heroDescriptionEn, locale) ?? raw.heroDescription,
  }
}

export function localizeFaq(
  raw: FAQData & {
    titleEn?: string
    items?: Array<{
      question: string
      answer: string
      questionEn?: string
      answerEn?: string
      order?: number
    }>
  },
  locale: Locale
): FAQData {
  if (locale === "sk") return raw as FAQData
  return {
    title: str(raw.title, raw.titleEn, locale) ?? raw.title,
    items: raw.items?.map((item) => {
      const i = item as typeof item & { questionEn?: string; answerEn?: string }
      return {
        question: str(i.question, i.questionEn, locale) ?? i.question,
        answer: str(i.answer, i.answerEn, locale) ?? i.answer,
        order: i.order,
      }
    }),
  }
}

function localizeCard(
  c: { title: string; description: string; titleEn?: string; descriptionEn?: string },
  locale: Locale
) {
  return {
    title: str(c.title, c.titleEn, locale) ?? c.title,
    description: str(c.description, c.descriptionEn, locale) ?? c.description,
  }
}

function localizeWhyItems(
  items: Array<{ title: string; description: string; titleEn?: string; descriptionEn?: string }> | undefined,
  locale: Locale
) {
  return items?.map((i) => localizeCard(i, locale))
}

export function localizeServicesPage(
  raw: ServicesPageData & {
    heroTitleEn?: string
    serviceCards?: Array<{
      title: string
      description: string
      titleEn?: string
      descriptionEn?: string
    }>
    financingSection?: ServicesPageData["financingSection"] & {
      titleEn?: string
      descriptionEn?: string
    }
    warrantySection?: ServicesPageData["warrantySection"] & {
      titleEn?: string
      descriptionEn?: string
    }
    showroomSection?: ServicesPageData["showroomSection"] & {
      titleEn?: string
      descriptionEn?: string
    }
    benefitsSection?: ServicesPageData["benefitsSection"] & {
      titleEn?: string
      descriptionEn?: string
    }
    whyChooseSection?: ServicesPageData["whyChooseSection"] & {
      titleEn?: string
      items?: Array<{
        title: string
        description: string
        titleEn?: string
        descriptionEn?: string
      }>
    }
    ctaSection?: ServicesPageData["ctaSection"] & {
      titleEn?: string
      descriptionEn?: string
    }
  },
  locale: Locale
): ServicesPageData {
  if (locale === "sk") return raw as ServicesPageData

  const financing = raw.financingSection
  const warranty = raw.warrantySection
  const showroom = raw.showroomSection
  const benefits = raw.benefitsSection
  const why = raw.whyChooseSection
  const cta = raw.ctaSection

  return {
    ...raw,
    heroTitle: str(raw.heroTitle, raw.heroTitleEn, locale) ?? raw.heroTitle,
    serviceCards: raw.serviceCards?.map((c) => localizeCard(c, locale)),
    financingSection: financing
      ? {
          ...financing,
          title: str(financing.title, financing.titleEn, locale) ?? financing.title,
          description: str(financing.description, financing.descriptionEn, locale) ?? financing.description,
        }
      : financing,
    warrantySection: warranty
      ? {
          ...warranty,
          title: str(warranty.title, warranty.titleEn, locale) ?? warranty.title,
          description: str(warranty.description, warranty.descriptionEn, locale) ?? warranty.description,
        }
      : warranty,
    showroomSection: showroom
      ? {
          ...showroom,
          title: str(showroom.title, showroom.titleEn, locale) ?? showroom.title,
          description: str(showroom.description, showroom.descriptionEn, locale) ?? showroom.description,
        }
      : showroom,
    benefitsSection: benefits
      ? {
          ...benefits,
          title: str(benefits.title, benefits.titleEn, locale) ?? benefits.title,
          description: str(benefits.description, benefits.descriptionEn, locale) ?? benefits.description,
        }
      : benefits,
    whyChooseSection: why
      ? {
          title: str(why.title, why.titleEn, locale) ?? why.title,
          items: localizeWhyItems(why.items, locale),
        }
      : why,
    ctaSection: cta
      ? {
          ...cta,
          title: str(cta.title, cta.titleEn, locale) ?? cta.title,
          description: str(cta.description, cta.descriptionEn, locale) ?? cta.description,
        }
      : cta,
  }
}

export function localizeAboutPage(
  raw: AboutPageData & {
    heroTitleEn?: string
    heroDescriptionEn?: string
    valuesSection?: AboutPageData["valuesSection"] & {
      titleEn?: string
      values?: Array<{
        title: string
        description: string
        titleEn?: string
        descriptionEn?: string
      }>
    }
    whyChooseSection?: AboutPageData["whyChooseSection"] & {
      titleEn?: string
      items?: Array<{
        title: string
        description: string
        titleEn?: string
        descriptionEn?: string
      }>
    }
    ctaSection?: AboutPageData["ctaSection"] & {
      titleEn?: string
      descriptionEn?: string
    }
  },
  locale: Locale
): AboutPageData {
  if (locale === "sk") return raw as AboutPageData

  const vs = raw.valuesSection
  const why = raw.whyChooseSection
  const cta = raw.ctaSection

  return {
    ...raw,
    heroTitle: str(raw.heroTitle, raw.heroTitleEn, locale) ?? raw.heroTitle,
    heroDescription: str(raw.heroDescription, raw.heroDescriptionEn, locale) ?? raw.heroDescription,
    valuesSection: vs
      ? {
          title: str(vs.title, vs.titleEn, locale) ?? vs.title,
          values: localizeWhyItems(vs.values, locale),
        }
      : vs,
    whyChooseSection: why
      ? {
          title: str(why.title, why.titleEn, locale) ?? why.title,
          items: localizeWhyItems(why.items, locale),
        }
      : why,
    ctaSection: cta
      ? {
          ...cta,
          title: str(cta.title, cta.titleEn, locale) ?? cta.title,
          description: str(cta.description, cta.descriptionEn, locale) ?? cta.description,
        }
      : cta,
  }
}

export function localizeContactInfo(info: ContactInfo, locale: Locale): ContactInfo {
  if (locale === "sk" || !info.openingHours) return info
  const oh = info.openingHours
  return {
    ...info,
    openingHours: {
      mondayFriday: oh.mondayFridayEn ?? oh.mondayFriday,
      saturday: oh.saturdayEn ?? oh.saturday,
      sunday: oh.sundayEn ?? oh.sunday,
      mondayFridayEn: oh.mondayFridayEn,
      saturdayEn: oh.saturdayEn,
      sundayEn: oh.sundayEn,
    },
  }
}
