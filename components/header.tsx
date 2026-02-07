"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { Menu, Phone, X, Facebook, Instagram } from "lucide-react"
import { useState } from "react"
import { useContactInfo } from "@/lib/hooks/useContactInfo"
import TranslateButton from "@/components/translate-button"
import TranslatableLink from "@/components/translatable-link"

const navigation = [
  { name: "Domov", href: "/" },
  { name: "Ponuka", href: "/ponuka" },
  { name: "Služby", href: "/services" },
  { name: "O nás", href: "/about" },
  { name: "Galéria", href: "/gallery" },
  { name: "Kontakt", href: "/contact" },
]

export default function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const { contactInfo } = useContactInfo()

  return (
    <header className="bg-[#121212]/80 backdrop-blur-xl h-24 sticky top-0 z-50 border-b-0">
      <div className="container mx-auto px-4 h-full">
        <div className="flex h-full items-center justify-between">
          <div className="flex items-center">
            <TranslatableLink href="/" className="flex items-center">
              <Image
                src="/logo.png"
                alt="Ferlucicars"
                width={200}
                height={60}
                className="h-14 w-auto brightness-0 invert"
                priority
              />
            </TranslatableLink>
          </div>

          <nav className="hidden md:flex space-x-8">
            {navigation.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href + "/"))
              return (
                <TranslatableLink 
                  key={item.name} 
                  href={item.href}
                  className={`text-gray-200 hover:text-primary font-medium relative pb-1 ${
                    isActive ? "text-primary" : ""
                  }`}
                >
                {item.name}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-500"></span>
                  )}
              </TranslatableLink>
              )
            })}
          </nav>

          <div className="hidden md:flex items-center space-x-4">
            <div className="flex items-center">
              <Phone className="h-5 w-5 text-primary mr-2" />
              <span className="font-medium">{contactInfo.phone || "0905 326 292"}</span>
            </div>
            <TranslateButton />
            <Button asChild>
              <TranslatableLink href="/contact">
                Kontaktovať
              </TranslatableLink>
            </Button>
          </div>

          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px] border-0 rounded-tl-2xl rounded-bl-2xl [&>button]:hidden">
                <SheetTitle className="sr-only">Navigačné menu</SheetTitle>
                <div className="flex items-center justify-between">
                  <TranslatableLink 
                    href="/" 
                    className="flex items-center" 
                    onClick={() => setIsOpen(false)}
                  >
                    <Image
                      src="/logo.png"
                      alt="Ferlucicars"
                      width={160}
                      height={48}
                      className="h-12 w-auto brightness-0 invert"
                    />
                  </TranslatableLink>
                  <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                    <X className="h-6 w-6" />
                    <span className="sr-only">Close menu</span>
                  </Button>
                </div>
                <nav className="mt-8 flex flex-col space-y-6">
                  {navigation.map((item) => {
                    const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))
                    return (
                    <TranslatableLink
                      key={item.name}
                      href={item.href}
                        className={`text-gray-200 hover:text-primary font-medium text-lg relative pb-1 ${
                          isActive ? "text-primary" : ""
                        }`}
                      onClick={() => setIsOpen(false)}
                    >
                      {item.name}
                        {isActive && (
                          <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-500"></span>
                        )}
                    </TranslatableLink>
                    )
                  })}
                  <div className="pt-4">
                    <div className="flex items-center mb-4">
                      <Phone className="h-5 w-5 text-primary mr-2" />
                      <span className="font-medium">{contactInfo.phone || "0905 326 292"}</span>
                    </div>
                    <TranslateButton />
                    <Button className="w-full mb-6 mt-4" asChild>
                      <TranslatableLink 
                        href="/contact" 
                        onClick={() => setIsOpen(false)}
                      >
                        Kontaktovať
                      </TranslatableLink>
                    </Button>
                    <div className="flex items-center justify-center space-x-4 pt-4 border-t border-white/10">
                      <Link 
                        href="https://www.facebook.com/p/Ferluci-Cars-61575683307429/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="hover:text-primary transition-colors"
                        onClick={() => setIsOpen(false)}
                      >
                        <Facebook className="h-6 w-6" />
                        <span className="sr-only">Facebook</span>
                      </Link>
                      <Link 
                        href="https://www.instagram.com/ferluci.cars/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="hover:text-primary transition-colors"
                        onClick={() => setIsOpen(false)}
                      >
                        <Instagram className="h-6 w-6" />
                        <span className="sr-only">Instagram</span>
                      </Link>
                      <Link 
                        href="https://www.tiktok.com/@ferluci_cars" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="hover:text-primary transition-colors"
                        onClick={() => setIsOpen(false)}
                      >
                        <svg 
                          className="h-6 w-6" 
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
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}
