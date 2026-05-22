/**
 * Helpers for converting between plain text and Sanity Portable Text blocks
 * used by the vehicle `description` field. Lets us:
 *   - render rich text (with empty paragraphs) on the site,
 *   - keep the existing string-based translation API,
 *   - stay backward compatible with vehicles whose description is still a string.
 */

export interface PortableTextSpan {
  _type: 'span'
  _key: string
  text: string
  marks?: string[]
}

export interface PortableTextBlock {
  _type: 'block'
  _key: string
  style?: string
  markDefs?: unknown[]
  children: PortableTextSpan[]
  listItem?: string
  level?: number
}

export type DescriptionValue = string | PortableTextBlock[] | null | undefined

function makeKey(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`
}

export function isPortableTextArray(value: unknown): value is PortableTextBlock[] {
  return (
    Array.isArray(value) &&
    value.every(
      (v) =>
        v !== null &&
        typeof v === 'object' &&
        (v as { _type?: unknown })._type === 'block'
    )
  )
}

/**
 * Convert a plain-text string into Portable Text blocks.
 * Each line (split on `\n`) becomes its own block, so a double Enter in the
 * source text results in a visible empty paragraph on the page.
 */
export function plainTextToPortableText(text: string): PortableTextBlock[] {
  const lines = (text ?? '').split('\n')
  // Drop a single trailing empty line (textareas often end with one) so we
  // don't render an unwanted blank paragraph at the bottom.
  if (lines.length > 1 && lines[lines.length - 1] === '') {
    lines.pop()
  }
  return lines.map((line) => ({
    _type: 'block' as const,
    _key: makeKey('b'),
    style: 'normal',
    markDefs: [],
    children: [
      {
        _type: 'span' as const,
        _key: makeKey('s'),
        text: line,
        marks: [],
      },
    ],
  }))
}

/**
 * Flatten Portable Text blocks back to a plain-text string. Paragraphs are
 * separated by single newlines so an empty block becomes a blank line — this
 * is the inverse of `plainTextToPortableText` and what the textarea expects.
 */
export function portableTextToPlainText(blocks: PortableTextBlock[]): string {
  return blocks
    .map((block) => {
      if (block._type !== 'block') return ''
      if (block.listItem) {
        const bullet = block.listItem === 'number' ? '1.' : '•'
        const text = (block.children || []).map((c) => c.text || '').join('')
        return `${bullet} ${text}`
      }
      return (block.children || []).map((c) => c.text || '').join('')
    })
    .join('\n')
}

/** Normalize any legacy/new shape into a Portable Text array we can render. */
export function normalizeDescription(value: DescriptionValue): PortableTextBlock[] {
  if (!value) return []
  if (typeof value === 'string') return plainTextToPortableText(value)
  if (isPortableTextArray(value)) return value
  return []
}

/**
 * Translate a Portable Text description while keeping its block structure.
 * Builds a single newline-joined string (one paragraph per line, empty
 * paragraphs preserved), runs `translateLines`, then rebuilds blocks from the
 * translated lines using the same keys/styles/marks as the originals when
 * the line count is unchanged.
 */
export function translatePortableText(
  blocks: PortableTextBlock[],
  translatedLines: string[]
): PortableTextBlock[] {
  if (blocks.length !== translatedLines.length) {
    // Line count mismatch — fall back to rebuilding from the translated text.
    return plainTextToPortableText(translatedLines.join('\n'))
  }
  return blocks.map((block, i) => {
    const translatedText = translatedLines[i] ?? ''
    return {
      ...block,
      children: [
        {
          _type: 'span' as const,
          _key: block.children?.[0]?._key ?? makeKey('s'),
          text: translatedText,
          marks: [],
        },
      ],
    }
  })
}

/** Stable fingerprint for caching/translation invalidation. */
export function descriptionFingerprint(blocks: PortableTextBlock[]): string {
  return portableTextToPlainText(blocks)
}
