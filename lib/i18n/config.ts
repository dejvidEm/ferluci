export const LOCALE_COOKIE = "ferluci-locale"

export const locales = ["sk", "en"] as const
export type Locale = (typeof locales)[number]

export const defaultLocale: Locale = "sk"

export function isLocale(value: string | undefined | null): value is Locale {
  return value === "sk" || value === "en"
}
