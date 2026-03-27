"use client"

import type { ReactNode } from "react"
import { LocaleProvider } from "@/lib/i18n/context"
import type { Locale } from "@/lib/i18n/config"

export function Providers({
  children,
  initialLocale,
}: {
  children: ReactNode
  initialLocale: Locale
}) {
  return <LocaleProvider initialLocale={initialLocale}>{children}</LocaleProvider>
}
