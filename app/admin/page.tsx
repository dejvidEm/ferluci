'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function AdminLoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
        credentials: 'include', // Ensure cookies are sent/received
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Login failed')
        setLoading(false)
        return
      }

      // Wait a bit longer to ensure cookie is set in browser
      await new Promise(resolve => setTimeout(resolve, 300))
      
      // Use window.location for more reliable redirect with cookies
      // This ensures the browser has processed the Set-Cookie header
      window.location.href = '/admin/vehicles'
    } catch (err) {
      console.error('Login error:', err)
      setError('Chyba siete. Skúste to znova.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#121212] flex items-center justify-center px-3 sm:px-4">
      <div className="w-full max-w-md">
        <div className="bg-[#1a1a1a] rounded-2xl p-6 sm:p-8 shadow-xl border border-white/10">
          <h1 className="text-xl sm:text-2xl font-bold text-white mb-2 text-center">
            Prihlásenie do administrácie
          </h1>
          <p className="text-gray-400 text-xs sm:text-sm text-center mb-4 sm:mb-6">
            Prihláste sa pre správu vozidiel
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-white">
                Používateľské meno
              </Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="bg-[#121212] text-white border-white/20"
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-white">
                Heslo
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-[#121212] text-white border-white/20"
                disabled={loading}
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Prihlasujem...' : 'Prihlásiť sa'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
