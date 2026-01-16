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
      <section className="relative w-full h-[70vh] bg-gradient-to-b from-black via-[#2a0f1a] to-[#4a1a2a] flex items-center">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-black/40 z-10"></div>
          <div
            className="absolute inset-0 z-0 bg-cover bg-center"
            style={{
              backgroundImage: "url('/placeholder.svg?height=1080&width=1920')",
              backgroundPosition: "center 30%",
            }}
          ></div>
        </div>
        <div className="container mx-auto px-4 relative z-20">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">Find Your Perfect Drive</h1>
            <p className="text-xl text-gray-200 mb-8">
              Browse our extensive collection of premium vehicles and drive away with confidence.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" asChild>
                <Link href="/ponuka">Browse Ponuka</Link>
              </Button>
              <Button size="lg" variant="outline" className="bg-white/10 text-white hover:bg-white/20" asChild>
                <Link href="/contact">Contact Us</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Search */}
      <section className="bg-[#1a0a10] py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <Input placeholder="Search by make, model, or keywords..." className="pl-10 h-12" />
              </div>
              <Button size="lg" className="h-12">
                <Search className="mr-2 h-5 w-5" /> Search
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Vehicles */}
      <section className="py-16 bg-[#1a0a10]">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-3xl font-bold">Featured Vehicles</h2>
            <Button variant="ghost" asChild>
              <Link href="/ponuka" className="flex items-center">
                View All <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <FeaturedVehicles />
        </div>
      </section>

      {/* Services */}
      <section className="py-16 bg-[#1a0a10]">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Our Services</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-[#2a0f1a]/50 backdrop-blur-sm p-8 rounded-2xl text-center border-0">
              <div className="bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Car className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-100">Wide Selection</h3>
              <p className="text-gray-300">
                Browse through our extensive inventory of new and pre-owned vehicles from top manufacturers.
              </p>
            </div>
            <div className="bg-[#2a0f1a]/50 backdrop-blur-sm p-8 rounded-2xl text-center border-0">
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
              <h3 className="text-xl font-semibold mb-3 text-gray-100">Financing Options</h3>
              <p className="text-gray-300">
                Get competitive financing rates and flexible terms tailored to your budget and needs.
              </p>
            </div>
            <div className="bg-[#2a0f1a]/50 backdrop-blur-sm p-8 rounded-2xl text-center border-0">
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
              <h3 className="text-xl font-semibold mb-3 text-gray-100">Warranty Coverage</h3>
              <p className="text-gray-300">
                Drive with confidence knowing your vehicle is protected with our comprehensive warranty options.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-[#1a0a10]">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">What Our Customers Say</h2>
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
                  "The team at this dealership made buying a car so easy. They were knowledgeable, friendly, and not
                  pushy at all. I love my new car!"
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
          <h2 className="text-3xl font-bold mb-6">Ready to Find Your Dream Car?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Visit our showroom today or browse our online inventory to find the perfect vehicle for your lifestyle and
            budget.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/ponuka">Browse Ponuka</Link>
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/20" asChild>
              <Link href="/contact">Contact Us</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <FAQ />
    </div>
  )
}
