"use client"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const faqData = [
  {
    question: "Aké finančné možnosti sú k dispozícii?",
    answer:
      "Ponúkame rôzne finančné možnosti vrátane tradičných úverov na auto, lízingových možností a špeciálnych finančných programov. Naši finanční odborníci spolupracujú s viacerými veriteľmi, aby našli najlepšie úrokové sadzby a podmienky, ktoré zodpovedajú vášmu rozpočtu. Ponúkame aj konkurencieschopné sadzby pre zákazníkov s rôznymi kreditnými profilmi.",
  },
  {
    question: "Ponúkate záruky na vozidlá?",
    answer:
      "Áno, ponúkame komplexné záručné krytie pre nové aj ojazdené vozidlá. Naše záručné plány zahŕňajú predĺžené záruky, krytie pohonnej jednotky a kompletnú ochranu. Poskytujeme aj certifikované ojazdené vozidlá, ktoré prichádzajú so zárukami od výrobcu.",
  },
  {
    question: "Môžem vymeniť svoje súčasné vozidlo?",
    answer:
      "Určite! Prijímame výmeny a poskytujeme spravodlivé trhové ocenenia. Naši odborníci vyhodnotia vaše vozidlo a ponúknu vám konkurencieschopnú hodnotu výmeny, ktorá môže byť použitá na váš nový nákup. Proces je rýchly a jednoduchý.",
  },
  {
    question: "Aká je vaša politika vrátenia?",
    answer:
      "Chceme, aby ste boli úplne spokojní so svojím nákupom. Ponúkame záručnú dobu spokojnosti, počas ktorej môžete vrátiť vozidlo v určitom časovom rámci, ak nie ste spokojní. Kontaktujte nás pre konkrétne podmienky a podmienky na základe vášho nákupu.",
  },
  {
    question: "Poskytujete históriu vozidiel?",
    answer:
      "Áno, poskytujeme komplexné správy o histórii vozidiel pre všetky ojazdené vozidlá. Tieto správy zahŕňajú históriu nehôd, servisné záznamy, informácie o vlastníctve a ďalšie. Veríme v úplnú transparentnosť a chceme, aby ste sa rozhodovali informovane.",
  },
  {
    question: "Aké služby ponúkate po kúpe?",
    answer:
      "Ponúkame komplexné popredajné služby vrátane pravidelnej údržby, opráv, výmeny dielov a servisných termínov. Naši certifikovaní technici používajú originálne diely a dodržiavajú špecifikácie výrobcu. Poskytujeme aj asistenciu na ceste a služby kontroly vozidiel.",
  },
  {
    question: "Ako si objednám skúšobnú jazdu?",
    answer:
      "Skúšobnú jazdu si môžete objednať zavolaním nám, použitím nášho online kontaktného formulára alebo návštevou nášho autosalónu. Odporúčame objednať si vopred, aby bolo vozidlo, o ktoré máte záujem, k dispozícii. Skúšobné jazdy sú k dispozícii počas našich otváracích hodín.",
  },
  {
    question: "Doručujete vozidlá?",
    answer:
      "Áno, ponúkame služby doručenia vozidiel v určitom polomere od nášho autosalónu. Možnosti doručenia a poplatky sa líšia podľa polohy. Kontaktujte nás a dohodnite sa na doručení vo vašej oblasti.",
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
                className="bg-[#2a0f1a]/50 backdrop-blur-sm rounded-2xl px-6 border-0"
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

