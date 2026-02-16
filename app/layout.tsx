import type React from "react"
import type { Metadata } from "next"
import { Urbanist, Montserrat } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import Header from "@/components/header"
import Footer from "@/components/footer"

const urbanist = Urbanist({ 
  subsets: ["latin"],
  variable: "--font-urbanist",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
})

const montserrat = Montserrat({ 
  subsets: ["latin"],
  variable: "--font-montserrat",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
})

export const metadata: Metadata = {
  title: "Ferluci Cars - Nájdite svoje ideálne vozidlo",
  description: "Prehľadajte našu rozsiahlu ponuku prémiových vozidiel a odíďte s istotou.",
  generator: 'v0.app',
  openGraph: {
    title: "Ferluci Cars - Nájdite svoje ideálne vozidlo",
    description: "Prehľadajte našu rozsiahlu ponuku prémiových vozidiel a odíďte s istotou.",
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.ferlucicars.eu'}/opengraph-image`,
        width: 1200,
        height: 630,
        alt: "Ferluci Cars Logo",
      },
    ],
    type: "website",
    siteName: "Ferluci Cars",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ferluci Cars - Nájdite svoje ideálne vozidlo",
    description: "Prehľadajte našu rozsiahlu ponuku prémiových vozidiel a odíďte s istotou.",
    images: [`${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.ferlucicars.eu'}/opengraph-image`],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="sk" className="dark">
      <body className={`${urbanist.variable} ${montserrat.variable} font-montserrat bg-[#121212]`}>
        <Header />
        <main className="bg-[#121212]">{children}</main>
        <Footer />
        <Analytics />
      </body>
    </html>
  )
}
