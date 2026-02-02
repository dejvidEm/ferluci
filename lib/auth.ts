import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'

function getSecretKey(): string {
  const secretKey = process.env.ADMIN_SESSION_SECRET
  if (!secretKey) {
    throw new Error(
      'ADMIN_SESSION_SECRET is not set. Please add it to your .env.local file. ' +
      'Generate one with: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'base64\'))"'
    )
  }
  return secretKey
}

function getEncodedKey(): Uint8Array {
  return new TextEncoder().encode(getSecretKey())
}

export interface SessionPayload {
  authenticated: boolean
  expiresAt: number
}

export async function createSession(): Promise<string> {
  try {
    const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 days
    const encodedKey = getEncodedKey()
    const session = await new SignJWT({ authenticated: true, expiresAt })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(Math.floor(expiresAt / 1000))
      .sign(encodedKey)

    return session
  } catch (error) {
    console.error('Error creating session:', error)
    throw new Error(`Failed to create session: ${error instanceof Error ? error.message : String(error)}`)
  }
}

export async function verifySession(session: string | undefined): Promise<boolean> {
  if (!session) {
    return false
  }

  try {
    const { payload } = await jwtVerify(session, getEncodedKey())
    
    // JWT exp is already validated by jwtVerify, but check our custom expiresAt too
    const expiresAt = payload.expiresAt as number | undefined
    if (expiresAt && Date.now() > expiresAt) {
      return false
    }

    return payload.authenticated === true
  } catch (error) {
    return false
  }
}

export async function getSession(): Promise<string | undefined> {
  const cookieStore = await cookies()
  return cookieStore.get('admin-session')?.value
}

export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete('admin-session')
}

export async function setSession(session: string): Promise<void> {
  try {
    const cookieStore = await cookies()
    cookieStore.set('admin-session', session, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    })
  } catch (error) {
    console.error('Error setting session cookie:', error)
    throw new Error(`Failed to set session cookie: ${error instanceof Error ? error.message : String(error)}`)
  }
}
