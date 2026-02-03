import { NextRequest, NextResponse } from 'next/server'
import { adminClient } from '@/lib/sanity/adminClient'

interface UploadResult {
  _id: string
  url: string
  error?: string
}

// Maximum file size: 20MB (Sanity's limit is usually 20MB)
const MAX_FILE_SIZE = 20 * 1024 * 1024

// Retry configuration
const MAX_RETRIES = 3
const RETRY_DELAY = 1000 // 1 second base delay

// Sleep utility for retries
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

/**
 * Detect image format from magic bytes (file signature)
 */
function detectImageFormat(buffer: Buffer): { format: string; contentType: string; extension: string } | null {
  if (buffer.length < 4) return null

  // JPEG: FF D8 FF or FF D8
  if (buffer[0] === 0xFF && buffer[1] === 0xD8) {
    return { format: 'jpeg', contentType: 'image/jpeg', extension: 'jpg' }
  }

  // PNG: 89 50 4E 47
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) {
    return { format: 'png', contentType: 'image/png', extension: 'png' }
  }

  // GIF: 47 49 46 38 (GIF8) or 47 49 46 39 (GIF9)
  if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46 && 
      (buffer[3] === 0x38 || buffer[3] === 0x39)) {
    return { format: 'gif', contentType: 'image/gif', extension: 'gif' }
  }

  // WebP: RIFF...WEBP (check at offset 8)
  if (buffer.length >= 12 && 
      buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46 &&
      buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50) {
    return { format: 'webp', contentType: 'image/webp', extension: 'webp' }
  }

  // BMP: 42 4D
  if (buffer[0] === 0x42 && buffer[1] === 0x4D) {
    return { format: 'bmp', contentType: 'image/bmp', extension: 'bmp' }
  }

  // TIFF: 49 49 2A 00 (little-endian) or 4D 4D 00 2A (big-endian)
  if ((buffer[0] === 0x49 && buffer[1] === 0x49 && buffer[2] === 0x2A && buffer[3] === 0x00) ||
      (buffer[0] === 0x4D && buffer[1] === 0x4D && buffer[2] === 0x00 && buffer[3] === 0x2A)) {
    return { format: 'tiff', contentType: 'image/tiff', extension: 'tiff' }
  }

  // HEIC/HEIF: ftyp box (more complex, check for ftyp)
  if (buffer.length >= 12 && 
      buffer[4] === 0x66 && buffer[5] === 0x74 && buffer[6] === 0x79 && buffer[7] === 0x70) {
    // Check for heic/heif brands
    const brand = String.fromCharCode(buffer[8], buffer[9], buffer[10], buffer[11])
    if (brand.includes('heic') || brand.includes('heif') || brand.includes('mif1')) {
      return { format: 'heic', contentType: 'image/heic', extension: 'heic' }
    }
  }

  return null
}

/**
 * Generate a safe filename that matches Sanity's pattern: [a-z0-9._-]+\.[a-z]{2,4}
 */
function generateSafeFilename(extension: string): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 10) // 8 random chars
  return `img_${timestamp}_${random}.${extension}`
}

/**
 * Upload a single image to Sanity with retry logic
 */
