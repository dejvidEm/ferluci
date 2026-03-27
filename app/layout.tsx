import type React from "react"
import type { Metadata } from "next"
import { cookies } from "next/headers"
import { Urbanist, Montserrat } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { Providers } from "@/components/providers"
import { LOCALE_COOKIE, defaultLocale, isLocale, type Locale } from "@/lib/i18n/config"

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

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://www.ferlucicars.eu"

const metadataByLocale: Record<
  Locale,
  { title: string; description: string; ogTitle: string; ogAlt: string }
> = {
  sk: {
    title: "Ferluci Cars - Nájdite svoje ideálne vozidlo",
    description:
      "Prehľadajte našu rozsiahlu ponuku prémiových vozidiel a odíďte s istotou.",
    ogTitle: "Ferluci Cars - Nájdite svoje ideálne vozidlo",
    ogAlt: "Ferluci Cars Logo",
  },
  en: {
    title: "Ferluci Cars - Find your ideal vehicle",
    description: "Browse our extensive range of premium vehicles with confidence.",
    ogTitle: "Ferluci Cars - Find your ideal vehicle",
    ogAlt: "Ferluci Cars Logo",
  },
}

export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = await cookies()
  const cookieVal = cookieStore.get(LOCALE_COOKIE)?.value
  const locale: Locale = isLocale(cookieVal) ? cookieVal : defaultLocale
  const m = metadataByLocale[locale]

  return {
    title: m.title,
    description: m.description,
    generator: "v0.app",
    openGraph: {
      title: m.ogTitle,
      description: m.description,
      images: [
        {
          url: `${SITE}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: m.ogAlt,
        },
      ],
      type: "website",
      siteName: "Ferluci Cars",
    },
    twitter: {
      card: "summary_large_image",
      title: m.ogTitle,
      description: m.description,
      images: [`${SITE}/opengraph-image`],
    },
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const cookieStore = await cookies()
  const cookieVal = cookieStore.get(LOCALE_COOKIE)?.value
  const initialLocale: Locale = isLocale(cookieVal) ? cookieVal : defaultLocale

  return (
    <html lang={initialLocale} className="dark">
      <body className={`${urbanist.variable} ${montserrat.variable} font-montserrat bg-[#121212]`}>
        <Providers initialLocale={initialLocale}>
          <Header />
          <main className="bg-[#121212]">{children}</main>
          <Footer />
        </Providers>
        <Analytics />
      </body>
    </html>
  )
}
