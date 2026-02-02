'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { LogOut, Plus, Edit, Trash2, Search } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface Vehicle {
  _id: string
  make: string
  model: string
  year: number
  price: number
  stockNumber: string
  featured: boolean
  slug: string
  imageUrl?: string
}

export default function VehiclesListPage() {
  const router = useRouter()
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [vehicleToDelete, setVehicleToDelete] = useState<Vehicle | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetchVehicles()
  }, [])

  const fetchVehicles = async () => {
    try {
      const response = await fetch('/api/admin/vehicles/list')
      if (!response.ok) {
        throw new Error('Nepodarilo sa načítať vozidlá')
      }
      const data = await response.json()
      setVehicles(data.vehicles || [])
      setFilteredVehicles(data.vehicles || [])
    } catch (error) {
      console.error('Error fetching vehicles:', error)
    } finally {
      setLoading(false)
    }
  }

  // Filter vehicles based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredVehicles(vehicles)
      return
    }

    const query = searchQuery.toLowerCase().trim()
    const filtered = vehicles.filter((vehicle) => {
      const searchString = `${vehicle.year} ${vehicle.make} ${vehicle.model} ${vehicle.stockNumber} ${vehicle.price}`.toLowerCase()
      return searchString.includes(query)
    })
    setFilteredVehicles(filtered)
  }, [searchQuery, vehicles])

  const handleDelete = async () => {
    if (!vehicleToDelete) return

    setDeleting(true)
    try {
      const response = await fetch(`/api/admin/vehicles/${vehicleToDelete._id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Nepodarilo sa zmazať vozidlo')
      }

      // Remove from list
      setVehicles(vehicles.filter((v) => v._id !== vehicleToDelete._id))
      setDeleteDialogOpen(false)
      setVehicleToDelete(null)
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Nepodarilo sa zmazať vozidlo')
    } finally {
      setDeleting(false)
    }
  }

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' })
    router.push('/admin')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#121212] p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <p className="text-white">Načítavanie vozidiel...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#121212] p-3 sm:p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header - Mobile responsive */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Vozidlá</h1>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button asChild className="w-full sm:w-auto">
              <Link href="/admin/vehicles/new">
                <Plus className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Pridať vozidlo</span>
                <span className="sm:hidden">Pridať</span>
              </Link>
            </Button>
            <Button variant="outline" onClick={handleLogout} className="w-full sm:w-auto">
              <LogOut className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Odhlásiť sa</span>
              <span className="sm:hidden">Odhlásiť</span>
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        {vehicles.length > 0 && (
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Hľadať vozidlo (značka, model, rok, skladové číslo, cena)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-[#1a1a1a] text-white border-white/20 w-full"
              />
            </div>
            {searchQuery && (
              <p className="text-sm text-gray-400 mt-2">
                Nájdených: {filteredVehicles.length} {filteredVehicles.length === 1 ? 'vozidlo' : filteredVehicles.length < 5 ? 'vozidlá' : 'vozidiel'}
              </p>
            )}
          </div>
        )}

        {vehicles.length === 0 ? (
          <div className="bg-[#1a1a1a] rounded-lg p-8 text-center border border-white/10">
            <p className="text-gray-400 mb-4">Nenašli sa žiadne vozidlá.</p>
            <Button asChild>
              <Link href="/admin/vehicles/new">
                <Plus className="h-4 w-4 mr-2" />
                Pridať prvé vozidlo
              </Link>
            </Button>
          </div>
        ) : filteredVehicles.length === 0 ? (
          <div className="bg-[#1a1a1a] rounded-lg p-8 text-center border border-white/10">
            <p className="text-gray-400 mb-4">Nenašli sa žiadne vozidlá pre "{searchQuery}"</p>
            <Button variant="outline" onClick={() => setSearchQuery('')}>
              Vymazať vyhľadávanie
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {filteredVehicles.map((vehicle) => (
              <div
                key={vehicle._id}
                className="bg-[#1a1a1a] rounded-lg overflow-hidden border border-white/10 hover:border-white/20 transition-colors"
              >
                <div className="aspect-video relative bg-gray-800">
                  {vehicle.imageUrl ? (
                    <Image
                      src={vehicle.imageUrl}
                      alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500">
                      Bez obrázka
                    </div>
                  )}
                  {vehicle.featured && (
                    <div className="absolute top-2 left-2 bg-yellow-500 text-black text-xs px-2 py-1 rounded font-semibold">
                      Odporúčané
                    </div>
                  )}
                </div>
                <div className="p-3 sm:p-4">
                  <h3 className="text-base sm:text-lg font-semibold text-white mb-1 line-clamp-2">
                    {vehicle.year} {vehicle.make} {vehicle.model}
                  </h3>
                  <p className="text-gray-400 text-xs sm:text-sm mb-2">
                    Sklad: {vehicle.stockNumber}
                  </p>
                  <p className="text-white font-bold mb-3 sm:mb-4 text-sm sm:text-base">
                    €{vehicle.price.toLocaleString()}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 text-xs sm:text-sm"
                      asChild
                    >
                      <Link href={`/admin/vehicles/${vehicle._id}/edit`}>
                        <Edit className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                        <span className="hidden sm:inline">Upraviť</span>
                        <span className="sm:hidden">Upraviť</span>
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-400 hover:text-red-500 hover:border-red-500 px-2 sm:px-3"
                      onClick={() => {
                        setVehicleToDelete(vehicle)
                        setDeleteDialogOpen(true)
                      }}
                    >
                      <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent className="mx-4 max-w-[calc(100vw-2rem)]">
            <AlertDialogHeader>
              <AlertDialogTitle>Zmazať vozidlo?</AlertDialogTitle>
              <AlertDialogDescription>
                Naozaj chcete zmazať{' '}
                {vehicleToDelete && (
                  <>
                    <strong>
                      {vehicleToDelete.year} {vehicleToDelete.make}{' '}
                      {vehicleToDelete.model}
                    </strong>
                    ? Táto akcia sa nedá vrátiť späť.
                  </>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={deleting}>Zrušiť</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={deleting}
                className="bg-red-600 hover:bg-red-700"
              >
                {deleting ? 'Mažem...' : 'Zmazať'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}
