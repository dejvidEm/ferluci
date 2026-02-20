"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Car, ChevronRight, ArrowLeft, ArrowRight } from "lucide-react"
import FeaturedVehicles from "@/components/featured-vehicles"
import FAQ from "@/components/faq"
import Testimonials from "@/components/testimonials"
import HomeSearch from "@/components/home-search"
import { AuroraText } from "@/components/ui/aurora-text"
import { client, homePageQuery } from "@/lib/sanity"
import type { HomePageData } from "@/lib/sanity/utils"
import type { CarouselApi } from "@/components/ui/carousel"

export default function Home() {
  const [pageData, setPageData] = useState<HomePageData | null>(null)
  const [loading, setLoading] = useState(true)
  const [carouselApi, setCarouselApi] = useState<CarouselApi>()
  const [canScrollPrev, setCanScrollPrev] = useState(false)
  const [canScrollNext, setCanScrollNext] = useState(false)

  useEffect(() => {
    async function fetchHomePageData() {
      try {
        const data = await client.fetch(homePageQuery)
        setPageData(data)
      } catch (error) {
        console.error("Error fetching home page data:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchHomePageData()
  }, [])

  const defaultData: HomePageData = {
    heroSubheading: "Vitajte vo Ferlucicars",
    heroHeading: "Nájdite svoje ideálne vozidlo",
    heroHighlightedWord: "ideálne",
    heroDescription1: "Ponúkame starostlivo vybrané vozidlá s overeným pôvodom, kompletnou servisnou históriou a garanciou kvality.",
    heroDescription2: "Pomôžeme vám vybrať auto, ktoré presne zodpovedá vašim potrebám a očakávaniam.",
    servicesSection: {
      title: "Naše služby",
      serviceCards: [
        {
          title: "Široký výber",
          description: "Prehľadajte našu rozsiahlu ponuku nových a ojazdených vozidiel od popredných výrobcov."
        },
        {
          title: "Finančné možnosti",
          description: "Získajte konkurencieschopné úrokové sadzby a flexibilné podmienky prispôsobené vášmu rozpočtu a potrebám."
        },
        {
          title: "Záručné krytie",
          description: "Jazdite s istotou, vediac, že vaše vozidlo je chránené našimi komplexnými záručnými možnosťami."
        }
      ]
    }
  }

  const data = pageData || defaultData

  // Extract the highlighted word from heading if present
  const getHeadingParts = (heading: string, highlightedWord?: string) => {
    if (!highlightedWord) {
      return [heading]
    }
    // Create a regex that matches the word case-insensitively
    const regex = new RegExp(`(${highlightedWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'i')
    const parts = heading.split(regex)
    return parts.filter(part => part.length > 0) // Remove empty strings
  }
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative w-full min-h-screen flex overflow-hidden -mt-28 md:-mt-24">
        {/* Video Background - full width */}
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          poster="/banner2.png"
          className="absolute inset-0 w-full h-full object-cover object-center z-0"
        >
          <source src="/video/final.mp4" type="video/mp4" />
        </video>

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-[#121212]/50 to-[#121212]/40 md:from-black/60 md:via-[#121212]/70 md:to-[#121212] z-10"></div>

        {/* Content - Left side */}
        <div className="relative z-20 flex-1 flex flex-col justify-center px-4 md:pl-16 md:pr-4 py-24 md:py-32">
          {/* Subheading */}
          <p className="text-base md:text-lg text-gray-300 mb-4">{data.heroSubheading || "Vitajte vo Ferlucicars"}</p>

          {/* Heading */}
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-3 md:mb-8">
            {getHeadingParts(data.heroHeading || "Nájdite svoje ideálne vozidlo", data.heroHighlightedWord).map((part, index) => {
              const highlightedWord = data.heroHighlightedWord || ""
              const shouldHighlight = highlightedWord && part.toLowerCase() === highlightedWord.toLowerCase()
              return shouldHighlight ? (
                <AuroraText key={index} speed={2000} colors={["#ef4444", "#dc2626", "#b91c1c", "#991b1b"]}>
                  {part}
                </AuroraText>
              ) : (
                <span key={index}>{part}</span>
              )
            })}
          </h1>

          <p className="text-sm md:text-lg text-gray-300 max-w-3xl md:mb-2 mb-8">{data.heroDescription1 || "Ponúkame starostlivo vybrané vozidlá s overeným pôvodom, kompletnou servisnou históriou a garanciou kvality."}</p>
          {data.heroDescription2 && (
            <p className="hidden md:flex text-sm md:text-lg text-gray-300 max-w-3xl mb-8">{data.heroDescription2}</p>
          )}
          {/* CTA Buttons */}
          <div className="mb-8 md:mb-24 flex gap-4">
            <Button size="lg" asChild>
              <Link href="/ponuka">Prehľadať ponuku</Link>
            </Button>
            <Button size="lg" variant="outline" className="bg-transparent border border-white/30 text-white hover:bg-white/10" asChild>
              <Link href="/contact">Kontaktovať</Link>
            </Button>
          </div>

          {/* 4 Square Cards with Glassmorphism */}

        </div>
      </section>

      {/* Quick Search */}
      <HomeSearch />

      {/* Featured Vehicles */}
      <section className="py-16 bg-[#121212] relative z-30">
        <div className="container mx-auto px-4 overflow-visible">
          <div className="flex justify-between items-center mb-10 relative z-10">
            <h2 className="text-3xl font-bold">Odporúčané vozidlá</h2>
            <div className="flex items-center gap-2">
              {/* Navigation arrows - top right on desktop */}
              <div className="hidden md:flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 rounded-full border border-white/40"
                  disabled={!canScrollPrev}
                  onClick={() => carouselApi?.scrollPrev()}
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span className="sr-only">Predchádzajúce vozidlo</span>
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 rounded-full border border-white/40"
                  disabled={!canScrollNext}
                  onClick={() => carouselApi?.scrollNext()}
                >
                  <ArrowRight className="h-4 w-4" />
                  <span className="sr-only">Ďalšie vozidlo</span>
                </Button>
              </div>
              <Button variant="ghost" asChild className="hidden md:flex">
                <Link href="/ponuka" className="flex items-center">
                  Zobraziť všetko <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
          <FeaturedVehicles 
            onApiChange={(api) => {
              setCarouselApi(api)
              if (api) {
                setCanScrollPrev(api.canScrollPrev())
                setCanScrollNext(api.canScrollNext())
                api.on("select", () => {
                  setCanScrollPrev(api.canScrollPrev())
                  setCanScrollNext(api.canScrollNext())
                })
                api.on("reInit", () => {
                  setCanScrollPrev(api.canScrollPrev())
                  setCanScrollNext(api.canScrollNext())
                })
              }
            }}
          />
          <div className="flex justify-center mt-6 md:hidden">
            <Button variant="ghost" asChild>
              <Link href="/ponuka" className="flex items-center">
                Zobraziť všetko <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Services */}
      {data.servicesSection && (
        <section className="pt-28 pb-48 bg-[#121212] relative overflow-hidden">
          <div className="container mx-auto px-4 relative z-10">
            <h2 className="text-3xl font-bold text-center mb-12">{data.servicesSection.title || "Naše služby"}</h2>
            <div className="grid md:grid-cols-3 gap-8 relative">
              {/* Red gradient blobs behind cards */}
              <div className="absolute -top-20 -left-20 w-64 h-64 bg-gradient-to-br from-red-600/30 via-red-500/20 to-transparent rounded-full blur-3xl pointer-events-none"></div>
              <div className="absolute top-10 right-1/4 w-80 h-80 bg-gradient-to-br from-red-700/25 via-red-600/15 to-transparent rounded-full blur-3xl pointer-events-none"></div>
              <div className="absolute -bottom-20 -right-20 w-72 h-72 bg-gradient-to-tl from-red-600/30 via-red-500/20 to-transparent rounded-full blur-3xl pointer-events-none"></div>

              {data.servicesSection.serviceCards?.map((card, index) => (
                <div key={index} className="relative bg-white/5 backdrop-blur-md p-8 rounded-2xl text-center border border-white/10 shadow-lg">
                  <div className="bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    {index === 0 ? (
                      <Car className="h-8 w-8 text-primary" />
                    ) : index === 1 ? (
                      <svg className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    ) : (
                      <svg className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                        />
                      </svg>
                    )}
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-gray-100">{card.title}</h3>
                  <p className="text-gray-300">{card.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Testimonials */}
      <Testimonials />

      {/* CTA */}
      <section className="relative py-16 text-white overflow-hidden">
        {/* Background Image */}
        <Image
          src="/banner.jpg"
          alt="CTA Background"
          fill
          className="object-cover z-0"
          priority
        />
        {/* Black Overlay */}
        <div className="absolute inset-0 bg-black/80 z-10"></div>
        {/* Content */}
        <div className="container mx-auto px-4 text-center relative z-20">
          <h2 className="text-3xl font-bold mb-6">Ste pripravení nájsť svoje vysnívané auto?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Navštívte náš showroom ešte dnes alebo prehľadajte našu online ponuku a nájdite ideálne vozidlo pre váš životný štýl a rozpočet.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="outline" className="border border-white/10 text-white hover:bg-white/20" asChild>
              <Link href="/ponuka">Prehľadať ponuku</Link>
            </Button>
            <Button size="lg" variant="outline" className="border border-white/10 text-white hover:bg-white/20" asChild>
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
