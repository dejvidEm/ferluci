"use client"

import { useEffect } from "react"

/**
 * Global handler that intercepts ALL link clicks when in iframe (Google Translate)
 * and forces them to break out of iframe to prevent "Can't translate this page" errors
 */
export default function IframeLinkHandler() {
  useEffect(() => {
    if (typeof window === "undefined") return

    const isInIframe = () => {
      try {
        return window.top !== window.self
      } catch (e) {
        return true // Cross-origin error = iframe
      }
    }

    const handleClick = (e: MouseEvent) => {
      // Check if we're in iframe
      if (!isInIframe()) return

      const target = e.target as HTMLElement
      const link = target.closest("a")
      
      if (!link) return

      // Skip external links
      if (link.hostname && link.hostname !== window.location.hostname && !link.hostname.includes(window.location.hostname)) {
        return
      }

      // Skip links that already have target="_blank" or target="_top"
      if (link.target === "_blank" || link.target === "_top") {
        return
      }

      // Skip hash-only links
      if (link.href && link.href.split("#")[0] === window.location.href.split("#")[0]) {
        return
      }

      // Get href
      const href = link.getAttribute("href")
      if (!href || href.startsWith("#") || href.startsWith("javascript:")) {
        return
      }

      // Convert to absolute URL
      let absoluteUrl = href
      if (!href.startsWith("http://") && !href.startsWith("https://")) {
        absoluteUrl = `${window.location.origin}${href.startsWith("/") ? href : "/" + href}`
      }

      // Prevent default and navigate top window
      e.preventDefault()
      e.stopPropagation()
      e.stopImmediatePropagation()

      try {
        if (window.top && window.top !== window.self) {
          window.top.location.href = absoluteUrl
        } else {
          window.location.href = absoluteUrl
        }
      } catch (err) {
        // Fallback
        window.location.href = absoluteUrl
      }
    }

    // Use capture phase to catch before Next.js Link handlers
    document.addEventListener("click", handleClick, true)

    return () => {
      document.removeEventListener("click", handleClick, true)
    }
  }, [])

  return null
}
