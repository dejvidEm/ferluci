"use client"

import Link from "next/link"
import { useEffect, useState } from "react"

interface TranslatableLinkProps {
  href: string
  children: React.ReactNode
  className?: string
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void
  [key: string]: any
}

export default function TranslatableLink({ href, children, className, onClick, ...props }: TranslatableLinkProps) {
  const [isInTranslateContext, setIsInTranslateContext] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const inIframe = window.top !== window.self
      const urlHasTranslate = window.location.href.includes('translate.google.com')
      const referrerHasTranslate = document.referrer.includes('translate.google.com')
      
      setIsInTranslateContext(inIframe || urlHasTranslate || referrerHasTranslate)
    }
  }, [])

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (isInTranslateContext && typeof window !== 'undefined') {
      e.preventDefault()
      e.stopPropagation()
      
      const baseUrl = window.location.origin
      const fullUrl = `${baseUrl}${href}`
      const encodedUrl = encodeURIComponent(fullUrl)
      const translateUrl = `https://translate.google.com/translate?sl=auto&tl=en&u=${encodedUrl}`
      
      try {
        if (window.top && window.top !== window.self) {
          window.top.location.href = translateUrl
        } else {
          window.location.href = translateUrl
        }
      } catch (err) {
        window.open(translateUrl, '_blank', 'noopener,noreferrer')
      }
      return
    }
    
    // Call original onClick if provided
    if (onClick) {
      onClick(e)
    }
  }

  return (
    <Link href={href} className={className} onClick={handleClick} {...props}>
      {children}
    </Link>
  )
}
