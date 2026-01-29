"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import {
  Car,
  DollarSign,
  Shield,
  TrendingUp,
  Clock,
} from "lucide-react"
import FAQ from "@/components/faq"
import { useEffect, useState } from "react"
import { client, servicesPageQuery } from "@/lib/sanity"
import { ServicesPageData, getImageUrl } from "@/lib/sanity/utils"

export default function ServicesPage() {
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-400">Načítavanie...</p>
      </div>
    )
  }

  const defaultData: ServicesPageData = {
    heroTitle: "Naše služby",
    serviceCards: [
      { title: "Predaj", description: "Ponúkame rýchly výkup, možnosť započítania auta do protihodnoty aj komisionálny predaj s kompletným servisom a maximálnou transparentnosťou." },
      { title: "Výkup", description: "Ponúkame rýchly výkup, možnosť započítania auta do protihodnoty aj komisionálny predaj s kompletným servisom a maximálnou transparentnosťou." },
      { title: "Komisionálny predaj", description: "Ponúkame rýchly výkup, možnosť započítania auta do protihodnoty aj komisionálny predaj s kompletným servisom a maximálnou transparentnosťou." },
    ],
    financingSection: {
      title: "Financovanie",
      description: "Zabezpečíme autoúver aj leasing cez všetky finančné spoločnosti – rýchlo, flexibilne a aj online.",
    },
    warrantySection: {
      title: "Záručné krytie",
      description: "Ponúkame možnosť záruky až na 36 mesiacov, aby ste si mohli svoje vozidlo užívať bez starostí.",
    },
    showroomSection: {
      title: "SHOWROOM",
      description: "V našom showroome spájame výber prémiových vozidiel s osobným prístupom a maximálnym komfortom pri kúpe.",
    },
    benefitsSection: {
      title: "VÝHODY A ZĽAVY",
      description: "Kúpou vozidla u nás sa spolupráca nekončí. Našim klientom ponúkame zvýhodnené podmienky v licencovanom BMW servise, zľavy na prezutie, detailing, ochranné fólie a ďalšie služby spojené so starostlivosťou o vozidlo.",
    },
    whyChooseSection: {
      title: "Prečo si vybrať naše služby?",
      items: [
        { title: "Rýchle a efektívne", description: "Vážime si váš čas a pracujeme efektívne, aby sme vás dostali na cestu čo najrýchlejšie." },
        { title: "Najlepšia hodnota", description: "Konkurencieschopné ceny a flexibilné možnosti zabezpečujú, že získate najlepšiu hodnotu za vašu investíciu." },
        { title: "Dôveryhodná služba", description: "Ročné skúsenosti a tisíce spokojných zákazníkov svedčia o našej oddanosti vynikajúcej kvalite." },
      ],
    },
    ctaSection: {
      title: "Ste pripravení nájsť svoje vysnívané auto?",
      description: "Navštívte naše autosalóny ešte dnes alebo prehľadajte našu online ponuku a nájdite ideálne vozidlo pre váš životný štýl a rozpočet.",
    },
  }

  const data = pageData || defaultData
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative w-full py-24 overflow-hidden">
        {/* Background Image */}
        <Image
          src={data.heroImage ? getImageUrl(data.heroImage) : "/banner.jpg"}
          alt="Services Background"
          fill
          className="object-cover z-0"
          priority
        />
        {/* Dark Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/70 to-black/80 z-10"></div>
        {/* Content */}
        <div className="container mx-auto px-4 relative z-20">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">{data.heroTitle || "Naše služby"}</h1>
          </div>
        </div>
      </section>

      {/* First Section: 3 Cards - Predaj, Výkup, Komisionálny predaj */}
      <section className="py-16 bg-[#121212]">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {data.serviceCards?.map((card, index) => (
              <div key={index} className="bg-[#2a0f1a]/50 backdrop-blur-sm p-8 rounded-2xl border-0 hover:bg-[#2a0f1a]/70 transition-colors">
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

      {/* Second Section: Financovanie and Záručné krytie with Image */}
      <section className="py-16 bg-[#121212]">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto items-center">
            {/* Left Side: Text Content */}
            <div className="space-y-12">
              {/* Financovanie */}
              {data.financingSection && (
                <div>
                  <div className="bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                    <DollarSign className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-2xl font-semibold mb-4 text-gray-100">{data.financingSection.title}</h3>
                  <p className="text-gray-300 text-lg">{data.financingSection.description}</p>
                </div>
              )}

              {/* Záručné krytie */}
              {data.warrantySection && (
                <div>
                  <div className="bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                    <Shield className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-2xl font-semibold mb-4 text-gray-100">{data.warrantySection.title}</h3>
                  <p className="text-gray-300 text-lg">{data.warrantySection.description}</p>
                </div>
              )}
            </div>

            {/* Right Side: Image */}
            <div className="relative h-[600px] rounded-2xl overflow-hidden">
              <Image
                src={data.financingSection?.image ? getImageUrl(data.financingSection.image) : "/banner.jpg"}
                alt="Financovanie a záručné krytie"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Third Section: Showroom and Výhody a zľavy with Image */}
      <section className="py-16 bg-[#121212]">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto items-center">
            {/* Left Side: Image */}
            <div className="relative h-[600px] rounded-2xl overflow-hidden order-2 md:order-1">
              <Image
                src={data.showroomSection?.image ? getImageUrl(data.showroomSection.image) : "/banner.jpg"}
                alt="Showroom a výhody"
                fill
                className="object-cover"
              />
            </div>

            {/* Right Side: Text Content */}
            <div className="space-y-12 order-1 md:order-2">
              {/* SHOWROOM */}
              {data.showroomSection && (
                <div>
                  <div className="bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                    <Car className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-2xl font-semibold mb-4 text-gray-100">{data.showroomSection.title}</h3>
                  <p className="text-gray-300 text-lg">{data.showroomSection.description}</p>
                </div>
              )}

              {/* VÝHODY A ZĽAVY */}
              {data.benefitsSection && (
                <div>
                  <div className="bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                    <TrendingUp className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-2xl font-semibold mb-4 text-gray-100">{data.benefitsSection.title}</h3>
                  <p className="text-gray-300 text-lg">{data.benefitsSection.description}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Our Services */}
      <section className="py-16 bg-[#121212]">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12 text-gray-100">{data.whyChooseSection?.title || "Prečo si vybrať naše služby?"}</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {data.whyChooseSection?.items?.map((item, index) => {
                const icons = [Clock, TrendingUp, Shield]
                const Icon = icons[index] || Clock
                return (
                  <div key={index} className="text-center">
                    <div className="bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Icon className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2 text-gray-100">{item.title}</h3>
                    <p className="text-gray-300">{item.description}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      {/* CTA */}
      <section className="relative py-16 text-white overflow-hidden">
        {/* Background Image */}
        <Image
          src={data.ctaSection?.image ? getImageUrl(data.ctaSection.image) : "/banner.jpg"}
          alt="CTA Background"
          fill
          className="object-cover z-0"
          priority
        />
        {/* Black Overlay */}
        <div className="absolute inset-0 bg-black/80 z-10"></div>
        {/* Content */}
        <div className="container mx-auto px-4 text-center relative z-20">
          <h2 className="text-3xl font-bold mb-6">{data.ctaSection?.title || "Ste pripravení nájsť svoje vysnívané auto?"}</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            {data.ctaSection?.description || "Navštívte naše autosalóny ešte dnes alebo prehľadajte našu online ponuku a nájdite ideálne vozidlo pre váš životný štýl a rozpočet."}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/20" asChild>
              <Link href="/ponuka">Prehľadať ponuku</Link>
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/20" asChild>
              <Link href="/contact">Kontaktovať nás</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <FAQ />
    </div>
  )
}

