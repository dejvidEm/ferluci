"use client"

import { useEffect } from "react"

/**
 * Checks if we're on Google Translate subdomain (translate.goog)
 */
function isOnTranslateSubdomain(): boolean {
  if (typeof window === "undefined") return false
  return window.location.hostname.includes("translate.goog")
}

/**
 * Global handler that intercepts ALL link clicks when on Google Translate subdomain
 * and forces them to use Google Translate URLs to prevent "Can't translate this page" errors
 */
export default function IframeLinkHandler() {
  useEffect(() => {
    if (typeof window === "undefined") return

    const handleClick = (e: MouseEvent) => {
      // Check if we're on translate subdomain
      if (!isOnTranslateSubdomain()) return

      const target = e.target as HTMLElement
      const link = target.closest("a")
      
      if (!link) return

      // Skip external links
      if (link.hostname && !link.hostname.includes("translate.goog") && link.hostname !== window.location.hostname.replace(".translate.goog", "")) {
        return
      }

      // Skip links that already have target="_blank"
      if (link.target === "_blank") {
        return
      }

      // Skip hash-only links
      const linkHref = link.getAttribute("href") || link.href
      if (!linkHref || linkHref.startsWith("#") || linkHref.startsWith("javascript:")) {
        return
      }

      // Skip if it's already a Google Translate URL
      if (linkHref.includes("translate.google.com") || linkHref.includes("translate.goog")) {
        return
      }

      // Convert to absolute URL
      let absoluteUrl = linkHref
      if (!linkHref.startsWith("http://") && !linkHref.startsWith("https://")) {
        // Remove translate.goog from current origin to get original domain
        const originalOrigin = window.location.origin.replace(".translate.goog", "").replace("www-", "www.")
        absoluteUrl = `${originalOrigin}${linkHref.startsWith("/") ? linkHref : "/" + linkHref}`
      }

      // Build Google Translate URL
      const encodedUrl = encodeURIComponent(absoluteUrl)
      const translateUrl = `https://translate.google.com/translate?sl=auto&tl=en&u=${encodedUrl}`

      // Prevent default and navigate to translated version
      e.preventDefault()
      e.stopPropagation()
      e.stopImmediatePropagation()

      window.location.href = translateUrl
    }

    // Use capture phase to catch before Next.js Link handlers
    document.addEventListener("click", handleClick, true)

    return () => {
      document.removeEventListener("click", handleClick, true)
    }
  }, [])

  return null
}
