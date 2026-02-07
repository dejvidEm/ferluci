"use client"

import { useEffect } from "react"

export default function TranslateLinkHandler() {
  useEffect(() => {
    if (typeof window === 'undefined') return

    const isInTranslateContext = () => {
      // Check if we're in an iframe (Google Translate loads pages in iframes)
      const inIframe = window.top !== window.self
      
      // Check if current URL contains translate.google.com
      const urlHasTranslate = window.location.href.includes('translate.google.com')
      
      // Check referrer
      const referrerHasTranslate = document.referrer.includes('translate.google.com')
      
      return inIframe || urlHasTranslate || referrerHasTranslate
    }

    const convertToTranslateUrl = (href: string): string => {
      // If already a Google Translate URL, return as is
      if (href.includes('translate.google.com')) {
        return href
      }

      // Get the full absolute URL
      let fullUrl: string
      if (href.startsWith('http://') || href.startsWith('https://')) {
        fullUrl = href
      } else if (href.startsWith('/')) {
        // Relative URL starting with /
        fullUrl = `${window.location.origin}${href}`
      } else {
        // Relative URL without /
        const currentPath = window.location.pathname
        const basePath = currentPath.endsWith('/') ? currentPath.slice(0, -1) : currentPath
        const dirPath = basePath.substring(0, basePath.lastIndexOf('/') + 1)
        fullUrl = `${window.location.origin}${dirPath}${href}`
      }
      
      const encodedUrl = encodeURIComponent(fullUrl)
      return `https://translate.google.com/translate?sl=auto&tl=en&u=${encodedUrl}`
    }

    const handleLinkClick = (e: MouseEvent) => {
      if (!isInTranslateContext()) return

      const target = e.target as HTMLElement
      const anchor = target.closest('a')
      
      if (!anchor) return

      // Skip external links and links that already have target="_blank"
      if (anchor.hostname !== window.location.hostname && !anchor.href.startsWith(window.location.origin)) {
        return
      }

      // Skip if it's already a Google Translate URL
      if (anchor.href.includes('translate.google.com')) {
        return
      }

      // Get the original href
      const originalHref = anchor.getAttribute('href')
      if (!originalHref || originalHref.startsWith('#') || originalHref.startsWith('javascript:')) {
        return
      }

      // Convert to Google Translate URL
      const translateUrl = convertToTranslateUrl(originalHref)

      // Prevent default navigation
      e.preventDefault()
      e.stopPropagation()

      // Navigate to translated URL in top-level window
      try {
        if (window.top && window.top !== window.self) {
          // We're in iframe, navigate parent window
          window.top.location.href = translateUrl
        } else {
          // Not in iframe, navigate current window
          window.location.href = translateUrl
        }
      } catch (err) {
        // Cross-origin error - use target="_top" approach
        anchor.href = translateUrl
        anchor.target = '_top'
        anchor.click()
      }
    }

    // Add click listener to document
    document.addEventListener('click', handleLinkClick, true) // Use capture phase

    // Also modify all existing links on the page
    const modifyAllLinks = () => {
      if (!isInTranslateContext()) return

      const links = document.querySelectorAll('a[href]')
      links.forEach((link) => {
        const anchor = link as HTMLAnchorElement
        const href = anchor.getAttribute('href')
        
        if (!href || href.startsWith('#') || href.startsWith('javascript:')) {
          return
        }

        // Skip external links
        if (href.startsWith('http://') || href.startsWith('https://')) {
          if (!href.startsWith(window.location.origin) && !href.includes('translate.google.com')) {
            return
          }
        }

        // Skip if already a Google Translate URL
        if (href.includes('translate.google.com')) {
          return
        }

        // Convert to Google Translate URL
        const translateUrl = convertToTranslateUrl(href)
        anchor.href = translateUrl
        anchor.target = '_top'
      })
    }

    // Modify links immediately and on DOM changes
    modifyAllLinks()

    // Watch for new links added dynamically
    const observer = new MutationObserver(() => {
      modifyAllLinks()
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    })

    return () => {
      document.removeEventListener('click', handleLinkClick, true)
      observer.disconnect()
    }
  }, [])

  return null
}
