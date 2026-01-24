"use client"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const faqData = [
  {
    question: "Sú kilometre na vozidlách garantované?",
    answer:
      "Áno. Pri všetkých našich vozidlách garantujeme skutočný nájazd kilometrov.",
  },
  {
    question: "Je možné vozidlo preveriť v autorizovanom servise?",
    answer:
      "Samozrejme. Nemáme žiadny problém s kontrolou vozidla nezávislým technikom ani v autorizovanom servise. Zakladáme si na transparentnosti.",
  },
  {
    question: "Poskytujete záruku na vozidlá?",
    answer:
      "Áno, ponúkame možnosť záruky až na 36 mesiacov. Pre viac informácií o podmienkach nás neváhajte kontaktovať telefonicky.",
  },
  {
    question: "Aké možnosti financovania ponúkate?",
    answer:
      "Zabezpečíme autoúver aj leasing prostredníctvom všetkých dostupných finančných spoločností – rýchlo a bez zbytočných komplikácií.",
  },
  {
    question: "Je možné započítať vozidlo do protihodnoty?",
    answer:
      "Áno, výmena vozidla je možná. Keďže sa špecializujeme výhradne na prémiové jazdené vozidlá, uplatňujeme individuálne podmienky.",
  },
  {
    question: "Vykupujete vozidlá?",
    answer:
      "Áno, ponúkame aj výkup vozidiel. Aj v tomto prípade platia špecifické kritériá zamerané na prémiový segment. Pre viac informácií nás kontaktujte.",
  },
  {
    question: "Viete zabezpečiť exportné značky a dokumenty?",
    answer:
      "Áno. Vozidlá predávame do celej Európy a kompletnú exportnú dokumentáciu vrátane značiek zabezpečíme za vás.",
  },
  {
    question: "Pomáhate s prihlásením vozidla?",
    answer:
      "Samozrejme. U nás nájdete všetko pod jednou strechou – poskytujeme all-inclusive služby vrátane prihlásenia vozidla.",
  },
  {
    question: "Pomáhate s poistením vozidla?",
    answer:
      "Áno. Zabezpečíme pre vás PZP aj havarijné poistenie za výhodné ceny.",
  },
  {
    question: "Viete zabezpečiť servis, detailing alebo ochranu laku?",
    answer:
      "Áno, tieto služby vieme zabezpečiť prostredníctvom overených partnerov.",
  },
  {
    question: "Chcem predať auto. Poskytujete komisionálny predaj?",
    answer:
      "Áno, ponúkame komisionálny predaj vozidiel. Postaráme sa o celý proces – profesionálnu prezentáciu, marketing, komunikáciu so záujemcami aj samotný predaj. Podmienky komisionálneho predaja nastavujeme individuálne podľa typu a hodnoty vozidla.",
  },
]

export default function FAQ() {
  return (
    <section className="py-16 bg-[#121212]">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-100">Často kladené otázky</h2>
          <Accordion type="single" collapsible className="w-full space-y-4">
            {faqData.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="border-white/10 border backdrop-blur-sm rounded-2xl px-6"
              >
                <AccordionTrigger className="text-gray-100 hover:text-primary hover:no-underline text-left">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-300 pb-6">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  )
}

