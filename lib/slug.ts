/**
 * Generate a slug from vehicle data
 * Format: year-make-model-stockNumber
 * Max length: 96 characters
 */
export function generateVehicleSlug(
  year: number,
  make: string,
  model: string,
  stockNumber: string
): string {
  const parts = [
    String(year),
    slugify(make),
    slugify(model),
    slugify(stockNumber),
  ]

  let slug = parts.join('-')
  
  // Ensure max length of 96
  if (slug.length > 96) {
    slug = slug.substring(0, 96)
    // Remove trailing dash if present
    slug = slug.replace(/-+$/, '')
  }

  return slug.toLowerCase()
}

/**
 * Slugify a string: lowercase, replace spaces/diacritics with '-', remove unsafe chars
 */
function slugify(str: string): string {
  return str
    .toString()
    .toLowerCase()
    .trim()
    // Replace diacritics
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    // Replace spaces and underscores with hyphens
    .replace(/\s+/g, '-')
    .replace(/_/g, '-')
    // Remove all non-word chars except hyphens
    .replace(/[^\w\-]+/g, '')
    // Replace multiple hyphens with single hyphen
    .replace(/\-\-+/g, '-')
    // Remove leading/trailing hyphens
    .replace(/^-+/, '')
    .replace(/-+$/, '')
}
