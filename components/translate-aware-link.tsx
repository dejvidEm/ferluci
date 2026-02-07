"use client"

import Link from "next/link"
import { useCallback, useEffect, useState } from "react"
import {
  buildTranslateUrl,
  isInGoogleTranslate,
  getOriginalUrlFromTranslate,
  resolveAbsoluteUrl,
} from "@/lib/translate"

interface TranslateAwareLinkProps {
  href: string
  children: React.ReactNode
  className?: string
  tl?: string
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void
  prefetch?: boolean
  [key: string]: any
}

export default function TranslateAwareLink({
  href,
  children,
  className,
  tl = "en",
  onClick,
  prefetch = true,
  ...props
}: TranslateAwareLinkProps) {
  const [inTranslate, setInTranslate] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setInTranslate(isInGoogleTranslate())
  }, [])

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (!mounted) {
        if (onClick) onClick(e)
        return
      }

      // Check translate context dynamically
      const isInTranslate = isInGoogleTranslate()

      if (isInTranslate) {
        e.preventDefault()
        e.stopPropagation()

        // Get original URL from Google Translate
        const originalUrl = getOriginalUrlFromTranslate()

        if (originalUrl) {
          try {
            // Resolve destination URL using original URL as base
            const baseUrl = new URL(originalUrl)
            const destUrl = resolveAbsoluteUrl(href, baseUrl.toString())
            
            // Build translate URL and navigate
            const translateUrl = buildTranslateUrl(destUrl, tl)
            window.location.href = translateUrl
          } catch (error) {
            console.error("Error handling translate-aware navigation:", error)
            // Fallback: try with current origin
            const destUrl = resolveAbsoluteUrl(href)
            const translateUrl = buildTranslateUrl(destUrl, tl)
            window.location.href = translateUrl
          }
        } else {
          // Fallback: use current origin
          const destUrl = resolveAbsoluteUrl(href)
          const translateUrl = buildTranslateUrl(destUrl, tl)
          window.location.href = translateUrl
        }
        return
      }

      // Not in translate context, call original onClick
      if (onClick) {
        onClick(e)
      }
    },
    [href, tl, onClick, mounted]
  )

  // If in translate context, use regular anchor tag (Next.js Link won't work properly)
  // Otherwise use Next.js Link for client-side navigation
  if (mounted && inTranslate) {
    // In translate context: use regular anchor with translate URL
    const originalUrl = getOriginalUrlFromTranslate()
    let translateHref = href

    if (originalUrl) {
      try {
        const baseUrl = new URL(originalUrl)
        const destUrl = resolveAbsoluteUrl(href, baseUrl.toString())
        translateHref = buildTranslateUrl(destUrl, tl)
      } catch (error) {
        const destUrl = resolveAbsoluteUrl(href)
        translateHref = buildTranslateUrl(destUrl, tl)
      }
    } else {
      const destUrl = resolveAbsoluteUrl(href)
      translateHref = buildTranslateUrl(destUrl, tl)
    }

    // For hash links, we still want to translate but preserve the hash behavior
    // However, Google Translate doesn't handle hash links well, so we'll use the full URL
    return (
      <a
        href={translateHref}
        className={className}
        onClick={handleClick}
        {...props}
      >
        {children}
      </a>
    )
  }

  // Normal Next.js Link for non-translate context
  return (
    <Link
      href={href}
      className={className}
      onClick={handleClick}
      prefetch={prefetch}
      {...props}
    >
      {children}
    </Link>
  )
}
