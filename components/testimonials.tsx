"use client"

import { useState, useEffect } from "react"
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from "@/components/ui/carousel"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ArrowRight } from "lucide-react"
import Link from "next/link"

// Function to truncate text to a consistent length
const truncateText = (text: string, maxLength: number = 200): string => {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength).trim() + "..."
}

const testimonials = [
  {
    id: 1,
    text: truncateText("Moderný koncept predaja kvalitných a hodnotných aut. Autá sú v interiéri, čisté, nachystané na obhliadku s možnosťou skúšobnej jazdy. Príjemný personál s ochotou so všetkým pomôcť a vysvetliť. Auto si môžete dať preveriť nezávislým technikom, sú otvorení a transparentní."),
    author: "Roman Vaľo",
    date: "pred 2 mesiacmi",
  },
  {
    id: 2,
    text: truncateText("Veľká spokojnosť pri kúpe auta od Ferluci Cars priamo z ich ponuky vozidiel. Od prvého telefonátu bol pán predajca veľmi milý, ústretový, a hlavne nápomocný pri výbere. Aj napriek odporúčaniam a recenziám som si dal auto preveriť nezávislým technikom, všetko bolo v naprostom poriadku presne tak ako bolo sľúbené, boli ochotní počkať s predajom po zaplatení malej zálohy aj napriek viacerým záujemcom. Dokonca som dostal k autu veci ktoré mi predajca vôbec dávať nemusel. Celý proces kúpy a prepisu prebehol veľmi rýchlo v podstate bez čakania. Rozhodne moja doteraz najlepšia skúsenosť pri kúpe auta, ak hľadáte seriózneho predajcu ktorý sa na vás nesnaží len zarobiť a urobí všetko k vašej spokojnosti, ste na správnom mieste 👍"),
    author: "Noro",
    date: "pred 2 mesiacmi",
  },
  {
    id: 3,
    text: truncateText("Výnimočný predajca s nadštandardným prístupom. Ak hľadáte predajcu áut, ktorý sa o vás postará od A po Z ešte aj po kúpe, Ferluci cars je tá správna voľba. Moja skúsenosť je absolútne nadštandardná a som z prístupu tohto tímu úprimne prekvapený. Kúpa auta, ktoré sa nachádzalo na druhej strane republiky, by bola pre mňa komplikovaná. Tím Ferluci cars však prebral celú réžiu na seba. Nielenže mi sprostredkovali a zmanažovali obhliadku, ale auto aj dôkladne skontrolovali, čo mi dodalo istotu. Celý proces od previerky, cez vybavenie prepisu až po pomoc s poistkou prebehol hladko a bez akýchkoľvek starostí z mojej strany. Oceňujem, že ich záujem nekončí podpisom zmluvy. Sú k dispozícii aj po kúpe a je vidieť, že im naozaj záleží na tom, aby ste boli s autom spokojní. Ich prístup je plný ochoty a profesionality, čo sa dnes len tak nevidí!!! Jednoznačne odporúčam Ferluci cars každému, kto hľadá nielen auto, ale aj spoľahlivého partnera, ktorý vám poskytne záruku po predaji. Služby tejto firmy sú skutočne na vysokej úrovni a chválim aj veľmi pekný show room v Petržalke. Oplatí sa ísť pozrieť!"),
    author: "Vladimír Ziman",
    date: "pred 4 mesiacmi",
  },
  {
    id: 4,
    text: truncateText("Som naozaj rád že som narazil na túto firmu. V dnešnej dobe málokde stretnete predajcu aut s takýmto prístupom. Priestory aj autá naozaj na vysokej úrovni. Všetko čisté, upravené, profesionálne. Ponuknú vám nápoj, kávu, všetko vysvetlia. Fakt som bol z mojej návštevy ich showroomu milo prekvapený. Prajem vám veľa spokojných zákazníkov a nech sa darí."),
    author: "Maroš Minárik",
    date: "pred 2 mesiacmi",
  },
]

