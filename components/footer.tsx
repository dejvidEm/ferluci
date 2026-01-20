import Link from "next/link"
import { Facebook, Instagram, Twitter, Youtube } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-[#121212] text-gray-200">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-white text-lg font-bold mb-4">Ferlucicars</h3>
            <p className="mb-4">
              Váš dôveryhodný partner pri hľadaní ideálneho vozidla, ktoré zodpovedá vášmu životnému štýlu a potrebám.
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
            <h3 className="text-white text-lg font-bold mb-4">Rýchle odkazy</h3>
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
                <Link href="/contact" className="hover:text-white">
                  Kontakt
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white text-lg font-bold mb-4">Služby</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="hover:text-white">
                  Nové vozidlá
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white">
                  Ojazdené vozidlá
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white">
                  Financovanie
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white">
                  Servis a náhradné diely
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white">
                  Ocenenie vozidla
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white text-lg font-bold mb-4">Kontakt</h3>
            <address className="not-italic">
              <p>123 Auto Drive</p>
              <p>Cartown, CT 12345</p>
              <p className="mt-3">Telefón: 1-800-555-CARS</p>
              <p>Email: info@ferlucicars.com</p>
            </address>
            <p className="mt-3">
              <strong>Otáčacie hodiny:</strong>
              <br />
              Po-Pia: 9:00 - 20:00
              <br />
              So: 9:00 - 18:00
              <br />
              Ne: Zatvorené
            </p>
          </div>
        </div>

        <div className="mt-12 pt-8 text-sm text-center">
          <p>&copy; {new Date().getFullYear()} Ferlucicars. Všetky práva vyhradené.</p>
          <p className="mt-2">
            <Link href="#" className="hover:text-white">
              Zásady ochrany súkromia
            </Link>{" "}
            |
            <Link href="#" className="hover:text-white ml-2">
              Obchodné podmienky
            </Link>
          </p>
        </div>
      </div>
    </footer>
  )
}
