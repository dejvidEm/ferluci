"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Car, DollarSign, Shield, TrendingUp } from "lucide-react"
import FAQ from "@/components/faq"
import { useEffect, useMemo, useState } from "react"
import { client, servicesPageQuery } from "@/lib/sanity"
import { ServicesPageData, getImageUrl } from "@/lib/sanity/utils"
import { useLocale } from "@/lib/i18n/context"
import { localizeServicesPage } from "@/lib/sanity/localize"
import { defaultServicesEn, defaultServicesSk } from "@/lib/i18n/services-defaults"

export default function ServicesPage() {
  const { locale, t } = useLocale()
  const [pageData, setPageData] = useState<ServicesPageData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchPageData() {
      try {
        const data = await client.fetch(servicesPageQuery)
        setPageData(data)
      } catch (error) {
        console.error("Error fetching services page data:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchPageData()
  }, [])

  const data = useMemo(() => {
    const base = pageData ?? (locale === "en" ? defaultServicesEn : defaultServicesSk)
    return pageData ? localizeServicesPage(pageData, locale) : base
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
      <section className="relative w-full py-24 overflow-hidden">
        <Image
          src={data.heroImage ? getImageUrl(data.heroImage) : "/banner.jpg"}
          alt={t("servicesPage.heroBgAlt")}
          fill
          className="object-cover z-0"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/70 to-black/80 z-10"></div>
        <div className="container mx-auto px-4 relative z-20">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">{data.heroTitle}</h1>
          </div>
        </div>
      </section>

      <section className="py-16 bg-[#121212]">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {data.serviceCards?.map((card, index) => (
              <div
                key={index}
                className="bg-[#2a0f1a]/50 backdrop-blur-sm p-8 rounded-2xl border-0 hover:bg-[#2a0f1a]/70 transition-colors"
              >
                <div className="bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                  <Car className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-100">{card.title}</h3>
                <p className="text-gray-300">{card.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="pt-24 pb-48 bg-[#121212] relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto relative">
            <div className="absolute -top-20 -left-20 w-32 h-32 bg-gradient-to-br from-red-600/30 via-red-500/20 to-transparent rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute top-10 right-1/4 w-80 h-80 bg-gradient-to-br from-red-700/25 via-red-600/15 to-transparent rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute -bottom-20 -right-20 w-72 h-72 bg-gradient-to-tl from-red-600/30 via-red-500/20 to-transparent rounded-full blur-3xl pointer-events-none"></div>

            {data.financingSection && (
              <div className="relative bg-white/5 backdrop-blur-md p-8 rounded-2xl text-center border border-white/10 shadow-lg">
                <div className="bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <DollarSign className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-100">{data.financingSection.title}</h3>
                <p className="text-gray-300">{data.financingSection.description}</p>
              </div>
            )}

            {data.warrantySection && (
              <div className="relative bg-white/5 backdrop-blur-md p-8 rounded-2xl text-center border border-white/10 shadow-lg">
                <div className="bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-100">{data.warrantySection.title}</h3>
                <p className="text-gray-300">{data.warrantySection.description}</p>
              </div>
            )}

            {data.showroomSection && (
              <div className="relative bg-white/5 backdrop-blur-md p-8 rounded-2xl text-center border border-white/10 shadow-lg">
                <div className="bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Car className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-100">{data.showroomSection.title}</h3>
                <p className="text-gray-300">{data.showroomSection.description}</p>
              </div>
            )}

            {data.benefitsSection && (
              <div className="relative bg-white/5 backdrop-blur-md p-8 rounded-2xl text-center border border-white/10 shadow-lg">
                <div className="bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-100">{data.benefitsSection.title}</h3>
                <p className="text-gray-300">{data.benefitsSection.description}</p>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="relative py-16 text-white overflow-hidden">
        <Image
          src={data.ctaSection?.image ? getImageUrl(data.ctaSection.image) : "/banner.jpg"}
          alt={t("servicesPage.ctaBgAlt")}
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
