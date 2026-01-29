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

export default function ServicesPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative w-full py-24 overflow-hidden">
        {/* Background Image */}
        <Image
          src="/banner.jpg"
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
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">Naše služby</h1>
          </div>
        </div>
      </section>

      {/* First Section: 3 Cards - Predaj, Výkup, Komisionálny predaj */}
      <section className="py-16 bg-[#121212]">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Predaj */}
            <div className="bg-[#2a0f1a]/50 backdrop-blur-sm p-8 rounded-2xl border-0 hover:bg-[#2a0f1a]/70 transition-colors">
              <div className="bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                <Car className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-100">Predaj</h3>
              <p className="text-gray-300">
                Ponúkame rýchly výkup, možnosť započítania auta do protihodnoty aj komisionálny predaj s kompletným servisom a maximálnou transparentnosťou.
              </p>
            </div>

            {/* Výkup */}
            <div className="bg-[#2a0f1a]/50 backdrop-blur-sm p-8 rounded-2xl border-0 hover:bg-[#2a0f1a]/70 transition-colors">
              <div className="bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                <Car className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-100">Výkup</h3>
              <p className="text-gray-300">
                Ponúkame rýchly výkup, možnosť započítania auta do protihodnoty aj komisionálny predaj s kompletným servisom a maximálnou transparentnosťou.
              </p>
            </div>

            {/* Komisionálny predaj */}
            <div className="bg-[#2a0f1a]/50 backdrop-blur-sm p-8 rounded-2xl border-0 hover:bg-[#2a0f1a]/70 transition-colors">
              <div className="bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                <Car className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-100">Komisionálny predaj</h3>
              <p className="text-gray-300">
                Ponúkame rýchly výkup, možnosť započítania auta do protihodnoty aj komisionálny predaj s kompletným servisom a maximálnou transparentnosťou.
              </p>
            </div>
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
              <div>
                <div className="bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                  <DollarSign className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-2xl font-semibold mb-4 text-gray-100">Financovanie</h3>
                <p className="text-gray-300 text-lg">
                  Zabezpečíme autoúver aj leasing cez všetky finančné spoločnosti – rýchlo, flexibilne a aj online.
                </p>
              </div>

              {/* Záručné krytie */}
              <div>
                <div className="bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                  <Shield className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-2xl font-semibold mb-4 text-gray-100">Záručné krytie</h3>
                <p className="text-gray-300 text-lg">
                  Ponúkame možnosť záruky až na 36 mesiacov, aby ste si mohli svoje vozidlo užívať bez starostí.
                </p>
              </div>
            </div>

            {/* Right Side: Image */}
            <div className="relative h-[600px] rounded-2xl overflow-hidden">
              <Image
                src="/banner.jpg"
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
                src="/banner.jpg"
                alt="Showroom a výhody"
                fill
                className="object-cover"
              />
            </div>

            {/* Right Side: Text Content */}
            <div className="space-y-12 order-1 md:order-2">
              {/* SHOWROOM */}
              <div>
                <div className="bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                  <Car className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-2xl font-semibold mb-4 text-gray-100">SHOWROOM</h3>
                <p className="text-gray-300 text-lg">
                  V našom showroome spájame výber prémiových vozidiel s osobným prístupom a maximálnym komfortom pri kúpe.
                </p>
              </div>

              {/* VÝHODY A ZĽAVY */}
              <div>
                <div className="bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                  <TrendingUp className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-2xl font-semibold mb-4 text-gray-100">VÝHODY A ZĽAVY</h3>
                <p className="text-gray-300 text-lg">
                  Kúpou vozidla u nás sa spolupráca nekončí. Našim klientom ponúkame zvýhodnené podmienky v licencovanom BMW servise, zľavy na prezutie, detailing, ochranné fólie a ďalšie služby spojené so starostlivosťou o vozidlo.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Our Services */}
      <section className="py-16 bg-[#121212]">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12 text-gray-100">Prečo si vybrať naše služby?</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-100">Rýchle a efektívne</h3>
                <p className="text-gray-300">
                  Vážime si váš čas a pracujeme efektívne, aby sme vás dostali na cestu čo najrýchlejšie.
                </p>
              </div>
              <div className="text-center">
                <div className="bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-100">Najlepšia hodnota</h3>
                <p className="text-gray-300">
                  Konkurencieschopné ceny a flexibilné možnosti zabezpečujú, že získate najlepšiu hodnotu za vašu investíciu.
                </p>
              </div>
              <div className="text-center">
                <div className="bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-100">Dôveryhodná služba</h3>
                <p className="text-gray-300">
                  Ročné skúsenosti a tisíce spokojných zákazníkov svedčia o našej oddanosti vynikajúcej kvalite.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
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

