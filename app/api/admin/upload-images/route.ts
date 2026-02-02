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
  const isJPEG = buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF
  const isPNG = buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47
  const isGIF = buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46
  const isWebP = buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46
  const isValidImage = isJPEG || isPNG || isGIF || isWebP
  
  console.log(`File ${file.name}:`, {
    type: file.type,
    size: buffer.length,
    firstBytes: buffer.slice(0, 8).toString('hex'),
    isValidImage,
    isJPEG,
    isPNG,
    isGIF,
    isWebP,
  })
  
  if (!isValidImage) {
    throw new Error(`File ${file.name} is not a valid image format. Expected JPEG, PNG, GIF, or WebP.`)
  }
  
  // Use Sanity client's assets.upload method which handles the format correctly
  try {
    const asset = await adminClient.assets.upload('image', buffer, {
      filename: file.name,
      contentType: file.type || (isPNG ? 'image/png' : isJPEG ? 'image/jpeg' : 'image/jpeg'),
    })
    
    return {
      _id: asset._id,
      url: asset.url,
    }
  } catch (error) {
    console.error('Sanity client upload error:', error)
    throw new Error(`Failed to upload ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`)
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

    // Validate all files are images
    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        return NextResponse.json(
          { error: `File ${file.name} is not an image` },
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
