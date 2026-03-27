import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export type UiLocale = "sk" | "en"

export function formatCurrency(amount: number, locale: UiLocale = "sk"): string {
  return new Intl.NumberFormat(locale === "en" ? "en-US" : "sk-SK", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatNumber(num: number, locale: UiLocale = "sk"): string {
  return new Intl.NumberFormat(locale === "en" ? "en-US" : "sk-SK").format(num)
}

const fuelSk: Record<string, string> = {
  Gasoline: "Benzín",
  Diesel: "Nafta",
  Electric: "Elektrický",
  Hybrid: "Hybrid",
  "Plug-in Hybrid": "Plug-in Hybrid",
}

const fuelEn: Record<string, string> = {
  Gasoline: "Gasoline",
  Diesel: "Diesel",
  Electric: "Electric",
  Hybrid: "Hybrid",
  "Plug-in Hybrid": "Plug-in Hybrid",
}

export function translateFuelType(fuelType: string, locale: UiLocale = "sk"): string {
  const map = locale === "en" ? fuelEn : fuelSk
  return map[fuelType] || fuelType
}

const transSk: Record<string, string> = {
  Automatic: "Automatická",
  Manual: "Manuálna",
  CVT: "CVT",
}

const transEn: Record<string, string> = {
  Automatic: "Automatic",
  Manual: "Manual",
  CVT: "CVT",
}

export function translateTransmission(transmission: string, locale: UiLocale = "sk"): string {
  const map = locale === "en" ? transEn : transSk
  return map[transmission] || transmission
}
