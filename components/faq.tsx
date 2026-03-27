"use client"

import { useEffect, useMemo, useState } from "react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { client, faqQuery } from "@/lib/sanity"
import type { FAQData } from "@/lib/sanity/utils"
import { useLocale } from "@/lib/i18n/context"
import { localizeFaq } from "@/lib/sanity/localize"
import { defaultFaqEn, defaultFaqSk } from "@/lib/i18n/faq-defaults"

export default function FAQ() {
  const { locale, t } = useLocale()
  const [cmsFaq, setCmsFaq] = useState<FAQData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchFAQ() {
      try {
        const data = await client.fetch(faqQuery)
        if (data && data.items && data.items.length > 0) {
          setCmsFaq(data)
        }
      } catch (error) {
        console.error("Error fetching FAQ data:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchFAQ()
  }, [])

  const faqData = useMemo(() => {
    if (cmsFaq) return localizeFaq(cmsFaq, locale)
    return locale === "en" ? defaultFaqEn : defaultFaqSk
  }, [cmsFaq, locale])

  if (loading) {
    return (
      <section className="py-16 bg-[#121212]">
        <div className="container mx-auto px-4">
          <p className="text-center text-gray-400">{t("faq.loading")}</p>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 bg-[#121212]">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-100">{faqData.title}</h2>
          <Accordion type="single" collapsible className="w-full space-y-4">
            {faqData.items?.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="border-white/10 border backdrop-blur-sm rounded-2xl px-6"
              >
                <AccordionTrigger className="text-gray-100 hover:text-primary hover:no-underline text-left">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-300 pb-6">{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  )
}
