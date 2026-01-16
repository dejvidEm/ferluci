"use client"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const faqData = [
  {
    question: "What financing options are available?",
    answer:
      "We offer a variety of financing options including traditional auto loans, lease options, and special financing programs. Our finance experts work with multiple lenders to find the best rates and terms that fit your budget. We also offer competitive rates for customers with various credit profiles.",
  },
  {
    question: "Do you offer vehicle warranties?",
    answer:
      "Yes, we offer comprehensive warranty coverage options for both new and pre-owned vehicles. Our warranty plans include extended warranties, powertrain coverage, and bumper-to-bumper protection. We also provide certified pre-owned vehicles that come with manufacturer-backed warranties.",
  },
  {
    question: "Can I trade in my current vehicle?",
    answer:
      "Absolutely! We accept trade-ins and provide fair market value appraisals. Our experts will evaluate your vehicle and offer you a competitive trade-in value that can be applied toward your new purchase. The process is quick and straightforward.",
  },
  {
    question: "What is your return policy?",
    answer:
      "We want you to be completely satisfied with your purchase. We offer a satisfaction guarantee period where you can return the vehicle within a specified timeframe if you're not happy. Please contact us for specific terms and conditions based on your purchase.",
  },
  {
    question: "Do you provide vehicle history reports?",
    answer:
      "Yes, we provide comprehensive vehicle history reports for all pre-owned vehicles. These reports include accident history, service records, title information, and more. We believe in full transparency and want you to make an informed decision.",
  },
  {
    question: "What services do you offer after purchase?",
    answer:
      "We offer comprehensive after-sales services including regular maintenance, repairs, parts replacement, and service appointments. Our certified technicians use genuine parts and follow manufacturer specifications. We also provide roadside assistance and vehicle inspection services.",
  },
  {
    question: "How do I schedule a test drive?",
    answer:
      "You can schedule a test drive by calling us, using our online contact form, or visiting our showroom. We recommend scheduling in advance to ensure the vehicle you're interested in is available. Test drives are available during our business hours.",
  },
  {
    question: "Do you deliver vehicles?",
    answer:
      "Yes, we offer vehicle delivery services within a certain radius of our dealership. Delivery options and fees vary based on location. Contact us to discuss delivery arrangements for your area.",
  },
]

export default function FAQ() {
  return (
    <section className="py-16 bg-[#1a0a10]">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-100">Frequently Asked Questions</h2>
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

