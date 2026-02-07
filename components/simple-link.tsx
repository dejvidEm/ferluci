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
 * Simple link component that uses regular anchor tag when in iframe (Google Translate)
 * to prevent "Can't translate this page" errors
 */
export default function SimpleLink({ href, children, className, onClick, ...props }: SimpleLinkProps) {
  const [inIframe, setInIframe] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (typeof window !== "undefined") {
      // Check if we're in an iframe (Google Translate loads pages in iframes)
      setInIframe(window.top !== window.self)
    }
  }, [])

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // If in iframe, ensure we navigate the top window
    if (inIframe && typeof window !== "undefined") {
      e.preventDefault()
      e.stopPropagation()
      
      // Get absolute URL
      let absoluteUrl = href
      if (!href.startsWith("http://") && !href.startsWith("https://")) {
        absoluteUrl = `${window.location.origin}${href.startsWith("/") ? href : "/" + href}`
      }
      
      // Navigate top window to break out of iframe
      try {
        if (window.top) {
          window.top.location.href = absoluteUrl
        } else {
          window.location.href = absoluteUrl
        }
      } catch (err) {
        // Cross-origin error - use target="_top" approach
        window.open(absoluteUrl, "_top")
      }
      return
    }

    // Not in iframe, call original onClick
    if (onClick) {
      onClick(e)
    }
  }

  // If in iframe, use regular anchor tag with target="_top" to break out
  // This prevents Google Translate "Can't translate this page" error
  if (mounted && inIframe) {
    // Get absolute URL
    let absoluteUrl = href
    if (typeof window !== "undefined") {
      if (!href.startsWith("http://") && !href.startsWith("https://")) {
        absoluteUrl = `${window.location.origin}${href.startsWith("/") ? href : "/" + href}`
      }
    }

    return (
      <a
        href={absoluteUrl}
        target="_top"
        className={className}
        onClick={handleClick}
        {...props}
      >
        {children}
      </a>
    )
  }

  // Normal Next.js Link for non-iframe context
  return (
    <Link href={href} className={className} onClick={handleClick} {...props}>
      {children}
    </Link>
  )
}
