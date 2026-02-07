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
    // Check translate context on mount
    const checkTranslate = () => {
      if (typeof window !== "undefined") {
        setInTranslate(isInGoogleTranslate())
      }
    }
    checkTranslate()
    
    // Re-check periodically and on navigation
    const interval = setInterval(checkTranslate, 300)
    const handlePopState = () => checkTranslate()
    window.addEventListener("popstate", handlePopState)
    
    return () => {
      clearInterval(interval)
      window.removeEventListener("popstate", handlePopState)
    }
  }, [])

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      // Always check translate context on click (don't wait for mounted state)
      const isInTranslate = typeof window !== "undefined" && isInGoogleTranslate()

      if (isInTranslate) {
        // CRITICAL: Prevent default and stop propagation FIRST
        e.preventDefault()
        e.stopPropagation()
        e.nativeEvent.stopImmediatePropagation()

        // Get original URL from Google Translate
        const originalUrl = getOriginalUrlFromTranslate()

        let destUrl: string
        if (originalUrl) {
          try {
            // Resolve destination URL using original URL as base
            const baseUrl = new URL(originalUrl)
            destUrl = resolveAbsoluteUrl(href, baseUrl.toString())
          } catch (error) {
            console.error("Error resolving URL with original base:", error)
            // Fallback: use current origin
            destUrl = resolveAbsoluteUrl(href)
          }
        } else {
          // Fallback: use current origin
          destUrl = resolveAbsoluteUrl(href)
        }
        
        // Build translate URL and navigate
        const translateUrl = buildTranslateUrl(destUrl, tl)
        
        // Use setTimeout to ensure navigation happens after event handling
        setTimeout(() => {
          window.location.href = translateUrl
        }, 0)
        
        return
      }

      // Not in translate context, call original onClick
      if (onClick) {
        onClick(e)
      }
    },
    [href, tl, onClick]
  )

  // Compute translate URL if needed
  const getTranslateHref = useCallback(() => {
    const originalUrl = getOriginalUrlFromTranslate()
    let destUrl: string

    if (originalUrl) {
      try {
        const baseUrl = new URL(originalUrl)
        destUrl = resolveAbsoluteUrl(href, baseUrl.toString())
      } catch (error) {
        destUrl = resolveAbsoluteUrl(href)
      }
    } else {
      destUrl = resolveAbsoluteUrl(href)
    }

    return buildTranslateUrl(destUrl, tl)
  }, [href, tl])

  // Always check translate context dynamically
  const currentInTranslate = mounted && typeof window !== "undefined" && isInGoogleTranslate()
  
  // If in translate context OR potentially in translate (iframe), use anchor tag
  // This ensures we don't use Next.js Link which would interfere
  if (mounted && (currentInTranslate || inTranslate || (typeof window !== "undefined" && window.top !== window.self))) {
    const translateHref = getTranslateHref()
    
    return (
      <a
        href={translateHref}
        className={className}
        onClick={handleClick}
        data-translate-link="true"
        {...props}
      >
        {children}
      </a>
    )
  }

  // Normal Next.js Link for non-translate context
  // Still add click handler to catch translate context changes
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
