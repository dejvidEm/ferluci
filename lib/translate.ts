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
  
  // Check if we're in an iframe (Google Translate loads pages in iframes)
  const inIframe = window.top !== window.self
  
  // Check current URL hostname
  const hostname = window.location.hostname
  const urlHasTranslate = 
    hostname.includes("translate.google.com") ||
    hostname.includes("translate.googleusercontent.com")
  
  // Check referrer
  const referrerHasTranslate = 
    typeof document !== "undefined" && 
    document.referrer.includes("translate.google.com")
  
  // Check if parent window is Google Translate (if we can access it)
  let parentHasTranslate = false
  if (inIframe) {
    try {
      const parentHostname = window.top?.location.hostname || ""
      parentHasTranslate = 
        parentHostname.includes("translate.google.com") ||
        parentHostname.includes("translate.googleusercontent.com")
    } catch (e) {
      // Cross-origin error - this is expected when in Google Translate iframe
      // If we can't access parent, and we're in iframe, likely Google Translate
      parentHasTranslate = true
    }
  }
  
  // Check URL parameters for translate indicators
  const urlParams = new URLSearchParams(window.location.search)
  const hasTranslateParam = urlParams.has("u") && (inIframe || referrerHasTranslate)
  
  return urlHasTranslate || (inIframe && parentHasTranslate) || referrerHasTranslate || hasTranslateParam
}

/**
 * Extracts the original URL from the current Google Translate page
 * @returns The original URL or null if not in Google Translate context
 */
export function getOriginalUrlFromTranslate(): string | null {
  if (typeof window === "undefined") return null
  
  if (!isInGoogleTranslate()) return null
  
  try {
    // First try to get from current window URL params
    const urlParams = new URLSearchParams(window.location.search)
    let originalUrl = urlParams.get("u")
    
    // If not found and we're in iframe, try parent window
    if (!originalUrl && window.top !== window.self) {
      try {
        const parentParams = new URLSearchParams(window.top!.location.search)
        originalUrl = parentParams.get("u")
      } catch (e) {
        // Cross-origin - can't access parent URL params directly
        // Try to extract from parent URL string if accessible
        try {
          const parentUrl = window.top!.location.href
          const parentUrlObj = new URL(parentUrl)
          originalUrl = parentUrlObj.searchParams.get("u")
        } catch (e2) {
          // Can't access parent URL
        }
      }
    }
    
    if (!originalUrl) {
      // Fallback: construct from current location (if we're in iframe, current location IS the original)
      if (window.top !== window.self) {
        return `${window.location.origin}${window.location.pathname}${window.location.search}${window.location.hash}`
      }
      return null
    }
    
    return decodeURIComponent(originalUrl)
  } catch (error) {
    console.error("Error extracting original URL from Google Translate:", error)
    // Fallback: return current location if in iframe
    if (window.top !== window.self) {
      return `${window.location.origin}${window.location.pathname}${window.location.search}${window.location.hash}`
    }
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
