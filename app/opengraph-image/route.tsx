import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'
export const alt = 'Ferluci Cars'

export async function GET(request: NextRequest) {
  try {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.ferlucicars.eu'
    
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
            {/* Logo text representation */}
            <div
              style={{
                fontSize: 80,
                fontWeight: 'bold',
                color: '#ffffff',
                textAlign: 'center',
                letterSpacing: '2px',
              }}
            >
              FERLUCI CARS
            </div>
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
    return new Response('Error generating image', { status: 500 })
  }
}
