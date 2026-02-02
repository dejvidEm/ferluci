import { NextRequest, NextResponse } from 'next/server'
import { adminClient } from '@/lib/sanity/adminClient'
import { generateVehicleSlug } from '@/lib/slug'

interface VehicleInput {
  make: string
  model: string
  year: number
  price: number
  showOldPrice: boolean
  oldPrice?: number
  mileage: number
  exteriorColor: string
  interiorColor: string
  fuelType: string
  transmission: string
  pohon: string
  engine: string
  vin: string
  stockNumber: string
  description: string
  features: string[]
  imageAssetIds: string[]
  featured: boolean
}

const FUEL_TYPES = ['Gasoline', 'Diesel', 'Electric', 'Hybrid', 'Plug-in Hybrid']
const TRANSMISSIONS = ['Automatic', 'Manual', 'CVT']
const POHON_TYPES = ['Predný', 'Zadný', '4x4', 'Xdrive', 'Quattro']

function validateVehicle(data: Partial<VehicleInput>): string[] {
  const errors: string[] = []

  if (!data.make || typeof data.make !== 'string' || data.make.trim().length === 0) {
    errors.push('make is required')
  }

  if (!data.model || typeof data.model !== 'string' || data.model.trim().length === 0) {
    errors.push('model is required')
  }

  if (!data.year || typeof data.year !== 'number' || data.year < 1900 || data.year > 2100) {
    errors.push('year must be a number between 1900 and 2100')
  }

  if (!data.price || typeof data.price !== 'number' || data.price < 0) {
    errors.push('price must be a positive number')
  }

  if (data.showOldPrice && (!data.oldPrice || typeof data.oldPrice !== 'number' || data.oldPrice <= 0)) {
    errors.push('oldPrice is required when showOldPrice is true')
  }

  if (!data.mileage || typeof data.mileage !== 'number' || data.mileage < 0) {
    errors.push('mileage must be a positive number')
  }

  if (!data.exteriorColor || typeof data.exteriorColor !== 'string' || data.exteriorColor.trim().length === 0) {
    errors.push('exteriorColor is required')
  }

  if (!data.interiorColor || typeof data.interiorColor !== 'string' || data.interiorColor.trim().length === 0) {
    errors.push('interiorColor is required')
  }

  if (!data.fuelType || !FUEL_TYPES.includes(data.fuelType)) {
    errors.push(`fuelType must be one of: ${FUEL_TYPES.join(', ')}`)
  }

  if (!data.transmission || !TRANSMISSIONS.includes(data.transmission)) {
    errors.push(`transmission must be one of: ${TRANSMISSIONS.join(', ')}`)
  }

  if (!data.pohon || !POHON_TYPES.includes(data.pohon)) {
    errors.push(`pohon must be one of: ${POHON_TYPES.join(', ')}`)
  }

  if (!data.engine || typeof data.engine !== 'string' || data.engine.trim().length === 0) {
    errors.push('engine is required')
  }

  if (!data.vin || typeof data.vin !== 'string' || data.vin.trim().length === 0) {
    errors.push('vin is required')
  }

  if (!data.stockNumber || typeof data.stockNumber !== 'string' || data.stockNumber.trim().length === 0) {
    errors.push('stockNumber is required')
  }

  if (!data.description || typeof data.description !== 'string' || data.description.trim().length === 0) {
    errors.push('description is required')
  }

  if (!data.features || !Array.isArray(data.features) || data.features.length === 0) {
    errors.push('features must be a non-empty array')
  }

  if (!data.imageAssetIds || !Array.isArray(data.imageAssetIds) || data.imageAssetIds.length === 0) {
    errors.push('imageAssetIds must be a non-empty array')
  }

  if (typeof data.featured !== 'boolean') {
    errors.push('featured must be a boolean')
  }

  return errors
}

// GET - Fetch single vehicle
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const vehicle = await adminClient.fetch(
      `*[_type == "vehicle" && _id == $id][0] {
        _id,
        make,
        model,
        year,
        price,
        showOldPrice,
        oldPrice,
        mileage,
        exteriorColor,
        interiorColor,
        fuelType,
        transmission,
        pohon,
        engine,
        vin,
        stockNumber,
        description,
        features,
        images[] {
          _key,
          asset-> {
            _id,
            url,
            originalFilename
          }
        },
        featured,
        "slug": slug.current
      }`,
      { id }
    )

    if (!vehicle) {
      return NextResponse.json(
        { error: 'Vehicle not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(vehicle)
  } catch (error) {
    console.error('Error fetching vehicle:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    )
  }
}

// PUT - Update vehicle
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body: VehicleInput = await request.json()

    // Validate input
    const validationErrors = validateVehicle(body)
    if (validationErrors.length > 0) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationErrors },
        { status: 400 }
      )
    }

    // Check if vehicle exists
    const existingVehicle = await adminClient.fetch(
      `*[_type == "vehicle" && _id == $id][0]`,
      { id }
    )

    if (!existingVehicle) {
      return NextResponse.json(
        { error: 'Vehicle not found' },
        { status: 404 }
      )
    }

    // Generate slug
    const slugValue = generateVehicleSlug(body.year, body.make, body.model, body.stockNumber)

    // Build images array with Sanity image references and preserve _key if updating existing images
    const images = body.imageAssetIds.map((assetId, index) => {
      // Try to find existing image with same asset ID to preserve _key
      const existingImage = existingVehicle.images?.find(
        (img: any) => img.asset?._ref === assetId
      )
      
      return {
        _type: 'image' as const,
        _key: existingImage?._key || `image-${index}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        asset: {
          _type: 'reference' as const,
          _ref: assetId,
        },
      }
    })

    // Update vehicle document
    const vehicleDoc = {
      make: body.make.trim(),
      model: body.model.trim(),
      year: body.year,
      price: body.price,
      showOldPrice: body.showOldPrice,
      ...(body.showOldPrice && body.oldPrice ? { oldPrice: body.oldPrice } : {}),
      mileage: body.mileage,
      exteriorColor: body.exteriorColor.trim(),
      interiorColor: body.interiorColor.trim(),
      fuelType: body.fuelType,
      transmission: body.transmission,
      pohon: body.pohon,
      engine: body.engine.trim(),
      vin: body.vin.trim(),
      stockNumber: body.stockNumber.trim(),
      description: body.description.trim(),
      features: body.features.map((f) => f.trim()).filter((f) => f.length > 0),
      images,
      featured: body.featured,
      slug: {
        _type: 'slug' as const,
        current: slugValue,
      },
    }

    const result = await adminClient.patch(id).set(vehicleDoc).commit()

    return NextResponse.json({
      id: result._id,
      slug: slugValue,
    })
  } catch (error) {
    console.error('Vehicle update error:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    )
  }
}

// DELETE - Delete vehicle
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Check if vehicle exists
    const existingVehicle = await adminClient.fetch(
      `*[_type == "vehicle" && _id == $id][0]`,
      { id }
    )

    if (!existingVehicle) {
      return NextResponse.json(
        { error: 'Vehicle not found' },
        { status: 404 }
      )
    }

    await adminClient.delete(id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Vehicle deletion error:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    )
  }
}
