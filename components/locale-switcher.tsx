"use client"

import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useLocale } from "@/lib/i18n/context"
import type { Locale } from "@/lib/i18n/config"
import { cn } from "@/lib/utils"

const LOCALES: Locale[] = ["sk", "en"]

export function LocaleSwitcher({ className }: { className?: string }) {
  const pathname = usePathname()
  const { locale, setLocale, t } = useLocale()

  if (pathname?.startsWith("/admin")) {
    return null
  }

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-lg border border-white/20 bg-[#121212]/80 p-0.5",
        className
      )}
      role="group"
      aria-label={t("locale.switchLanguage")}
    >
      {LOCALES.map((l) => (
        <Button
          key={l}
          type="button"
          variant={locale === l ? "default" : "ghost"}
          size="sm"
          className={cn(
            "h-8 min-w-[2.25rem] px-2 text-xs",
            locale !== l && "text-gray-300 hover:text-white"
          )}
          onClick={() => setLocale(l)}
        >
          {t(`locale.${l}`)}
        </Button>
      ))}
    </div>
  )
}
