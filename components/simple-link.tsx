"use client"

import Link from "next/link"
import { useEffect, useState } from "react"

interface SimpleLinkProps {
  href: string
  children: React.ReactNode
  className?: string
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void
  [key: string]: any
}

/**
 * Simple link component that ALWAYS uses regular anchor tag when in iframe (Google Translate)
 * to prevent "Can't translate this page" errors
 */
export default function SimpleLink({ href, children, className, onClick, ...props }: SimpleLinkProps) {
  const [inIframe, setInIframe] = useState(true) // Default to true to be safe
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (typeof window !== "undefined") {
      // Check if we're in an iframe (Google Translate loads pages in iframes)
      const checkIframe = () => {
        try {
          setInIframe(window.top !== window.self)
        } catch (e) {
          // Cross-origin error means we're definitely in an iframe
          setInIframe(true)
        }
      }
      checkIframe()
      // Re-check periodically
      const interval = setInterval(checkIframe, 100)
      return () => clearInterval(interval)
    }
  }, [])

  // Get absolute URL helper
  const getAbsoluteUrl = (href: string): string => {
    if (href.startsWith("http://") || href.startsWith("https://")) {
      return href
    }
    if (typeof window !== "undefined") {
      return `${window.location.origin}${href.startsWith("/") ? href : "/" + href}`
    }
    return href
  }

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // ALWAYS check iframe status on click
    let currentlyInIframe = false
    if (typeof window !== "undefined") {
      try {
        currentlyInIframe = window.top !== window.self
      } catch (e) {
        currentlyInIframe = true // Cross-origin = iframe
      }
    }

    // If in iframe, ALWAYS break out
    if (currentlyInIframe) {
      e.preventDefault()
      e.stopPropagation()
      e.nativeEvent.stopImmediatePropagation()
      
      const absoluteUrl = getAbsoluteUrl(href)
      
      // Navigate top window to break out of iframe
      try {
        if (window.top && window.top !== window.self) {
          window.top.location.href = absoluteUrl
        } else {
          window.location.href = absoluteUrl
        }
      } catch (err) {
        // Cross-origin error - fallback
        window.location.href = absoluteUrl
      }
      return
    }

    // Not in iframe, call original onClick
    if (onClick) {
      onClick(e)
    }
  }

  // If in iframe OR not mounted yet (to be safe), use regular anchor tag
  // This prevents Google Translate "Can't translate this page" error
  if (!mounted || inIframe) {
    const absoluteUrl = getAbsoluteUrl(href)
    
    return (
      <a
        href={absoluteUrl}
        target="_top"
        rel="noopener noreferrer"
        className={className}
        onClick={handleClick}
        {...props}
      >
        {children}
      </a>
    )
  }

  // Normal Next.js Link ONLY when we're 100% sure we're NOT in iframe
  return (
    <Link href={href} className={className} onClick={handleClick} {...props}>
      {children}
    </Link>
  )
}
