import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Car, ChevronRight } from "lucide-react"
import FeaturedVehicles from "@/components/featured-vehicles"
import FAQ from "@/components/faq"
import Testimonials from "@/components/testimonials"
import HomeSearch from "@/components/home-search"
import { AuroraText } from "@/components/ui/aurora-text"

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative w-full md:pt-48 md:pb-48 flex overflow-hidden">
        {/* Video Background - full width */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover z-0"
        >
          <source src="/video/main.mp4" type="video/mp4" />
        </video>

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-[#2a0f1a]/30 to-[#4a1a2a]/30 md:from-black/30 md:via-[#2a0f1a]/50 md:to-[#121212] z-10"></div>

        {/* Content - Left side */}
        <div className="relative z-20 flex-1 flex flex-col justify-center px-4 md:pl-16 md:pr-4 py-16">
          {/* Subheading */}
          <p className="text-base md:text-lg text-gray-300 mb-4">Vitajte v Ferlucicars</p>

          {/* Heading */}
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-6 md:mb-12">
            Nájdite svoje <AuroraText speed={2000} colors={["#ef4444", "#dc2626", "#b91c1c", "#991b1b"]}>ideálne</AuroraText> vozidlo
          </h1>

          <p className="text-base md:text-lg text-gray-300 max-w-3xl mb-8">Ponúkame starostlivo vybrané vozidlá s overeným pôvodom, kompletnou servisnou históriou a garanciou kvality. Pomôžeme vám vybrať auto, ktoré presne zodpovedá vašim potrebám a očakávaniam.</p>

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
      <section className="py-16 bg-[#121212]">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-3xl font-bold">Odporúčané vozidlá</h2>
            <Button variant="ghost" asChild>
              <Link href="/ponuka" className="flex items-center">
                Zobraziť všetko <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <FeaturedVehicles />
        </div>
      </section>

      {/* Services */}
      <section className="pt-28 pb-48 bg-[#121212] relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <h2 className="text-3xl font-bold text-center mb-12">Naše služby</h2>
          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Red gradient blobs behind cards */}
            <div className="absolute -top-20 -left-20 w-64 h-64 bg-gradient-to-br from-red-600/30 via-red-500/20 to-transparent rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute top-10 right-1/4 w-80 h-80 bg-gradient-to-br from-red-700/25 via-red-600/15 to-transparent rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute -bottom-20 -right-20 w-72 h-72 bg-gradient-to-tl from-red-600/30 via-red-500/20 to-transparent rounded-full blur-3xl pointer-events-none"></div>

            <div className="relative bg-white/5 backdrop-blur-md p-8 rounded-2xl text-center border border-white/10 shadow-lg">
              <div className="bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Car className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-100">Široký výber</h3>
              <p className="text-gray-300">
                Prehľadajte našu rozsiahlu ponuku nových a ojazdených vozidiel od popredných výrobcov.
              </p>
            </div>
            <div className="relative bg-white/5 backdrop-blur-md p-8 rounded-2xl text-center border border-white/10 shadow-lg">
              <div className="bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-100">Finančné možnosti</h3>
              <p className="text-gray-300">
                Získajte konkurencieschopné úrokové sadzby a flexibilné podmienky prispôsobené vášmu rozpočtu a potrebám.
              </p>
            </div>
            <div className="relative bg-white/5 backdrop-blur-md p-8 rounded-2xl text-center border border-white/10 shadow-lg">
              <div className="bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-100">Záručné krytie</h3>
              <p className="text-gray-300">
                Jazdite s istotou, vediac, že vaše vozidlo je chránené našimi komplexnými záručnými možnosťami.
              </p>
            </div>
          </div>
        </div>
      </section>

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
            Navštívte naše autosalóny ešte dnes alebo prehľadajte našu online ponuku a nájdite ideálne vozidlo pre váš životný štýl a rozpočet.
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
