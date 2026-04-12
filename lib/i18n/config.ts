/**
 * Cookie drží vždy `sk` (alebo sa maže). Angličtina sa neukladá do cookie — len do sessionStorage
 * po kliknutí na EN, aby sa stránka pri otvorení nikdy nezobrazila v angličtine bez prepnutia.
 */
export const LOCALE_COOKIE = "ferluci-locale-v2"

/** sessionStorage: len hodnota "1" = používateľ v tejto karte zvolil EN */
export const SESSION_ENGLISH_KEY = "ferluci-ui-en"

export const locales = ["sk", "en"] as const
export type Locale = (typeof locales)[number]

export const defaultLocale: Locale = "sk"

export function isLocale(value: string | undefined | null): value is Locale {
  return value === "sk" || value === "en"
}
