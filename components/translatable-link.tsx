"use client"

import Link from "next/link"

interface TranslatableLinkProps {
  href: string
  children: React.ReactNode
  className?: string
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void
  [key: string]: any
}

// Simplified component - the global TranslateLinkHandler will handle translation
// This component just wraps Next.js Link normally
export default function TranslatableLink({ href, children, className, onClick, ...props }: TranslatableLinkProps) {
  return (
    <Link href={href} className={className} onClick={onClick} {...props}>
      {children}
    </Link>
  )
}
