"use client"

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import { useRouter } from "next/navigation"
import { LOCALE_COOKIE, type Locale, defaultLocale, isLocale } from "./config"
import sk from "./messages/sk.json"
import en from "./messages/en.json"

const messages = { sk, en } as const

type MessageDict = typeof sk

function getByPath(obj: Record<string, unknown>, path: string): string | undefined {
  const parts = path.split(".")
  let cur: unknown = obj
  for (const p of parts) {
    if (cur === null || cur === undefined || typeof cur !== "object") return undefined
    cur = (cur as Record<string, unknown>)[p]
  }
  return typeof cur === "string" ? cur : undefined
}

function interpolate(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => {
    const v = vars[key]
    return v !== undefined && v !== null ? String(v) : ""
  })
}

type TFunction = (key: string, vars?: Record<string, string | number>) => string

function makeT(locale: Locale): TFunction {
  const dict = messages[locale] as unknown as MessageDict
  return (key: string, vars?: Record<string, string | number>) => {
    let s = getByPath(dict as unknown as Record<string, unknown>, key)
    if (!s && locale !== defaultLocale) {
      s = getByPath(messages[defaultLocale] as unknown as Record<string, unknown>, key)
    }
    if (!s) s = key
    return vars ? interpolate(s, vars) : s
  }
}

type LocaleContextValue = {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: TFunction
}

const LocaleContext = createContext<LocaleContextValue | null>(null)

export function LocaleProvider({
  children,
  initialLocale,
}: {
  children: ReactNode
  initialLocale: Locale
}) {
  const router = useRouter()
  const [locale, setLocaleState] = useState<Locale>(initialLocale)

  const setLocale = useCallback(
    (next: Locale) => {
      setLocaleState(next)
      document.cookie = `${LOCALE_COOKIE}=${next};path=/;max-age=31536000;SameSite=Lax`
      router.refresh()
    },
    [router]
  )

  const t = useMemo(() => makeT(locale), [locale])

  const value = useMemo(
    () => ({ locale, setLocale, t }),
    [locale, setLocale, t]
  )

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
}

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext)
  if (!ctx) {
    throw new Error("useLocale must be used within LocaleProvider")
  }
  return ctx
}

export function useOptionalLocale(): LocaleContextValue | null {
  return useContext(LocaleContext)
}

export { isLocale, makeT, messages }
