"use client"

import { useState, useEffect } from "react"
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from "@/components/ui/carousel"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ArrowRight } from "lucide-react"

const testimonials = [
  {
    id: 1,
    text: "Tím v tomto autosalóne urobil kúpu auta tak jednoduchou. Boli znalí, priateľskí a vôbec neboli dotieraví. Milujem svoje nové auto!",
    author: "Sarah T.",
  },
  {
    id: 2,
    text: "Vynikajúca služba od začiatku až do konca. Pomohli mi nájsť presne to, čo som hľadal, a za skvelú cenu. Určite sa vrátim!",
    author: "Martin K.",
  },
  {
    id: 3,
    text: "Profesionálny prístup a transparentné podmienky. Finančné riešenie bolo rýchle a jednoduché. Odporúčam všetkým!",
    author: "Jana M.",
  },
  {
    id: 4,
    text: "Najlepšia skúsenosť s nákupom auta, akú som kedy mal. Tím bol veľmi nápomocný a auto je v perfektnom stave.",
    author: "Peter D.",
  },
  {
    id: 5,
    text: "Rýchly a bezproblémový proces. Všetko bolo vysvetlené jasne a auto presahuje moje očakávania. Ďakujem!",
    author: "Lucia S.",
  },
  {
    id: 6,
    text: "Skvelá komunikácia a flexibilita. Pomohli mi nájsť ideálne vozidlo pre moju rodinu. Veľmi spokojný zákazník!",
    author: "Tomáš H.",
  },
  {
    id: 7,
    text: "Výborná kvalita vozidiel a profesionálna obsluha. Servis bol na najvyššej úrovni. Určite odporúčam!",
    author: "Eva V.",
  },
]

export default function Testimonials() {
  const [api, setApi] = useState<CarouselApi>()
  const [canScrollPrev, setCanScrollPrev] = useState(false)
  const [canScrollNext, setCanScrollNext] = useState(false)
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    if (!api) {
      return
    }

    setCanScrollPrev(api.canScrollPrev())
    setCanScrollNext(api.canScrollNext())
    setCurrent(api.selectedScrollSnap())

    api.on("select", () => {
      setCanScrollPrev(api.canScrollPrev())
      setCanScrollNext(api.canScrollNext())
      setCurrent(api.selectedScrollSnap())
    })
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
                  <p className="text-gray-300 mb-4">{testimonial.text}</p>
                  <div className="font-semibold text-gray-100">{testimonial.author}</div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          {/* Dots indicator */}
          <div className="flex justify-center gap-2 mt-6">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => api?.scrollTo(index)}
                className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                  current === index
                    ? "w-8 bg-primary"
                    : "w-2 bg-gray-600 hover:bg-gray-500"
                }`}
                aria-label={`Prejsť na recenziu ${index + 1}`}
              />
            ))}
          </div>
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
      </div>
    </section>
  )
}

