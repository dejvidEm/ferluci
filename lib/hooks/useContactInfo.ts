"use client"

import { useEffect, useState } from "react"
import { client, contactInfoQuery } from "@/lib/sanity"
import { ContactInfo } from "@/lib/sanity/utils"

const defaultContactInfo: ContactInfo = {
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

export function useContactInfo() {
  const [contactInfo, setContactInfo] = useState<ContactInfo>(defaultContactInfo)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchContactInfo() {
      try {
        const data = await client.fetch(contactInfoQuery)
        if (data) {
          setContactInfo(data)
        }
      } catch (error) {
        console.error("Error fetching contact info:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchContactInfo()
  }, [])

  return { contactInfo, loading }
}
