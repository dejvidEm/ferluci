import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Car,
  DollarSign,
  Wrench,
  FileText,
  Shield,
  TrendingUp,
  Clock,
  CheckCircle,
  ArrowRight,
} from "lucide-react"
import FAQ from "@/components/faq"

export default function ServicesPage() {
  const services = [
    {
      icon: Car,
      title: "Predaj nových vozidiel",
      description:
        "Prehľadajte našu rozsiahlu ponuku úplne nových vozidiel od popredných výrobcov. Ponúkame najnovšie modely s najmodernejšou technológiou a funkciami.",
      features: ["Najnovšie modely", "Továrenská záruka", "Individuálne objednávky", "Možnosti výmeny"],
    },
    {
      icon: Car,
      title: "Predaj ojazdených vozidiel",
      description:
        "Kvalitné ojazdené vozidlá, ktoré boli dôkladne skontrolované a certifikované. Získajte prémiovú kvalitu za skvelú cenu.",
      features: ["Certifikované ojazdené", "História vozidiel", "Kvalitná kontrola", "Záručné možnosti"],
    },
    {
      icon: DollarSign,
      title: "Finančné riešenia",
      description:
        "Flexibilné finančné možnosti prispôsobené vášmu rozpočtu. Naši finanční odborníci vám pomôžu nájsť najlepšie úrokové sadzby a podmienky.",
      features: ["Konkurencieschopné sadzby", "Flexibilné podmienky", "Rýchle schválenie", "Viacerí veritelia"],
    },
    {
      icon: Wrench,
      title: "Servis a údržba",
      description:
        "Odborný servis a údržba pre všetky značky a modely. Udržujte svoje vozidlo v perfektnom stave s našimi certifikovanými technikmi.",
      features: ["Odborní technici", "Originálne diely", "Rýchly servis", "Záručné krytie"],
    },
    {
      icon: FileText,
      title: "Ocenenie vozidla",
      description:
        "Získajte spravodlivú trhovú hodnotu pre vaše súčasné vozidlo. Naši odborníci poskytnú rýchle a presné ocenenie.",
      features: ["Spravodlivé ocenenie", "Rýchly proces", "Viaceré možnosti", "Okamžité ponuky"],
    },
    {
      icon: Shield,
      title: "Predĺžená záruka",
      description:
        "Chráňte svoju investíciu komplexnými možnosťami predĺženej záruky. Jazdite s istotou, vediac, že ste chránení.",
      features: ["Komplexné krytie", "Flexibilné plány", "Celonárodný servis", "Pokojná myseľ"],
    },
  ]

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative w-full py-24 bg-gradient-to-b from-black via-[#2a0f1a] to-[#4a1a2a]">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">Naše služby</h1>
            <p className="text-xl text-gray-200 mb-8">
              Komplexné automobilové riešenia na uspokojenie všetkých vašich potrieb týkajúcich sa vozidiel, od nákupu až po údržbu a ďalšie.
            </p>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16 bg-[#121212]">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => {
              const Icon = service.icon
              return (
                <div
                  key={index}
                  className="bg-[#2a0f1a]/50 backdrop-blur-sm p-8 rounded-2xl border-0 hover:bg-[#2a0f1a]/70 transition-colors"
                >
                  <div className="bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                    <Icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-gray-100">{service.title}</h3>
                  <p className="text-gray-300 mb-6">{service.description}</p>
                  <ul className="space-y-2 mb-6">
                    {service.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start text-sm text-gray-300">
                        <CheckCircle className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/contact">
                      Zistiť viac <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              )
            })}
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
      <section className="py-16 bg-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ste pripravení začať?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Kontaktujte nás ešte dnes, aby ste sa dozvedeli viac o našich službách alebo si objednali termín.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/contact">Kontaktovať nás</Link>
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/20" asChild>
              <Link href="/ponuka">Prehľadať ponuku</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <FAQ />
    </div>
  )
}

