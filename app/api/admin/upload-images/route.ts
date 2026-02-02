import { NextRequest, NextResponse } from 'next/server'
import { adminClient } from '@/lib/sanity/adminClient'

// Upload images sequentially (one by one) to show progress

interface UploadResult {
  _id: string
  url: string
  error?: string
}

async function uploadImageToSanity(
  file: File,
  _projectId: string,
  _dataset: string,
  _token: string
): Promise<UploadResult> {
  // Read file as array buffer and convert to Buffer
  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)
  
  // Verify it's a valid image by checking magic bytes
  // JPEG: FF D8 FF (standard) or FF D8 (some variants)
  const isJPEG = (buffer[0] === 0xFF && buffer[1] === 0xD8) || 
                 (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF)
  // PNG: 89 50 4E 47
  const isPNG = buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47
  // GIF: 47 49 46 38 (GIF8)
  const isGIF = (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x38) ||
                (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46)
  // WebP: RIFF...WEBP
  const isWebP = buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46 &&
                  buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50
  // BMP: 42 4D
  const isBMP = buffer[0] === 0x42 && buffer[1] === 0x4D
  // TIFF: 49 49 2A 00 (little-endian) or 4D 4D 00 2A (big-endian)
  const isTIFF = (buffer[0] === 0x49 && buffer[1] === 0x49 && buffer[2] === 0x2A && buffer[3] === 0x00) ||
                 (buffer[0] === 0x4D && buffer[1] === 0x4D && buffer[2] === 0x00 && buffer[3] === 0x2A)
  
  const isValidImageByMagicBytes = isJPEG || isPNG || isGIF || isWebP || isBMP || isTIFF
  
  // Also check file.type as fallback (some browsers may not set magic bytes correctly)
  const isValidImageByType = file.type && file.type.startsWith('image/')
  
  const isValidImage = isValidImageByMagicBytes || isValidImageByType
  
  console.log(`File ${file.name}:`, {
    type: file.type,
    size: buffer.length,
    firstBytes: buffer.slice(0, 12).toString('hex'),
    isValidImageByMagicBytes,
    isValidImageByType,
    isValidImage,
    isJPEG,
    isPNG,
    isGIF,
    isWebP,
    isBMP,
    isTIFF,
  })
  
  if (!isValidImage) {
    throw new Error(`File ${file.name} is not a valid image format. Expected JPEG, PNG, GIF, WebP, BMP, or TIFF.`)
  }
  
  // Determine content type
  let contentType = file.type
  if (!contentType || contentType === 'application/octet-stream' || contentType === '') {
    if (isJPEG) contentType = 'image/jpeg'
    else if (isPNG) contentType = 'image/png'
    else if (isGIF) contentType = 'image/gif'
    else if (isWebP) contentType = 'image/webp'
    else if (isBMP) contentType = 'image/bmp'
    else if (isTIFF) contentType = 'image/tiff'
    else contentType = 'image/jpeg' // fallback
  }
  
  // Sanitize filename - remove invalid characters and ensure proper extension
  let filename = file.name
  // Remove path separators and other invalid characters
  filename = filename.replace(/[\/\\]/g, '_')
  // Keep only alphanumeric, dots, dashes, and underscores
  filename = filename.replace(/[^a-zA-Z0-9._-]/g, '_')
  // Ensure filename doesn't start or end with dot or dash
  filename = filename.replace(/^[._-]+|[._-]+$/g, '')
  // Ensure we have a valid filename
  if (!filename || filename.length === 0) {
    filename = `image_${Date.now()}.jpg`
  }
  
  // Ensure filename has proper extension matching content type
  const extension = filename.toLowerCase().split('.').pop()
  const contentTypeExt = contentType.split('/')[1]?.toLowerCase()
  
  // Map content types to file extensions
  const extMap: Record<string, string> = {
    'jpeg': 'jpg',
    'jpg': 'jpg',
    'png': 'png',
    'gif': 'gif',
    'webp': 'webp',
    'bmp': 'bmp',
    'tiff': 'tiff',
  }
  
  const expectedExt = extMap[contentTypeExt || ''] || 'jpg'
  
  // If extension doesn't match or is missing, add correct one
  if (!extension || !extMap[extension] || extMap[extension] !== expectedExt) {
    const nameWithoutExt = filename.replace(/\.[^.]*$/, '') || filename
    filename = `${nameWithoutExt}.${expectedExt}`
  }
  
  // Use Sanity client's assets.upload method which handles the format correctly
  try {
    const asset = await adminClient.assets.upload('image', buffer, {
      filename: filename,
      contentType: contentType,
    })
    
    return {
      _id: asset._id,
      url: asset.url,
    }
  } catch (error) {
    console.error('Sanity client upload error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('Upload error details:', {
      originalFilename: file.name,
      sanitizedFilename: filename,
      contentType,
      fileSize: buffer.length,
      fileType: file.type,
      error: errorMessage,
    })
    throw new Error(`Failed to upload ${file.name}: ${errorMessage}`)
  }
}

async function uploadSequentially(
  files: File[]
): Promise<UploadResult[]> {
  const results: UploadResult[] = []

  // Upload files one by one
  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    try {
      console.log(`Uploading image ${i + 1}/${files.length}: ${file.name}`)
      const result = await uploadImageToSanity(file, '', '', '')
      results.push(result)
      console.log(`Successfully uploaded ${i + 1}/${files.length}`)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      console.error(`Failed to upload ${file.name}:`, errorMessage)
      results.push({
        _id: '',
        url: '',
        error: `Failed to upload ${file.name}: ${errorMessage}`,
      })
    }
  }

  const errors = results.filter(r => r.error)
  if (errors.length > 0 && results.filter(r => !r.error).length === 0) {
    throw new Error(`All uploads failed: ${errors.map(e => e.error).join(', ')}`)
  }

  return results
}

export async function POST(request: NextRequest) {
  try {
    const projectId = process.env.SANITY_PROJECT_ID
    const dataset = process.env.SANITY_DATASET
    const token = process.env.SANITY_WRITE_TOKEN

    if (!projectId || !dataset || !token) {
      const missing = []
      if (!projectId) missing.push('SANITY_PROJECT_ID')
      if (!dataset) missing.push('SANITY_DATASET')
      if (!token) missing.push('SANITY_WRITE_TOKEN')
      return NextResponse.json(
        { error: `Server configuration error: Missing ${missing.join(', ')}. Please add these to your .env.local file.` },
        { status: 500 }
      )
    }

    const formData = await request.formData()
    const files = formData.getAll('files') as File[]

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      )
    }

    // Validate all files are images (more lenient check)
    for (const file of files) {
      // Check file type, but also allow files without type if they're likely images
      const hasImageExtension = /\.(jpg|jpeg|png|gif|webp|bmp|tiff|tif|svg)$/i.test(file.name)
      const hasImageType = file.type && file.type.startsWith('image/')
      
      if (!hasImageType && !hasImageExtension) {
        return NextResponse.json(
          { error: `File ${file.name} does not appear to be an image file` },
          { status: 400 }
        )
      }
    }

    const results = await uploadSequentially(files)

    return NextResponse.json({ results })
  } catch (error) {
    console.error('Image upload error:', error)
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    )
  }
}
