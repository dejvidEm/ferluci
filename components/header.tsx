"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, Phone, X } from "lucide-react"
import { useState } from "react"

const navigation = [
  { name: "Domov", href: "/" },
  { name: "Ponuka", href: "/ponuka" },
  { name: "Služby", href: "/services" },
  { name: "O nás", href: "/about" },
  { name: "Kontakt", href: "/contact" },
]

export default function Header() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <header className="bg-[#121212]/80 backdrop-blur-xl sticky top-0 z-50 border-b-0">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <Image
                src="/logo.png"
                alt="Ferlucicars"
                width={200}
                height={60}
                className="h-14 w-auto brightness-0 invert"
                priority
              />
            </Link>
          </div>

          <nav className="hidden md:flex space-x-8">
            {navigation.map((item) => (
              <Link key={item.name} href={item.href} className="text-gray-200 hover:text-primary font-medium">
                {item.name}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center space-x-4">
            <div className="flex items-center">
              <Phone className="h-5 w-5 text-primary mr-2" />
              <span className="font-medium">1-800-555-CARS</span>
            </div>
            <Button asChild>
              <Link href="/contact">Kontaktovať</Link>
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
                <div className="flex items-center justify-between">
                  <Link href="/" className="flex items-center" onClick={() => setIsOpen(false)}>
                    <Image
                      src="/logo.png"
                      alt="Ferlucicars"
                      width={160}
                      height={48}
                      className="h-12 w-auto brightness-0 invert"
                    />
                  </Link>
                  <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                    <X className="h-6 w-6" />
                    <span className="sr-only">Close menu</span>
                  </Button>
                </div>
                <nav className="mt-8 flex flex-col space-y-6">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="text-gray-200 hover:text-primary font-medium text-lg"
                      onClick={() => setIsOpen(false)}
                    >
                      {item.name}
                    </Link>
                  ))}
                  <div className="pt-4">
                    <div className="flex items-center mb-4">
                      <Phone className="h-5 w-5 text-primary mr-2" />
                      <span className="font-medium">1-800-555-CARS</span>
                    </div>
                    <Button className="w-full" asChild>
                      <Link href="/contact" onClick={() => setIsOpen(false)}>
                        Kontaktovať
                      </Link>
                    </Button>
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
