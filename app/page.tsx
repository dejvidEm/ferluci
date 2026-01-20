import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Car, ChevronRight, Search } from "lucide-react"
import FeaturedVehicles from "@/components/featured-vehicles"
import { Input } from "@/components/ui/input"
import FAQ from "@/components/faq"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative w-full h-screen flex flex-col overflow-hidden">
        {/* Video Background */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover z-0"
        >
          <source src="/video/main.mp4" type="video/mp4" />
        </video>
        
        {/* Overlay - Lighter on mobile for better video visibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-[#2a0f1a]/50 to-[#4a1a2a]/60 md:from-black/60 md:via-[#2a0f1a]/80 md:to-[#4a1a2a]/80 z-10"></div>
        
        {/* Content - Centered Text */}
        <div className="container mx-auto px-4 relative z-20 flex-1 flex items-center justify-center">
          <div className="max-w-3xl text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">Nájdite svoje ideálne vozidlo</h1>
            <p className="text-xl text-gray-200">
              Prehľadajte našu rozsiahlu ponuku prémiových vozidiel a odíďte s istotou.
            </p>
          </div>
        </div>

        {/* Buttons - Bottom (moved higher from bottom edge) */}
        <div className="container mx-auto px-4 relative z-20 pb-16 md:pb-20">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/ponuka">Prehľadať ponuku</Link>
            </Button>
            <Button size="lg" variant="outline" className="bg-white/10 text-white hover:bg-white/20" asChild>
              <Link href="/contact">Kontaktovať nás</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Quick Search */}
      <section className="bg-[#121212] py-8 border-b border-gray-700/50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground z-10" />
                <Input 
                  placeholder="Hľadať podľa značky, modelu alebo kľúčových slov..." 
                  className="pl-10 h-12 bg-[#121212] border border-white/30 text-white placeholder:text-gray-400 focus:border-white/50" 
                />
              </div>
              <Button size="lg" className="h-12">
                <Search className="mr-2 h-5 w-5" /> Hľadať
              </Button>
            </div>
          </div>
        </div>
      </section>

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
      <section className="py-16 bg-[#121212] relative overflow-hidden">
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
      <section className="py-16 bg-[#121212]">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Čo hovoria naši zákazníci</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-[#2a0f1a]/50 backdrop-blur-sm p-8 rounded-2xl shadow-sm border-0">
                <div className="flex items-center text-amber-400 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <svg key={j} className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-300 mb-4">
                  "Tím v tomto autosalóne urobil kúpu auta tak jednoduchou. Boli znalí, priateľskí a vôbec neboli
                  dotieraví. Milujem svoje nové auto!"
                </p>
                <div className="font-semibold text-gray-100">Sarah T.</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ste pripravení nájsť svoje vysnívané auto?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Navštívte naše autosalóny ešte dnes alebo prehľadajte našu online ponuku a nájdite ideálne vozidlo pre váš životný štýl a rozpočet.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild>
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
