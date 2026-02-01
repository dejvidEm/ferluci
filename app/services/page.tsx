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
      {
        title: "Predaj",
        description:
          "Ponúkame starostlivo vybrané vozidlá z našej ponuky s overeným pôvodom, jasnou históriou a dôrazom na kvalitu a transparentnosť."
      },
      {
        title: "Výkup",
        description:
          "Vykúpime vaše vozidlo rýchlo a férovo, s možnosťou okamžitej platby alebo započítania auta do protihodnoty."
      },
      {
        title: "Komisionálny predaj",
        description:
          "Zabezpečíme komisionálny predaj vášho vozidla s kompletným servisom, profesionálnou prezentáciou a maximálnou transparentnosťou."
      }
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
      description: "Navštívte náš showroom ešte dnes alebo prehľadajte našu online ponuku a nájdite ideálne vozidlo pre váš životný štýl a rozpočet.",
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

      {/* Second Section: 4 Sections in 2x2 Grid */}
      <section className="pt-24 pb-48 bg-[#121212] relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto relative">
            {/* Red gradient blobs behind cards */}
            <div className="absolute -top-20 -left-20 w-32 h-32 bg-gradient-to-br from-red-600/30 via-red-500/20 to-transparent rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute top-10 right-1/4 w-80 h-80 bg-gradient-to-br from-red-700/25 via-red-600/15 to-transparent rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute -bottom-20 -right-20 w-72 h-72 bg-gradient-to-tl from-red-600/30 via-red-500/20 to-transparent rounded-full blur-3xl pointer-events-none"></div>

            {/* Financovanie */}
            {data.financingSection && (
              <div className="relative bg-white/5 backdrop-blur-md p-8 rounded-2xl text-center border border-white/10 shadow-lg">
                <div className="bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <DollarSign className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-100">{data.financingSection.title}</h3>
                <p className="text-gray-300">{data.financingSection.description}</p>
              </div>
            )}

            {/* Záručné krytie */}
            {data.warrantySection && (
              <div className="relative bg-white/5 backdrop-blur-md p-8 rounded-2xl text-center border border-white/10 shadow-lg">
                <div className="bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-100">{data.warrantySection.title}</h3>
                <p className="text-gray-300">{data.warrantySection.description}</p>
              </div>
            )}

            {/* SHOWROOM */}
            {data.showroomSection && (
              <div className="relative bg-white/5 backdrop-blur-md p-8 rounded-2xl text-center border border-white/10 shadow-lg">
                <div className="bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Car className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-100">{data.showroomSection.title}</h3>
                <p className="text-gray-300">{data.showroomSection.description}</p>
              </div>
            )}

            {/* VÝHODY A ZĽAVY */}
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
            {data.ctaSection?.description || "Navštívte náš showroom ešte dnes alebo prehľadajte našu online ponuku a nájdite ideálne vozidlo pre váš životný štýl a rozpočet."}
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

