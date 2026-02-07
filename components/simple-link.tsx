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
 * Checks if we're on Google Translate subdomain (translate.goog)
 */
function isOnTranslateSubdomain(): boolean {
  if (typeof window === "undefined") return false
  return window.location.hostname.includes("translate.goog")
}

/**
 * Simple link component that ALWAYS uses regular anchor tag when on Google Translate subdomain
 * to prevent "Can't translate this page" errors
 */
export default function SimpleLink({ href, children, className, onClick, ...props }: SimpleLinkProps) {
  const [onTranslateSubdomain, setOnTranslateSubdomain] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (typeof window !== "undefined") {
      // Check if we're on Google Translate subdomain
      const checkTranslate = () => {
        setOnTranslateSubdomain(isOnTranslateSubdomain())
      }
      checkTranslate()
      // Re-check periodically
      const interval = setInterval(checkTranslate, 100)
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
    // ALWAYS check translate subdomain on click
    const onTranslate = isOnTranslateSubdomain()

    // If on translate subdomain, ALWAYS do full page reload
    if (onTranslate) {
      e.preventDefault()
      e.stopPropagation()
      e.nativeEvent.stopImmediatePropagation()
      
      const absoluteUrl = getAbsoluteUrl(href)
      
      // Build Google Translate URL for the destination
      const encodedUrl = encodeURIComponent(absoluteUrl)
      const translateUrl = `https://translate.google.com/translate?sl=auto&tl=en&u=${encodedUrl}`
      
      // Navigate to translated version of destination page
      window.location.href = translateUrl
      return
    }

    // Not on translate subdomain, call original onClick
    if (onClick) {
      onClick(e)
    }
  }

  // If on translate subdomain OR not mounted yet (to be safe), use regular anchor tag
  // This prevents Google Translate "Can't translate this page" error
  if (!mounted || onTranslateSubdomain) {
    const absoluteUrl = getAbsoluteUrl(href)
    
    // Build Google Translate URL for the destination
    const encodedUrl = encodeURIComponent(absoluteUrl)
    const translateUrl = `https://translate.google.com/translate?sl=auto&tl=en&u=${encodedUrl}`
    
    return (
      <a
        href={translateUrl}
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
