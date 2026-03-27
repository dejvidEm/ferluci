"use client"

import { useEffect, useMemo, useState } from "react"
import { client, contactInfoQuery } from "@/lib/sanity"
import { useLocale } from "@/lib/i18n/context"
import { localizeContactInfo } from "@/lib/sanity/localize"
import type { ContactInfo } from "@/lib/sanity/utils"

const defaultContactSk: ContactInfo = {
  address: {
    street: "Kopčianska 41",
    city: "Petržalka",
    postalCode: "851 01",
    coordinates: {
      lat: 48.1204,
      lng: 17.1077,
    },
  },
  phone: "0905 326 292",
  email: "info@ferlucicars.com",
  openingHours: {
    mondayFriday: "9:00 - 20:00",
    saturday: "9:00 - 18:00",
    sunday: "Zatvorené",
  },
}

const defaultContactEn: ContactInfo = {
  ...defaultContactSk,
  openingHours: {
    mondayFriday: "9:00 - 20:00",
    saturday: "9:00 - 18:00",
    sunday: "Closed",
  },
}

export function useContactInfo() {
  const { locale } = useLocale()
  const [raw, setRaw] = useState<ContactInfo | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchContactInfo() {
      try {
        const data = await client.fetch(contactInfoQuery)
        if (data) {
          setRaw(data)
        }
      } catch (error) {
        console.error("Error fetching contact info:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchContactInfo()
  }, [])

  const contactInfo = useMemo(() => {
    const base = raw ?? (locale === "en" ? defaultContactEn : defaultContactSk)
    return localizeContactInfo(base, locale)
  }, [raw, locale])

  return { contactInfo, loading }
}
