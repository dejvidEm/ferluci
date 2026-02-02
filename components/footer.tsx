"use client"

import Link from "next/link"
import { Facebook, Instagram, Lock } from "lucide-react"
import { useContactInfo } from "@/lib/hooks/useContactInfo"

export default function Footer() {
  const { contactInfo } = useContactInfo()
  return (
    <footer className="bg-[#121212] text-gray-200 relative overflow-hidden">
      <span className="text-center text-red-400 md:text-[160px] text-[45px] font-bold absolute left-2 md:left-10 -bottom-5 md:-bottom-20 opacity-5 pointer-events-none z-0">FERLUCI CARS</span>
      <div className="container mx-auto px-4 pt-20 py-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-white text-lg font-bold mb-4 relative pb-2">
              Ferluci Cars
              <span className="absolute bottom-0 left-0 w-20 h-0.5 bg-red-500"></span>
            </h3>
            <p className="mb-4">
              Váš dôveryhodný partner pri hľadaní ideálneho vozidla, ktoré zodpovedá vášmu životnému štýlu a potrebám.
            </p>
            <div className="flex space-x-4">
              <Link 
                href="https://www.facebook.com/p/Ferluci-Cars-61575683307429/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
              >
                <Facebook className="h-5 w-5" />
                <span className="sr-only">Facebook</span>
              </Link>
              <Link 
                href="https://www.instagram.com/ferluci.cars/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
              >
                <Instagram className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </Link>
              <Link 
                href="https://www.tiktok.com/@ferluci_cars" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
              >
                <svg 
                  className="h-5 w-5" 
                  viewBox="0 0 24 24" 
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                </svg>
                <span className="sr-only">TikTok</span>
              </Link>
            </div>
          </div>

          <div>
            <h3 className="text-white text-lg font-bold mb-4 relative  pb-2">
              Rýchle odkazy
              <span className="absolute bottom-0 left-0 w-20 h-0.5 bg-red-500"></span>
            </h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="hover:text-white">
                  Domov
                </Link>
              </li>
              <li>
                <Link href="/ponuka" className="hover:text-white">
                  Ponuka
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-white">
                  Služby
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white">
                  O nás
                </Link>
              </li>
              <li>
                <Link href="/gallery" className="hover:text-white">
                  Galéria
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white">
                  Kontakt
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white text-lg font-bold mb-4 relative pb-2">
              Kontakt
              <span className="absolute bottom-0 left-0 w-20 h-0.5 bg-red-500"></span>
            </h3>
            <address className="not-italic">
              {contactInfo.address && (
                <>
                  <p>{contactInfo.address.street}</p>
                  <p>{contactInfo.address.postalCode} {contactInfo.address.city}</p>
                </>
              )}
              {!contactInfo.address && (
                <>
                  <p>Kopčianska 41</p>
                  <p>851 01 Petržalka</p>
                </>
              )}
              <p className="mt-3">Telefón: {contactInfo.phone}</p>
              <p>Email: {contactInfo.email || "info@ferlucicars.com"}</p>
            </address>
            <p className="mt-3">
              <strong>Otváracie hodiny:</strong>
              <br />
              {contactInfo.openingHours ? (
                <>
                  Po-Pia: {contactInfo.openingHours.mondayFriday}
                  <br />
                  So-Ne: {contactInfo.openingHours.saturday}
                </>
              ) : (
                <>
                  Po-Pia: Na objednávku
              <br />
                  So-Ne: Na objednávku
                </>
              )}
            </p>
          </div>
        </div>

        <div className="mt-12 pt-8 text-sm text-center">
          <p>&copy; {new Date().getFullYear()} Ferluci Cars. Všetky práva vyhradené.</p>
          <p className="mt-2">
            <Link href="#" className="hover:text-white">
              Zásady ochrany súkromia
            </Link>{" "}
            |
            <Link href="#" className="hover:text-white ml-2">
              Obchodné podmienky
            </Link>
            {" "}
            |
            <Link href="/admin" className="hover:text-white ml-2 underline inline-flex items-center gap-1">
              <Lock className="h-3 w-3" />
              Admin
            </Link>
          </p>
        </div>
      </div>
    </footer>
  )
}
