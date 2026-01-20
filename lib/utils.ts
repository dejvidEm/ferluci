import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat("en-US").format(num)
}

export function translateFuelType(fuelType: string): string {
  const translations: Record<string, string> = {
    Gasoline: "Benzín",
    Diesel: "Nafta",
    Electric: "Elektrický",
    Hybrid: "Hybrid",
    "Plug-in Hybrid": "Plug-in Hybrid",
  }
  return translations[fuelType] || fuelType
}

export function translateTransmission(transmission: string): string {
  const translations: Record<string, string> = {
    Automatic: "Automatická",
    Manual: "Manuálna",
    CVT: "CVT",
  }
  return translations[transmission] || transmission
}
