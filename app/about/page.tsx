"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Car, Award, Users, Shield, TrendingUp, Heart } from "lucide-react"
import FAQ from "@/components/faq"
import { useEffect, useMemo, useState } from "react"
import { client, aboutPageQuery } from "@/lib/sanity"
import { AboutPageData, getImageUrl } from "@/lib/sanity/utils"
import { useLocale } from "@/lib/i18n/context"
import { localizeAboutPage } from "@/lib/sanity/localize"
import { defaultAboutEn, defaultAboutSk } from "@/lib/i18n/about-defaults"

export default function AboutPage() {
  const { locale, t } = useLocale()
  const [pageData, setPageData] = useState<AboutPageData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchPageData() {
      try {
        const data = await client.fetch(aboutPageQuery)
        setPageData(data)
      } catch (error) {
        console.error("Error fetching about page data:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchPageData()
  }, [])

  const data = useMemo(() => {
    const base = pageData ?? (locale === "en" ? defaultAboutEn : defaultAboutSk)
    return pageData ? localizeAboutPage(pageData, locale) : base
  }, [pageData, locale])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-400">{t("common.loading")}</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative w-full py-24 overflow-hidden">
        <Image
          src={data.heroImage ? getImageUrl(data.heroImage) : "/about.jpeg"}
          alt={t("about.pageBgAlt")}
          fill
          className="object-cover z-0"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/70 to-black/80 z-10"></div>
        <div className="container mx-auto px-4 relative z-20">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">{data.heroTitle}</h1>
            <p className="text-xl text-gray-200 mb-8">{data.heroDescription}</p>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-16 bg-[#121212]">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-100">{data.valuesSection?.title}</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {data.valuesSection?.values?.map((value, index) => {
              const icons = [Shield, Award, Heart]
              const Icon = icons[index] || Shield
              return (
                <div key={index} className="bg-[#2a0f1a]/50 backdrop-blur-sm p-8 rounded-2xl text-center border-0">
                  <div className="bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-gray-100">{value.title}</h3>
                  <p className="text-gray-300">{value.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 bg-[#121212]">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-100">{data.whyChooseSection?.title}</h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {data.whyChooseSection?.items?.map((item, index) => {
              const icons = [Car, TrendingUp, Users, Shield]
              const Icon = icons[index] || Car
              return (
                <div key={index} className="flex items-start space-x-4">
                  <div className="bg-primary/10 w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2 text-gray-100">{item.title}</h3>
                    <p className="text-gray-300">{item.description}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-16 text-white overflow-hidden">
        <Image
          src={data.ctaSection?.image ? getImageUrl(data.ctaSection.image) : "/banner.jpg"}
          alt={t("about.ctaBgAlt")}
          fill
          className="object-cover z-0"
          priority
        />
        <div className="absolute inset-0 bg-black/80 z-10"></div>
        <div className="container mx-auto px-4 text-center relative z-20">
          <h2 className="text-3xl font-bold mb-6">{data.ctaSection?.title}</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">{data.ctaSection?.description}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/20" asChild>
              <Link href="/ponuka">{t("common.browseOffer")}</Link>
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/20" asChild>
              <Link href="/contact">{t("common.contactUsLong")}</Link>
            </Button>
          </div>
        </div>
      </section>

      <FAQ />
    </div>
  )
}
