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
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">About Ferlucicars</h1>
            <p className="text-xl text-gray-200 mb-8">
              Your trusted partner in finding the perfect vehicle that matches your lifestyle and exceeds your expectations.
            </p>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16 bg-[#1a0a10]">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-6 text-gray-100">Our Story</h2>
            <div className="space-y-4 text-gray-300">
              <p>
                Ferlucicars was founded with a simple mission: to revolutionize the car buying experience by providing
                exceptional service, premium vehicles, and unmatched customer satisfaction. We believe that finding your
                perfect car should be an exciting journey, not a stressful ordeal.
              </p>
              <p>
                With years of experience in the automotive industry, our team has built a reputation for integrity,
                transparency, and dedication to our customers. We carefully curate our inventory to include only the
                finest vehicles from top manufacturers, ensuring quality and reliability in every car we offer.
              </p>
              <p>
                At Ferlucicars, we don't just sell cars—we build relationships. Our commitment extends beyond the sale,
                providing ongoing support, maintenance services, and financing options tailored to your needs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-16 bg-[#1a0a10]">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-100">Our Core Values</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-[#2a0f1a]/50 backdrop-blur-sm p-8 rounded-2xl text-center border-0">
              <div className="bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-100">Integrity</h3>
              <p className="text-gray-300">
                We conduct business with honesty and transparency, ensuring every transaction is fair and straightforward.
              </p>
            </div>
            <div className="bg-[#2a0f1a]/50 backdrop-blur-sm p-8 rounded-2xl text-center border-0">
              <div className="bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Award className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-100">Excellence</h3>
              <p className="text-gray-300">
                We strive for excellence in every aspect of our service, from vehicle selection to customer care.
              </p>
            </div>
            <div className="bg-[#2a0f1a]/50 backdrop-blur-sm p-8 rounded-2xl text-center border-0">
              <div className="bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Heart className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-100">Customer First</h3>
              <p className="text-gray-300">
                Your satisfaction is our top priority. We go above and beyond to ensure you have the best experience.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 bg-[#1a0a10]">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-100">Why Choose Ferlucicars?</h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div className="flex items-start space-x-4">
              <div className="bg-primary/10 w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0">
                <Car className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2 text-gray-100">Premium Selection</h3>
                <p className="text-gray-300">
                  Our carefully curated inventory features only the finest vehicles from top manufacturers, ensuring
                  quality and reliability.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="bg-primary/10 w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2 text-gray-100">Competitive Pricing</h3>
                <p className="text-gray-300">
                  We offer competitive prices and flexible financing options to make your dream car affordable.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="bg-primary/10 w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2 text-gray-100">Expert Team</h3>
                <p className="text-gray-300">
                  Our knowledgeable sales team is here to help you find the perfect vehicle and answer all your
                  questions.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="bg-primary/10 w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2 text-gray-100">Warranty & Support</h3>
                <p className="text-gray-300">
                  Comprehensive warranty coverage and ongoing support to give you peace of mind long after your purchase.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Find Your Perfect Car?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Visit our showroom or browse our online inventory to discover your next vehicle.
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