async function uploadImageToSanity(
  file: File,
  retryCount = 0
): Promise<UploadResult> {
  try {
    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      throw new Error(`Súbor "${file.name}" je príliš veľký. Maximálna veľkosť je ${MAX_FILE_SIZE / 1024 / 1024}MB.`)
    }

    if (file.size === 0) {
      throw new Error(`Súbor "${file.name}" je prázdny.`)
    }

    // Read file as array buffer
    const arrayBuffer = await file.arrayBuffer()
    
    if (!arrayBuffer || arrayBuffer.byteLength === 0) {
      throw new Error(`Nepodarilo sa načítať súbor "${file.name}".`)
    }

    const buffer = Buffer.from(arrayBuffer)

    // Detect image format from magic bytes
    const detectedFormat = detectImageFormat(buffer)
    
    // Fallback to file.type or extension if magic bytes don't match
    let contentType = file.type || 'application/octet-stream'
    let extension = 'jpg'

    if (detectedFormat) {
      contentType = detectedFormat.contentType
      extension = detectedFormat.extension
    } else {
      // Try to determine from file.type
      if (file.type && file.type.startsWith('image/')) {
        const typeExt = file.type.split('/')[1]?.toLowerCase()
        const extMap: Record<string, string> = {
          'jpeg': 'jpg',
          'jpg': 'jpg',
          'png': 'png',
          'gif': 'gif',
          'webp': 'webp',
          'bmp': 'bmp',
          'tiff': 'tiff',
          'tif': 'tiff',
          'heic': 'heic',
          'heif': 'heic',
        }
        extension = extMap[typeExt || ''] || 'jpg'
        contentType = file.type
      } else {
        // Try to get from filename extension
        const filenameExt = file.name.toLowerCase().match(/\.([^.]+)$/)?.[1]
        if (filenameExt) {
          const extMap: Record<string, { ext: string; contentType: string }> = {
            'jpg': { ext: 'jpg', contentType: 'image/jpeg' },
            'jpeg': { ext: 'jpg', contentType: 'image/jpeg' },
            'png': { ext: 'png', contentType: 'image/png' },
            'gif': { ext: 'gif', contentType: 'image/gif' },
            'webp': { ext: 'webp', contentType: 'image/webp' },
            'bmp': { ext: 'bmp', contentType: 'image/bmp' },
            'tiff': { ext: 'tiff', contentType: 'image/tiff' },
            'tif': { ext: 'tiff', contentType: 'image/tiff' },
            'heic': { ext: 'heic', contentType: 'image/heic' },
            'heif': { ext: 'heic', contentType: 'image/heic' },
          }
          const mapped = extMap[filenameExt]
          if (mapped) {
            extension = mapped.ext
            contentType = mapped.contentType
          }
        }
      }
    }

    // Generate safe filename
    const filename = generateSafeFilename(extension)

    // Upload to Sanity with retry logic
    try {
      const asset = await adminClient.assets.upload('image', buffer, {
        filename: filename,
        contentType: contentType,
      })

      return {
        _id: asset._id,
        url: asset.url,
      }
    } catch (uploadError: any) {
      // Handle retryable errors
      const isRetryable = 
        uploadError?.statusCode === 429 || // Rate limit
        uploadError?.statusCode === 503 || // Service unavailable
        uploadError?.statusCode === 502 || // Bad gateway
        uploadError?.statusCode === 504 || // Gateway timeout
        (uploadError?.message && (
          uploadError.message.includes('timeout') ||
          uploadError.message.includes('network') ||
          uploadError.message.includes('ECONNRESET') ||
          uploadError.message.includes('ETIMEDOUT')
        ))

      if (isRetryable && retryCount < MAX_RETRIES) {
        const delay = RETRY_DELAY * Math.pow(2, retryCount) // Exponential backoff
        await sleep(delay)
        return uploadImageToSanity(file, retryCount + 1)
      }

      // Extract error message safely
      let errorMessage = 'Neznáma chyba'
      
      if (uploadError?.message) {
        errorMessage = uploadError.message
      } else if (uploadError?.body) {
        // Try to parse error body if it's a string
        if (typeof uploadError.body === 'string') {
          try {
            const parsed = JSON.parse(uploadError.body)
            errorMessage = parsed.message || parsed.error || errorMessage
          } catch {
            // If it's not JSON, use the string directly (truncated)
            errorMessage = uploadError.body.substring(0, 200)
          }
        } else if (typeof uploadError.body === 'object') {
          errorMessage = uploadError.body.message || uploadError.body.error || errorMessage
        }
      } else if (typeof uploadError === 'string') {
        errorMessage = uploadError
      }

      // Clean up error message
      if (errorMessage.includes('Request Entity Too Large') || errorMessage.includes('413')) {
        errorMessage = `Súbor "${file.name}" je príliš veľký.`
      } else if (errorMessage.includes('pattern') || errorMessage.includes('validation')) {
        errorMessage = `Neplatný formát súboru "${file.name}".`
      } else if (errorMessage.includes('Unexpected token')) {
        errorMessage = `Chyba pri komunikácii so serverom pre "${file.name}". Skúste to znova.`
      }

      throw new Error(errorMessage)
    }
  } catch (error: any) {
    const errorMessage = error?.message || String(error) || 'Neznáma chyba'
    throw new Error(errorMessage)
  }
}

/**
 * Upload files sequentially with proper error handling
 */
async function uploadSequentially(files: File[]): Promise<UploadResult[]> {
  const results: UploadResult[] = []

  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    try {
      const result = await uploadImageToSanity(file)
      results.push(result)
    } catch (error: any) {
      const errorMessage = error?.message || String(error) || 'Neznáma chyba'
      results.push({
        _id: '',
        url: '',
        error: errorMessage,
      })
    }
  }

  return results
}

export async function POST(request: NextRequest) {
  try {
    // Validate environment variables
    const projectId = process.env.SANITY_PROJECT_ID
    const dataset = process.env.SANITY_DATASET
    const token = process.env.SANITY_WRITE_TOKEN

    if (!projectId || !dataset || !token) {
      const missing = []
      if (!projectId) missing.push('SANITY_PROJECT_ID')
      if (!dataset) missing.push('SANITY_DATASET')
      if (!token) missing.push('SANITY_WRITE_TOKEN')
      return NextResponse.json(
        { error: `Chyba konfigurácie: Chýbajú ${missing.join(', ')}.` },
        { status: 500 }
      )
    }

    // Parse form data
    let formData: FormData
    try {
      formData = await request.formData()
    } catch (error) {
      return NextResponse.json(
        { error: 'Nepodarilo sa načítať dáta z požiadavky.' },
        { status: 400 }
      )
    }

    const files = formData.getAll('files') as File[]

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'Neboli poskytnuté žiadne súbory.' },
        { status: 400 }
      )
    }

    // Validate files
    for (const file of files) {
      if (!file || !(file instanceof File)) {
        return NextResponse.json(
          { error: 'Neplatný súbor.' },
          { status: 400 }
        )
      }

      // Basic validation - check if it looks like an image
      const hasImageExtension = /\.(jpg|jpeg|png|gif|webp|bmp|tiff|tif|heic|heif)$/i.test(file.name)
      const hasImageType = file.type && file.type.startsWith('image/')
      
      if (!hasImageType && !hasImageExtension) {
        return NextResponse.json(
          { error: `Súbor "${file.name}" nevyzerá ako obrázok.` },
          { status: 400 }
        )
      }
    }

    // Upload files
    const results = await uploadSequentially(files)

    // Check if all failed
    const errors = results.filter(r => r.error)
    if (errors.length === results.length) {
      return NextResponse.json(
        { 
          error: 'Všetky nahrávania zlyhali.',
          results 
        },
        { status: 500 }
      )
    }

    return NextResponse.json({ results })
  } catch (error: any) {
    console.error('Image upload error:', error)
    const errorMessage = error?.message || String(error) || 'Interná chyba servera'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
