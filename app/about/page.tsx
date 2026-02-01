"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Car, Award, Users, Shield, TrendingUp, Heart } from "lucide-react"
import FAQ from "@/components/faq"
import { useEffect, useState } from "react"
import { client, aboutPageQuery } from "@/lib/sanity"
import { AboutPageData, getImageUrl } from "@/lib/sanity/utils"

export default function AboutPage() {
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-400">Načítavanie...</p>
      </div>
    )
  }

  const defaultData: AboutPageData = {
    heroTitle: "O Ferlucicars",
    heroDescription: "Váš dôveryhodný partner pri hľadaní ideálneho vozidla, ktoré zodpovedá vášmu životnému štýlu a prekračuje vaše očakávania.",
    storySection: {
      title: "Náš príbeh",
      paragraphs: [
        "Ferlucicars bol založený s jednoduchou misiou: zrevolucionizovať zážitok z nákupu auta poskytovaním výnimočných služieb, prémiových vozidiel a neporovnateľnej spokojnosti zákazníkov. Veríme, že hľadanie vášho ideálneho auta by malo byť vzrušujúca cesta, nie stresujúca skúška.",
        "S ročnými skúsenosťami v automobilovom priemysle si náš tím vybudoval povesť integrity, transparentnosti a oddanosti našim zákazníkom. Starostlivo vyberáme našu ponuku, aby zahŕňala iba najlepšie vozidlá od popredných výrobcov, čím zabezpečujeme kvalitu a spoľahlivosť v každom aute, ktoré ponúkame.",
        "V Ferlucicars nielenže predávame autá—budujeme vzťahy. Naša záväzok sa rozširuje za hranice predaja, poskytujeme pokračujúcu podporu, servisné služby a finančné možnosti prispôsobené vašim potrebám.",
      ],
    },
    valuesSection: {
      title: "Naše základné hodnoty",
      values: [
        { title: "Integrita", description: "Podnikáme s úprimnosťou a transparentnosťou, zabezpečujeme, aby každá transakcia bola spravodlivá a priamočiara." },
        { title: "Vynikajúca kvalita", description: "Usilujeme sa o vynikajúcu kvalitu v každom aspekte našej služby, od výberu vozidiel až po starostlivosť o zákazníkov." },
        { title: "Zákazník na prvom mieste", description: "Vaša spokojnosť je naša najvyššia priorita. Ideme nad rámec, aby sme vám zabezpečili najlepší zážitok." },
      ],
    },
    whyChooseSection: {
      title: "Prečo si vybrať Ferlucicars?",
      items: [
        { title: "Prémiový výber", description: "Naša starostlivo vybraná ponuka obsahuje iba najlepšie vozidlá od popredných výrobcov, čím zabezpečujeme kvalitu a spoľahlivosť." },
        { title: "Konkurencieschopné ceny", description: "Ponúkame konkurencieschopné ceny a flexibilné finančné možnosti, aby bolo vaše vysnívané auto dostupné." },
        { title: "Odborný tím", description: "Náš znalý predajný tím je tu, aby vám pomohol nájsť ideálne vozidlo a odpovedal na všetky vaše otázky." },
        { title: "Záruka a podpora", description: "Komplexné záručné krytie a pokračujúca podpora, aby ste mali pokojnú myseľ dlho po vašom nákupe." },
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
          src={data.heroImage ? getImageUrl(data.heroImage) : "/about.jpeg"}
          alt="About Background"
          fill
          className="object-cover z-0"
          priority
        />
        {/* Dark Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/70 to-black/80 z-10"></div>
        {/* Content */}
        <div className="container mx-auto px-4 relative z-20">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">{data.heroTitle || "O Ferlucicars"}</h1>
            <p className="text-xl text-gray-200 mb-8">
              {data.heroDescription || "Váš dôveryhodný partner pri hľadaní ideálneho vozidla, ktoré zodpovedá vášmu životnému štýlu a prekračuje vaše očakávania."}
            </p>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-16 bg-[#121212]">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-100">{data.valuesSection?.title || "Naše základné hodnoty"}</h2>
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
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-100">{data.whyChooseSection?.title || "Prečo si vybrať Ferlucicars?"}</h2>
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

