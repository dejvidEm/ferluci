"use client"

import { useEffect, useMemo, useState } from "react"
import type { Locale } from "@/lib/i18n/config"
import type { Vehicle } from "@/lib/types"

const MEM = new Map<string, string[]>()

/** Popis + každá položka výbavy (features) ako jeden rad segmentov pre jeden DeepL request. */
function segmentsFromVehicle(description: string, features: string[]): string[] {
  return [description, ...features]
}

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

/** Len neprázdne segmenty na API; prázdne necháme a zlúčime späť podľa indexu. */
function buildTranslationPayload(segments: string[]): {
  toSend: string[]
  indexMap: number[]
} {
  const toSend: string[] = []
  const indexMap: number[] = []
  segments.forEach((s, i) => {
    if (s.trim()) {
      toSend.push(s)
      indexMap.push(i)
    }
  })
  return { toSend, indexMap }
}

function mergeTranslations(
  original: string[],
  translatedParts: string[],
  indexMap: number[]
): string[] {
  const merged = [...original]
  translatedParts.forEach((t, j) => {
    const origIdx = indexMap[j]
    if (origIdx !== undefined) merged[origIdx] = t
  })
  return merged
}

/**
 * Preklad **popisu** aj **výbavy** (pole `features` zo Sanity) do EN jedným volaním `/api/translate`
 * a tým istým `DEEPL_AUTH_KEY` ako pri popise.
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

    const segments = segmentsFromVehicle(skDesc, skFeatures)
    const fp = fingerprint(skDesc, skFeatures)
    const key = cacheKey(vehicle.id, fp)

    const fromMem = MEM.get(key)
    if (fromMem && fromMem.length === segments.length) {
      setEnFlat(fromMem)
      setLoading(false)
      return
    }

    if (typeof window !== "undefined") {
      try {
        const raw = sessionStorage.getItem(key)
        if (raw) {
          const parsed = JSON.parse(raw) as string[]
          if (Array.isArray(parsed) && parsed.length === segments.length) {
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

    const { toSend, indexMap } = buildTranslationPayload(segments)
    if (toSend.length === 0) {
      setEnFlat(segments.map(() => ""))
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
          body: JSON.stringify({ texts: toSend }),
        })
        const data = (await res.json()) as { translations?: string[] }
        const tr = data.translations
        if (cancelled || !tr || tr.length !== toSend.length) {
          if (!cancelled) {
            setEnFlat(null)
            setLoading(false)
          }
          return
        }
        const merged = mergeTranslations(segments, tr, indexMap)
        MEM.set(key, merged)
        try {
          sessionStorage.setItem(key, JSON.stringify(merged))
        } catch {
          /* quota */
        }
        setEnFlat(merged)
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

  const segmentCount = 1 + skFeatures.length
  const description =
    locale === "sk"
      ? skDesc
      : enFlat && enFlat.length === segmentCount
        ? enFlat[0] ?? skDesc
        : skDesc
  const features =
    locale === "sk"
      ? skFeatures
      : enFlat && enFlat.length === segmentCount
        ? enFlat.slice(1)
        : skFeatures

  const translationLoading = locale === "en" && loading && !enFlat

  return { description, features, translationLoading }
}
