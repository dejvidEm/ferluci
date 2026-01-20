import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Car, Award, Users, Shield, TrendingUp, Heart } from "lucide-react"
import FAQ from "@/components/faq"

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative w-full py-24 bg-gradient-to-b from-black via-[#2a0f1a] to-[#4a1a2a]">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">O Ferlucicars</h1>
            <p className="text-xl text-gray-200 mb-8">
              Váš dôveryhodný partner pri hľadaní ideálneho vozidla, ktoré zodpovedá vášmu životnému štýlu a prekračuje vaše očakávania.
            </p>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16 bg-[#121212]">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-6 text-gray-100">Náš príbeh</h2>
            <div className="space-y-4 text-gray-300">
              <p>
                Ferlucicars bol založený s jednoduchou misiou: zrevolucionizovať zážitok z nákupu auta poskytovaním
                výnimočných služieb, prémiových vozidiel a neporovnateľnej spokojnosti zákazníkov. Veríme, že hľadanie vášho
                ideálneho auta by malo byť vzrušujúca cesta, nie stresujúca skúška.
              </p>
              <p>
                S ročnými skúsenosťami v automobilovom priemysle si náš tím vybudoval povesť integrity,
                transparentnosti a oddanosti našim zákazníkom. Starostlivo vyberáme našu ponuku, aby zahŕňala iba
                najlepšie vozidlá od popredných výrobcov, čím zabezpečujeme kvalitu a spoľahlivosť v každom aute, ktoré ponúkame.
              </p>
              <p>
                V Ferlucicars nielenže predávame autá—budujeme vzťahy. Naša záväzok sa rozširuje za hranice predaja,
                poskytujeme pokračujúcu podporu, servisné služby a finančné možnosti prispôsobené vašim potrebám.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-16 bg-[#121212]">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-100">Naše základné hodnoty</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-[#2a0f1a]/50 backdrop-blur-sm p-8 rounded-2xl text-center border-0">
              <div className="bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-100">Integrita</h3>
              <p className="text-gray-300">
                Podnikáme s úprimnosťou a transparentnosťou, zabezpečujeme, aby každá transakcia bola spravodlivá a priamočiara.
              </p>
            </div>
            <div className="bg-[#2a0f1a]/50 backdrop-blur-sm p-8 rounded-2xl text-center border-0">
              <div className="bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Award className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-100">Vynikajúca kvalita</h3>
              <p className="text-gray-300">
                Usilujeme sa o vynikajúcu kvalitu v každom aspekte našej služby, od výberu vozidiel až po starostlivosť o zákazníkov.
              </p>
            </div>
            <div className="bg-[#2a0f1a]/50 backdrop-blur-sm p-8 rounded-2xl text-center border-0">
              <div className="bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Heart className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-100">Zákazník na prvom mieste</h3>
              <p className="text-gray-300">
                Vaša spokojnosť je naša najvyššia priorita. Ideme nad rámec, aby sme vám zabezpečili najlepší zážitok.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 bg-[#121212]">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-100">Prečo si vybrať Ferlucicars?</h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div className="flex items-start space-x-4">
              <div className="bg-primary/10 w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0">
                <Car className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2 text-gray-100">Prémiový výber</h3>
                <p className="text-gray-300">
                  Naša starostlivo vybraná ponuka obsahuje iba najlepšie vozidlá od popredných výrobcov, čím zabezpečujeme
                  kvalitu a spoľahlivosť.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="bg-primary/10 w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2 text-gray-100">Konkurencieschopné ceny</h3>
                <p className="text-gray-300">
                  Ponúkame konkurencieschopné ceny a flexibilné finančné možnosti, aby bolo vaše vysnívané auto dostupné.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="bg-primary/10 w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2 text-gray-100">Odborný tím</h3>
                <p className="text-gray-300">
                  Náš znalý predajný tím je tu, aby vám pomohol nájsť ideálne vozidlo a odpovedal na všetky vaše
                  otázky.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="bg-primary/10 w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2 text-gray-100">Záruka a podpora</h3>
                <p className="text-gray-300">
                  Komplexné záručné krytie a pokračujúca podpora, aby ste mali pokojnú myseľ dlho po vašom nákupe.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ste pripravení nájsť svoje ideálne auto?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Navštívte naše autosalóny alebo prehľadajte našu online ponuku a objavte svoje ďalšie vozidlo.
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

