import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifySession } from './lib/auth'

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow access to login page
  if (pathname === '/admin' && request.method === 'GET') {
    return NextResponse.next()
  }

  // Protect admin routes (except login page)
  if (pathname.startsWith('/admin')) {
    const session = request.cookies.get('admin-session')?.value
    const isAuthenticated = await verifySession(session)

    if (!isAuthenticated) {
      // Redirect to login if not authenticated
      if (pathname !== '/admin') {
        return NextResponse.redirect(new URL('/admin', request.url))
      }
    } else {
      // Redirect authenticated users away from login page
      if (pathname === '/admin') {
        return NextResponse.redirect(new URL('/admin/vehicles', request.url))
      }
    }
  }

  // Protect admin API routes (except login)
  if (pathname.startsWith('/api/admin')) {
    if (pathname === '/api/admin/login') {
      return NextResponse.next()
    }

    const session = request.cookies.get('admin-session')?.value
    const isAuthenticated = await verifySession(session)

    if (!isAuthenticated) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*',
  ],
}
