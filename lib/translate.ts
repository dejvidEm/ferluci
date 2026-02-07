/**
 * Utility functions for Google Translate integration
 */

/**
 * Builds a Google Translate URL for a given target URL
 * @param targetUrl - The absolute URL to translate
 * @param tl - Target language code (default: "en")
 * @returns Google Translate URL
 */
export function buildTranslateUrl(targetUrl: string, tl: string = "en"): string {
  const encodedUrl = encodeURIComponent(targetUrl)
  return `https://translate.google.com/translate?sl=auto&tl=${tl}&u=${encodedUrl}`
}

/**
 * Checks if the current page is being viewed through Google Translate
 * @returns true if in Google Translate context
 */
export function isInGoogleTranslate(): boolean {
  if (typeof window === "undefined") return false
  
  const hostname = window.location.hostname
  return (
    hostname.includes("translate.google.com") ||
    hostname.includes("translate.googleusercontent.com")
  )
}

/**
 * Extracts the original URL from the current Google Translate page
 * @returns The original URL or null if not in Google Translate context
 */
export function getOriginalUrlFromTranslate(): string | null {
  if (typeof window === "undefined") return null
  
  if (!isInGoogleTranslate()) return null
  
  try {
    const urlParams = new URLSearchParams(window.location.search)
    const originalUrl = urlParams.get("u")
    
    if (!originalUrl) return null
    
    return decodeURIComponent(originalUrl)
  } catch (error) {
    console.error("Error extracting original URL from Google Translate:", error)
    return null
  }
}

/**
 * Converts a relative or absolute href to an absolute URL
 * @param href - The href (can be relative or absolute)
 * @param baseUrl - Base URL to resolve relative hrefs against (default: current origin)
 * @returns Absolute URL
 */
export function resolveAbsoluteUrl(href: string, baseUrl?: string): string {
  // If already absolute, return as is
  if (href.startsWith("http://") || href.startsWith("https://")) {
    return href
  }
  
  // Handle hash-only links - keep them relative to current page
  if (href.startsWith("#")) {
    if (baseUrl) {
      // Use baseUrl but replace hash if present
      try {
        const base = new URL(baseUrl)
        base.hash = href
        return base.toString()
      } catch {
        // Fallback
        return `${baseUrl}${href}`
      }
    }
    // No baseUrl provided, use current location
    if (typeof window !== "undefined") {
      return `${window.location.origin}${window.location.pathname}${href}`
    }
    return href
  }
  
  // Resolve relative URL
  try {
    const base = baseUrl || (typeof window !== "undefined" ? window.location.origin : "")
    const baseUrlObj = new URL(base)
    const resolvedUrl = new URL(href, baseUrlObj)
    return resolvedUrl.toString()
  } catch (error) {
    // Fallback: simple concatenation
    const basePath = baseUrl || (typeof window !== "undefined" ? window.location.origin : "")
    return `${basePath}${href.startsWith("/") ? href : "/" + href}`
  }
}
