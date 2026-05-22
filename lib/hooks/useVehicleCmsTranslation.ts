"use client"

import { useEffect, useMemo, useState } from "react"
import type { Locale } from "@/lib/i18n/config"
import type { Vehicle } from "@/lib/types"
import {
  portableTextToPlainText,
  translatePortableText,
  type PortableTextBlock,
} from "@/lib/sanity/portableText"

const MEM = new Map<string, string[]>()

/** Popis (ako plain text), výbava, farba exteriéru, farba interiéru — jeden batch pre `/api/translate`. */
function segmentsFromVehicle(
  descriptionText: string,
  features: string[],
  exteriorColor: string,
  interiorColor: string
): string[] {
  return [descriptionText, ...features, exteriorColor, interiorColor]
}

function fingerprint(
  descriptionText: string,
  features: string[],
  exteriorColor: string,
  interiorColor: string
): string {
  return `${descriptionText}\u001e${features.join("\u001f")}\u001e${exteriorColor}\u001e${interiorColor}`
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

const EMPTY_BLOCKS: PortableTextBlock[] = []

/**
 * Preklad popisu, výbavy a farieb exteriér/interiér (SK→EN) jedným volaním `/api/translate`.
 * Popis (Portable Text) sa pre účely prekladu serializuje na riadky oddelené `\n`, takže
 * jednoznačne udržíme tú istú štruktúru odsekov (vrátane prázdnych) aj po preložení.
 */
export function useVehicleCmsTranslation(vehicle: Vehicle | null, locale: Locale) {
  const skDescBlocks: PortableTextBlock[] = vehicle?.description ?? EMPTY_BLOCKS
  const skDescText = useMemo(() => portableTextToPlainText(skDescBlocks), [skDescBlocks])
  const skFeatures = vehicle?.features ?? []
  const skExterior = vehicle?.exteriorColor ?? ""
  const skInterior = vehicle?.interiorColor ?? ""
  const skKey = useMemo(() => skFeatures.join("\u001f"), [skFeatures])
  const skColorsKey = useMemo(
    () => `${skExterior}\u001e${skInterior}`,
    [skExterior, skInterior]
  )

  const [enFlat, setEnFlat] = useState<string[] | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!vehicle || locale !== "en") {
      setEnFlat(null)
      setLoading(false)
      return
    }

    const segments = segmentsFromVehicle(skDescText, skFeatures, skExterior, skInterior)
    const fp = fingerprint(skDescText, skFeatures, skExterior, skInterior)
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
  }, [vehicle, locale, skDescText, skKey, skColorsKey])

  const n = skFeatures.length
  const segmentCount = 1 + n + 2

  const hasFullEn =
    enFlat !== null && enFlat.length === segmentCount

  const enDescText = hasFullEn ? enFlat![0] ?? skDescText : skDescText
  const enDescBlocks = useMemo(() => {
    if (locale === "sk" || !hasFullEn) return skDescBlocks
    const translatedLines = enDescText.split("\n")
    return translatePortableText(skDescBlocks, translatedLines)
  }, [locale, hasFullEn, enDescText, skDescBlocks])

  const description: PortableTextBlock[] =
    locale === "sk" ? skDescBlocks : enDescBlocks
  const features =
    locale === "sk" ? skFeatures : hasFullEn ? enFlat!.slice(1, 1 + n) : skFeatures
  const exteriorColor =
    locale === "sk"
      ? skExterior
      : hasFullEn
        ? enFlat![1 + n] ?? skExterior
        : skExterior
  const interiorColor =
    locale === "sk"
      ? skInterior
      : hasFullEn
        ? enFlat![2 + n] ?? skInterior
        : skInterior

  const translationLoading = locale === "en" && loading && !enFlat

  return {
    description,
    features,
    exteriorColor,
    interiorColor,
    translationLoading,
  }
}
