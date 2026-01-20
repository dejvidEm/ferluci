import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Header from "@/components/header"
import Footer from "@/components/footer"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Ferlucicars - Nájdite svoje ideálne vozidlo",
  description: "Prehľadajte našu rozsiahlu ponuku prémiových vozidiel a odíďte s istotou.",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="sk" className="dark">
      <body className={`${inter.className} bg-[#121212]`}>
        <Header />
        <main className="bg-[#121212]">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
