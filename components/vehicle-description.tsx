"use client"

import { PortableText, type PortableTextComponents } from "@portabletext/react"
import type { PortableTextBlock } from "@/lib/sanity/portableText"

interface VehicleDescriptionProps {
  value: PortableTextBlock[]
  className?: string
}

/**
 * Renders the vehicle description with the same look as the previous plain
 * <p>, but preserves rich-text styling and shows empty paragraphs as visible
 * blank lines (so a double Enter in Sanity becomes a blank line on the site).
 */
export function VehicleDescription({ value, className }: VehicleDescriptionProps) {
  const components: PortableTextComponents = {
    block: {
      normal: ({ children, value: block }) => {
        const isEmpty =
          !block?.children?.some(
            (child) =>
              child._type === "span" &&
              typeof (child as { text?: string }).text === "string" &&
              (child as { text: string }).text.trim().length > 0
          )
        if (isEmpty) {
          return <p aria-hidden="true" className="leading-relaxed">&nbsp;</p>
        }
        return <p className="leading-relaxed">{children}</p>
      },
    },
    list: {
      bullet: ({ children }) => (
        <ul className="list-disc pl-5 space-y-1">{children}</ul>
      ),
      number: ({ children }) => (
        <ol className="list-decimal pl-5 space-y-1">{children}</ol>
      ),
    },
    listItem: {
      bullet: ({ children }) => <li>{children}</li>,
      number: ({ children }) => <li>{children}</li>,
    },
    marks: {
      strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
      em: ({ children }) => <em className="italic">{children}</em>,
      underline: ({ children }) => <span className="underline">{children}</span>,
    },
  }

  return (
    <div className={className}>
      <PortableText value={value} components={components} />
    </div>
  )
}
