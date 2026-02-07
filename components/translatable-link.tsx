"use client"

import Link from "next/link"
import { useEffect, useState, useMemo } from "react"

interface TranslatableLinkProps {
  href: string
  children: React.ReactNode
  className?: string
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void
  [key: string]: any
}

export default function TranslatableLink({ href, children, className, onClick, ...props }: TranslatableLinkProps) {
  const [isInTranslateContext, setIsInTranslateContext] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (typeof window !== 'undefined') {
      const checkTranslateContext = () => {
        // Check if we're in an iframe (Google Translate loads pages in iframes)
        const inIframe = window.top !== window.self
        
        // Check if current URL contains translate.google.com
        const urlHasTranslate = window.location.href.includes('translate.google.com')
        
        // Check referrer
        const referrerHasTranslate = document.referrer.includes('translate.google.com')
        
        return inIframe || urlHasTranslate || referrerHasTranslate
      }
      
      setIsInTranslateContext(checkTranslateContext())
    }
  }, [])

  // Compute the actual href to use
  const actualHref = useMemo(() => {
    if (!mounted || typeof window === 'undefined' || !isInTranslateContext) {
      return href
    }

    // Get the full absolute URL
    let fullUrl: string
    if (href.startsWith('http://') || href.startsWith('https://')) {
      fullUrl = href
    } else {
      // Construct absolute URL
      const origin = window.location.origin
      fullUrl = `${origin}${href.startsWith('/') ? href : '/' + href}`
    }
    
    const encodedUrl = encodeURIComponent(fullUrl)
    return `https://translate.google.com/translate?sl=auto&tl=en&u=${encodedUrl}`
  }, [href, isInTranslateContext, mounted])

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // When using target="_top" with Google Translate URL, let browser handle navigation naturally
    // Only call custom onClick if provided and we're not in translate context
    if (!isInTranslateContext && onClick) {
      onClick(e)
    }
  }

  // If in translate context, use regular anchor tag with Google Translate URL
  // Use target="_top" to navigate the top-level window (not the iframe)
  // Otherwise use Next.js Link
  if (isInTranslateContext && mounted) {
    return (
      <a 
        href={actualHref}
        target="_top"
        className={className}
        onClick={handleClick}
        {...props}
      >
        {children}
      </a>
    )
  }

  return (
    <Link href={href} className={className} onClick={handleClick} {...props}>
      {children}
    </Link>
  )
}
