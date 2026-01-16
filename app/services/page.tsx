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
      title: "New Vehicle Sales",
      description:
        "Browse our extensive selection of brand new vehicles from top manufacturers. We offer the latest models with cutting-edge technology and features.",
      features: ["Latest models", "Factory warranty", "Custom ordering", "Trade-in options"],
    },
    {
      icon: Car,
      title: "Pre-Owned Vehicle Sales",
      description:
        "Quality pre-owned vehicles that have been thoroughly inspected and certified. Get premium quality at a great value.",
      features: ["Certified pre-owned", "Vehicle history reports", "Quality inspection", "Warranty options"],
    },
    {
      icon: DollarSign,
      title: "Financing Solutions",
      description:
        "Flexible financing options tailored to your budget. Our finance experts will help you find the best rates and terms.",
      features: ["Competitive rates", "Flexible terms", "Quick approval", "Multiple lenders"],
    },
    {
      icon: Wrench,
      title: "Service & Maintenance",
      description:
        "Expert service and maintenance for all makes and models. Keep your vehicle running smoothly with our certified technicians.",
      features: ["Expert technicians", "Genuine parts", "Quick service", "Warranty coverage"],
    },
    {
      icon: FileText,
      title: "Trade-In Appraisal",
      description:
        "Get a fair market value for your current vehicle. Our experts will provide a quick and accurate appraisal.",
      features: ["Fair valuation", "Quick process", "Multiple options", "Instant offers"],
    },
    {
      icon: Shield,
      title: "Extended Warranty",
      description:
        "Protect your investment with comprehensive extended warranty options. Drive with confidence knowing you're covered.",
      features: ["Comprehensive coverage", "Flexible plans", "Nationwide service", "Peace of mind"],
    },
  ]

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative w-full py-24 bg-gradient-to-b from-black via-[#2a0f1a] to-[#4a1a2a]">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">Our Services</h1>
            <p className="text-xl text-gray-200 mb-8">
              Comprehensive automotive solutions to meet all your vehicle needs, from purchase to maintenance and
              beyond.
            </p>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16 bg-[#1a0a10]">
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
                      Learn More <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Why Choose Our Services */}
      <section className="py-16 bg-[#1a0a10]">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12 text-gray-100">Why Choose Our Services?</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-100">Quick & Efficient</h3>
                <p className="text-gray-300">
                  We value your time and work efficiently to get you on the road as quickly as possible.
                </p>
              </div>
              <div className="text-center">
                <div className="bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-100">Best Value</h3>
                <p className="text-gray-300">
                  Competitive pricing and flexible options ensure you get the best value for your investment.
                </p>
              </div>
              <div className="text-center">
                <div className="bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-100">Trusted Service</h3>
                <p className="text-gray-300">
                  Years of experience and thousands of satisfied customers speak to our commitment to excellence.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Contact us today to learn more about our services or schedule an appointment.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/contact">Contact Us</Link>
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/20" asChild>
              <Link href="/ponuka">Browse Ponuka</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <FAQ />
    </div>
  )
}