const GOOGLE_REVIEWS_URL = "https://www.google.com/search?sca_esv=13dc0417b6064a80&sxsrf=ANbL-n5wg5hYof6wywhwFBWA3jD2AKtAqA:1770318207216&si=AL3DRZEsmMGCryMMFSHJ3StBhOdZ2-6yYkXd_doETEE1OR-qOQm-Dfahy1rOlhINpTMoLWO-Dd01cUdAC6yhBcTSBop-iFxkrQXzMD7ski6wQgB1nRhk0OOOxJ2qWyg5TCxvz0DxHYHG&q=Ferluci+Cars+Recenze&sa=X&ved=2ahUKEwjPmoWfhcOSAxUSTVUIHe2qCUgQ0bkNegQIJxAF&biw=1548&bih=1268&dpr=1"

export default function Testimonials() {
  const [api, setApi] = useState<CarouselApi>()
  const [canScrollPrev, setCanScrollPrev] = useState(false)
  const [canScrollNext, setCanScrollNext] = useState(false)
  const [current, setCurrent] = useState(0)
  const [slidesCount, setSlidesCount] = useState(0)

  useEffect(() => {
    if (!api) {
      return
    }

    const updateState = () => {
      setCanScrollPrev(api.canScrollPrev())
      setCanScrollNext(api.canScrollNext())
      setCurrent(api.selectedScrollSnap())
      // Get the number of slides from scroll snap list
      const snapList = api.scrollSnapList()
      setSlidesCount(snapList.length)
    }

    updateState()

    api.on("select", updateState)
    api.on("reInit", updateState)

    return () => {
      api.off("select", updateState)
      api.off("reInit", updateState)
    }
  }, [api])

  return (
    <section className="py-16 bg-[#121212]">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">Čo hovoria naši zákazníci</h2>
        <Carousel
          setApi={setApi}
          opts={{
            align: "start",
            slidesToScroll: 1,
          }}
          className="w-full max-w-7xl mx-auto"
        >
          <CarouselContent className="-ml-2 md:-ml-4">
            {testimonials.map((testimonial) => (
              <CarouselItem key={testimonial.id} className="pl-2 md:pl-4 md:basis-1/3">
                <div className="bg-[#2a0f1a]/50 backdrop-blur-sm p-8 rounded-2xl shadow-sm border-0 h-full">
                  <div className="flex items-center text-amber-400 mb-4">
                    {[...Array(5)].map((_, j) => (
                      <svg key={j} className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-gray-300 mb-4 min-h-[120px]">{testimonial.text}</p>
                  <div className="font-semibold text-gray-100 mb-1">{testimonial.author}</div>
                  {testimonial.date && (
                    <div className="text-sm text-gray-400">{testimonial.date}</div>
                  )}
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          {/* Dots indicator */}
          {slidesCount > 0 && (
            <div className="flex justify-center gap-2 mt-6">
              {Array.from({ length: slidesCount }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => api?.scrollTo(index)}
                  className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                    current === index
                      ? "w-8 bg-primary"
                      : "w-2 bg-gray-600 hover:bg-gray-500"
                  }`}
                  aria-label={`Prejsť na slide ${index + 1}`}
                />
              ))}
            </div>
          )}
          {/* Navigation arrows below the carousel */}
          <div className="flex justify-center gap-4 mt-4">
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10 rounded-full"
              disabled={!canScrollPrev}
              onClick={() => api?.scrollPrev()}
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Predchádzajúca recenzia</span>
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10 rounded-full"
              disabled={!canScrollNext}
              onClick={() => api?.scrollNext()}
            >
              <ArrowRight className="h-4 w-4" />
              <span className="sr-only">Ďalšia recenzia</span>
            </Button>
          </div>
        </Carousel>
        {/* View All Reviews Button */}
        <div className="flex justify-center mt-8">
          <Button
            variant="outline"
            className="border-primary text-primary hover:bg-primary hover:text-white"
            asChild
          >
            <Link href={GOOGLE_REVIEWS_URL} target="_blank" rel="noopener noreferrer">
              Zobraziť všetky recenzie
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}

