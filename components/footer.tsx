import Link from "next/link"
import { Facebook, Instagram, Twitter, Youtube } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-gradient-to-b from-gray-950 via-[#4a1a2a] to-[#5a1f35] text-gray-200">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-white text-lg font-bold mb-4">Ferlucicars</h3>
            <p className="mb-4">
              Your trusted partner for finding the perfect vehicle to match your lifestyle and needs.
            </p>
            <div className="flex space-x-4">
              <Link href="#" className="hover:text-white">
                <Facebook className="h-5 w-5" />
                <span className="sr-only">Facebook</span>
              </Link>
              <Link href="#" className="hover:text-white">
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </Link>
              <Link href="#" className="hover:text-white">
                <Instagram className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </Link>
              <Link href="#" className="hover:text-white">
                <Youtube className="h-5 w-5" />
                <span className="sr-only">YouTube</span>
              </Link>
            </div>
          </div>

          <div>
            <h3 className="text-white text-lg font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="hover:text-white">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/ponuka" className="hover:text-white">
                  Ponuka
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-white">
                  Services
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white text-lg font-bold mb-4">Services</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="hover:text-white">
                  New Vehicles
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white">
                  Pre-Owned Vehicles
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white">
                  Financing
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white">
                  Service & Parts
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white">
                  Trade-In Appraisal
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white text-lg font-bold mb-4">Contact Us</h3>
            <address className="not-italic">
              <p>123 Auto Drive</p>
              <p>Cartown, CT 12345</p>
              <p className="mt-3">Phone: 1-800-555-CARS</p>
              <p>Email: info@ferlucicars.com</p>
            </address>
            <p className="mt-3">
              <strong>Hours:</strong>
              <br />
              Mon-Fri: 9AM - 8PM
              <br />
              Sat: 9AM - 6PM
              <br />
              Sun: Closed
            </p>
          </div>
        </div>

        <div className="mt-12 pt-8 text-sm text-center">
          <p>&copy; {new Date().getFullYear()} Ferlucicars. All rights reserved.</p>
          <p className="mt-2">
            <Link href="#" className="hover:text-white">
              Privacy Policy
            </Link>{" "}
            |
            <Link href="#" className="hover:text-white ml-2">
              Terms of Service
            </Link>
          </p>
        </div>
      </div>
    </footer>
  )
}
