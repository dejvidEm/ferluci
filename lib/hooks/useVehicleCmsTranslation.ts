"use client"

import { useEffect, useMemo, useState } from "react"
import type { Locale } from "@/lib/i18n/config"
import type { Vehicle } from "@/lib/types"

const MEM = new Map<string, string[]>()

function fingerprint(description: string, features: string[]): string {
  return `${description}\u001e${features.join("\u001f")}`
}

function hash32(s: string): string {
  let h = 5381
  for (let i = 0; i < s.length; i++) {
    h = (h * 33) ^ s.charCodeAt(i)
  }
  return (h >>> 0).toString(36)
}

function cacheKey(vehicleId: string, fp: string): string {
  return `ferluci-tr:en:${vehicleId}:${hash32(fp)}`
}

/**
 * Preklad popisu a výbavy z Sanity (SK) do EN pri prepnutí jazyka.
 * Vyžaduje `DEEPL_AUTH_KEY` v prostredí; bez kľúča API vráti zdrojový slovenský text.
 */
export function useVehicleCmsTranslation(vehicle: Vehicle | null, locale: Locale) {
  const skDesc = vehicle?.description ?? ""
  const skFeatures = vehicle?.features ?? []
  const skKey = useMemo(() => skFeatures.join("\u001f"), [skFeatures])

  const [enFlat, setEnFlat] = useState<string[] | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!vehicle || locale !== "en") {
      setEnFlat(null)
      setLoading(false)
      return
    }

    const fp = fingerprint(skDesc, skFeatures)
    const key = cacheKey(vehicle.id, fp)

    const fromMem = MEM.get(key)
    if (fromMem && fromMem.length === skFeatures.length + 1) {
      setEnFlat(fromMem)
      setLoading(false)
      return
    }

    if (typeof window !== "undefined") {
      try {
        const raw = sessionStorage.getItem(key)
        if (raw) {
          const parsed = JSON.parse(raw) as string[]
          if (Array.isArray(parsed) && parsed.length === skFeatures.length + 1) {
            MEM.set(key, parsed)
            setEnFlat(parsed)
            setLoading(false)
            return
          }
        }
      } catch {
        /* ignore */
      }
    }

    const texts = [skDesc, ...skFeatures]
    if (texts.every((t) => !t.trim())) {
      setEnFlat(null)
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)
    setEnFlat(null)

    ;(async () => {
      try {
        const res = await fetch("/api/translate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ texts }),
        })
        const data = (await res.json()) as { translations?: string[] }
        const tr = data.translations
        if (cancelled || !tr || tr.length !== texts.length) {
          if (!cancelled) {
            setEnFlat(null)
            setLoading(false)
          }
          return
        }
        MEM.set(key, tr)
        try {
          sessionStorage.setItem(key, JSON.stringify(tr))
        } catch {
          /* quota */
        }
        setEnFlat(tr)
      } catch {
        if (!cancelled) setEnFlat(null)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [vehicle, locale, skDesc, skKey])

  const description =
    locale === "sk" ? skDesc : enFlat ? enFlat[0] ?? skDesc : skDesc
  const features =
    locale === "sk" ? skFeatures : enFlat ? enFlat.slice(1) : skFeatures

  const translationLoading = locale === "en" && loading && !enFlat

  return { description, features, translationLoading }
}
