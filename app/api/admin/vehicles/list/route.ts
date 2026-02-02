import { NextResponse } from 'next/server'
import { adminClient } from '@/lib/sanity/adminClient'

// GET - List all vehicles
export async function GET() {
  try {
    const vehicles = await adminClient.fetch(
      `*[_type == "vehicle"] | order(year desc, _createdAt desc) {
        _id,
        make,
        model,
        year,
        price,
        stockNumber,
        featured,
        "slug": slug.current,
        "imageUrl": images[0].asset->url
      }`
    )

    return NextResponse.json({ vehicles })
  } catch (error) {
    console.error('Error fetching vehicles:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    )
  }
}
