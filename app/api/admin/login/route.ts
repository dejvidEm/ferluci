import { NextResponse } from 'next/server'
import { createSession, setSession } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json()

    const adminUsername = process.env.ADMIN_USERNAME
    const adminPassword = process.env.ADMIN_PASSWORD

    console.log('Login attempt:', { 
      usernameProvided: !!username, 
      adminUsernameSet: !!adminUsername,
      adminPasswordSet: !!adminPassword 
    })

    if (!adminUsername || !adminPassword) {
      console.error('Missing env vars:', {
        ADMIN_USERNAME: !!adminUsername,
        ADMIN_PASSWORD: !!adminPassword,
      })
      return NextResponse.json(
        { error: 'Server configuration error: Missing ADMIN_USERNAME or ADMIN_PASSWORD' },
        { status: 500 }
      )
    }

    if (username !== adminUsername || password !== adminPassword) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    console.log('Credentials valid, creating session...')
    const session = await createSession()
    console.log('Session created:', session.substring(0, 20) + '...')

    // Create response
    const response = NextResponse.json({ success: true })
    
    // Set cookie using NextResponse cookies API
    response.cookies.set({
      name: 'admin-session',
      value: session,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    })
    
    console.log('Cookie set in response')
    console.log('Set-Cookie header will be:', `admin-session=${session.substring(0, 20)}...`)
    
    return response
  } catch (error) {
    console.error('Login error details:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined,
    })
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
