import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'
export const alt = 'Ferluci Cars'

export async function GET(request: NextRequest) {
  try {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.ferlucicars.eu'
    const logoUrl = `${siteUrl}/logo.png`
    
    // Fetch the logo image
    const logoResponse = await fetch(logoUrl)
    if (!logoResponse.ok) {
      throw new Error('Failed to fetch logo')
    }
    
    const logoBuffer = await logoResponse.arrayBuffer()
    const logoBase64 = Buffer.from(logoBuffer).toString('base64')
    const logoDataUrl = `data:${logoResponse.headers.get('content-type') || 'image/png'};base64,${logoBase64}`
    
    return new ImageResponse(
      (
        <div
          style={{
            background: '#121212',
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              height: '100%',
            }}
          >
            {/* Logo image - centered and sized appropriately */}
            <img
              src={logoDataUrl}
              alt="Ferluci Cars"
              width={500}
              height={150}
              style={{
                filter: 'brightness(0) invert(1)',
                objectFit: 'contain',
              }}
            />
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    )
  } catch (error) {
    console.error('Error generating OG image:', error)
    // Fallback to text if logo fails to load
    return new ImageResponse(
      (
        <div
          style={{
            background: '#121212',
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              fontSize: 80,
              fontWeight: 'bold',
              color: '#ffffff',
              textAlign: 'center',
            }}
          >
            FERLUCI CARS
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    )
  }
}
