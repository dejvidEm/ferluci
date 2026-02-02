'use client'

import { useState, FormEvent, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { ImageUploader, type ImageFile } from '@/components/admin/image-uploader'
import { generateVehicleSlug } from '@/lib/slug'
import { LogOut, Plus, X, ArrowLeft } from 'lucide-react'

const FUEL_TYPES = [
  { value: 'Gasoline', label: 'Benzín' },
  { value: 'Diesel', label: 'Nafta' },
  { value: 'Electric', label: 'Elektrický' },
  { value: 'Hybrid', label: 'Hybrid' },
  { value: 'Plug-in Hybrid', label: 'Plug-in Hybrid' },
]

const TRANSMISSIONS = [
  { value: 'Automatic', label: 'Automatická' },
  { value: 'Manual', label: 'Manuálna' },
  { value: 'CVT', label: 'CVT' },
]

const POHON_TYPES = [
  { value: 'Predný', label: 'Predný' },
  { value: 'Zadný', label: 'Zadný' },
  { value: '4x4', label: '4x4' },
  { value: 'Xdrive', label: 'Xdrive' },
  { value: 'Quattro', label: 'Quattro' },
]

export default function EditVehiclePage() {
  const router = useRouter()
  const params = useParams()
  const vehicleId = params.id as string
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  // Form state
  const [make, setMake] = useState('')
  const [model, setModel] = useState('')
  const [year, setYear] = useState('')
  const [price, setPrice] = useState('')
  const [showOldPrice, setShowOldPrice] = useState(false)
  const [oldPrice, setOldPrice] = useState('')
  const [mileage, setMileage] = useState('')
  const [exteriorColor, setExteriorColor] = useState('')
  const [interiorColor, setInteriorColor] = useState('')
  const [fuelType, setFuelType] = useState('')
  const [transmission, setTransmission] = useState('')
  const [pohon, setPohon] = useState('')
  const [engine, setEngine] = useState('')
  const [vin, setVin] = useState('')
  const [stockNumber, setStockNumber] = useState('')
  const [description, setDescription] = useState('')
  const [features, setFeatures] = useState<string[]>([''])
  const [images, setImages] = useState<ImageFile[]>([])
  const [featured, setFeatured] = useState(false)

  // Load vehicle data
  useEffect(() => {
    async function loadVehicle() {
      try {
        const response = await fetch(`/api/admin/vehicles/${vehicleId}`)
        if (!response.ok) {
          throw new Error('Nepodarilo sa načítať vozidlo')
        }
        const vehicle = await response.json()

        // Populate form
        setMake(vehicle.make || '')
        setModel(vehicle.model || '')
        setYear(String(vehicle.year || ''))
        setPrice(String(vehicle.price || ''))
        setShowOldPrice(vehicle.showOldPrice || false)
        setOldPrice(String(vehicle.oldPrice || ''))
        setMileage(String(vehicle.mileage || ''))
        setExteriorColor(vehicle.exteriorColor || '')
        setInteriorColor(vehicle.interiorColor || '')
        setFuelType(vehicle.fuelType || '')
        setTransmission(vehicle.transmission || '')
        setPohon(vehicle.pohon || '')
        setEngine(vehicle.engine || '')
        setVin(vehicle.vin || '')
        setStockNumber(vehicle.stockNumber || '')
        setDescription(vehicle.description || '')
        setFeatures(vehicle.features && vehicle.features.length > 0 ? vehicle.features : [''])
        setFeatured(vehicle.featured || false)

        // Load existing images
        if (vehicle.images && vehicle.images.length > 0) {
          const existingImages: ImageFile[] = vehicle.images.map((img: any) => {
            // Get image URL from Sanity asset
            const imageUrl = img.asset?.url || '/placeholder.svg'
            
            // Create a dummy file object for existing images (we only need it for the ImageFile type)
            // The actual file isn't needed since we already have the asset ID
            const dummyFile = new File([''], img.asset?.originalFilename || 'image.jpg', {
              type: 'image/jpeg',
            })
            
            return {
              file: dummyFile,
              preview: imageUrl,
              assetId: img.asset?._id,
              uploading: false,
            }
          })
          setImages(existingImages)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load vehicle')
      } finally {
        setLoading(false)
      }
    }

    if (vehicleId) {
      loadVehicle()
    }
  }, [vehicleId])

  // Generate slug preview
  const slugPreview = make && model && year && stockNumber
    ? generateVehicleSlug(Number(year), make, model, stockNumber)
    : ''

  const handleAddFeature = () => {
    setFeatures([...features, ''])
  }

  const handleRemoveFeature = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index))
  }

  const handleFeatureChange = (index: number, value: string) => {
    const newFeatures = [...features]
    newFeatures[index] = value
    setFeatures(newFeatures)
  }

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' })
    router.push('/admin')
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setSaving(true)

    try {
      // Validate images are uploaded
      const unuploadedImages = images.filter((img) => !img.assetId)
      if (images.length === 0) {
        throw new Error('Je potrebný aspoň jeden obrázok')
      }
      if (unuploadedImages.length > 0) {
        throw new Error('Pred uložením prosím nahrajte všetky obrázky')
      }

      // Validate features
      const validFeatures = features.filter((f) => f.trim().length > 0)
      if (validFeatures.length === 0) {
        throw new Error('Je potrebné pridať aspoň jedno vybavenie')
      }

      const vehicleData = {
        make: make.trim(),
        model: model.trim(),
        year: Number(year),
        price: Number(price),
        showOldPrice,
        ...(showOldPrice && oldPrice ? { oldPrice: Number(oldPrice) } : {}),
        mileage: Number(mileage),
        exteriorColor: exteriorColor.trim(),
        interiorColor: interiorColor.trim(),
        fuelType,
        transmission,
        pohon,
        engine: engine.trim(),
        vin: vin.trim(),
        stockNumber: stockNumber.trim(),
        description: description.trim(),
        features: validFeatures.map((f) => f.trim()),
        imageAssetIds: images.map((img) => img.assetId!).filter(Boolean),
        featured,
      }

      const response = await fetch(`/api/admin/vehicles/${vehicleId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(vehicleData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Nepodarilo sa aktualizovať vozidlo')
      }

      setSuccess(true)
      setSaving(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nepodarilo sa aktualizovať vozidlo')
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#121212] p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <p className="text-white">Načítavanie vozidla...</p>
          </div>
        </div>
      </div>
    )
  }

  // Scroll to top when success message appears
  useEffect(() => {
    if (success) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [success])

  if (success) {
    return (
      <div className="min-h-screen bg-[#121212] p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-green-500/10 border border-green-500/50 rounded-lg p-6 mb-6">
            <h2 className="text-2xl font-bold text-green-400 mb-2">
              Vozidlo bolo úspešne aktualizované!
            </h2>
            <p className="text-gray-300 mb-4">
              Vaše zmeny boli uložené.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button asChild>
                <Link href="/admin/vehicles">Späť na vozidlá</Link>
              </Button>
              <Button variant="outline" onClick={() => router.push(`/ponuka/${vehicleId}`)}>
                Zobraziť stránku vozidla
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#121212] p-3 sm:p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header - Mobile responsive */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
            <Button variant="outline" size="sm" asChild className="shrink-0">
              <Link href="/admin/vehicles">
                <ArrowLeft className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Späť</span>
              </Link>
            </Button>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">Upraviť vozidlo</h1>
          </div>
          <Button variant="outline" onClick={handleLogout} className="w-full sm:w-auto shrink-0">
            <LogOut className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Odhlásiť sa</span>
            <span className="sm:hidden">Odhlásiť</span>
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 md:space-y-8">
          {/* Basic Information */}
          <section className="bg-[#1a1a1a] rounded-lg p-4 sm:p-6 border border-white/10">
            <h2 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4">
              Základné informácie
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <Label htmlFor="make" className="text-white">
                  Značka *
                </Label>
                <Input
                  id="make"
                  value={make}
                  onChange={(e) => setMake(e.target.value)}
                  required
                  className="bg-[#121212] text-white border-white/20"
                />
              </div>
              <div>
                <Label htmlFor="model" className="text-white">
                  Model *
                </Label>
                <Input
                  id="model"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  required
                  className="bg-[#121212] text-white border-white/20"
                />
              </div>
              <div>
                <Label htmlFor="year" className="text-white">
                  Rok výroby *
                </Label>
                <Input
                  id="year"
                  type="number"
                  min="1900"
                  max="2100"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  required
                  className="bg-[#121212] text-white border-white/20"
                />
              </div>
              <div>
                <Label htmlFor="stockNumber" className="text-white">
                  Skladové číslo *
                </Label>
                <Input
                  id="stockNumber"
                  value={stockNumber}
                  onChange={(e) => setStockNumber(e.target.value)}
                  required
                  className="bg-[#121212] text-white border-white/20"
                />
              </div>
            </div>
            {slugPreview && (
              <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-[#121212] rounded border border-white/10">
                <Label className="text-gray-400 text-xs sm:text-sm">Náhľad URL adresy:</Label>
                <p className="text-white font-mono text-xs sm:text-sm mt-1 break-all">{slugPreview}</p>
              </div>
            )}
          </section>

          {/* Pricing */}
          <section className="bg-[#1a1a1a] rounded-lg p-4 sm:p-6 border border-white/10">
            <h2 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4">Cena</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <Label htmlFor="price" className="text-white">
                  Cena (EUR) *
                </Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                  className="bg-[#121212] text-white border-white/20"
                />
              </div>
              <div className="flex items-end gap-4">
                <div className="flex items-center gap-2">
                  <Switch
                    id="showOldPrice"
                    checked={showOldPrice}
                    onCheckedChange={setShowOldPrice}
                  />
                  <Label htmlFor="showOldPrice" className="text-white">
                    Zobraziť starú cenu
                  </Label>
                </div>
                {showOldPrice && (
                  <div className="flex-1">
                    <Label htmlFor="oldPrice" className="text-white">
                      Pôvodná cena (EUR) *
                    </Label>
                    <Input
                      id="oldPrice"
                      type="number"
                      min="0"
                      step="0.01"
                      value={oldPrice}
                      onChange={(e) => setOldPrice(e.target.value)}
                      required={showOldPrice}
                      className="bg-[#121212] text-white border-white/20"
                    />
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Specifications */}
          <section className="bg-[#1a1a1a] rounded-lg p-4 sm:p-6 border border-white/10">
            <h2 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4">
              Špecifikácie
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <Label htmlFor="mileage" className="text-white">
                  Nájazd (km) *
                </Label>
                <Input
                  id="mileage"
                  type="number"
                  min="0"
                  value={mileage}
                  onChange={(e) => setMileage(e.target.value)}
                  required
                  className="bg-[#121212] text-white border-white/20"
                />
              </div>
              <div>
                <Label htmlFor="exteriorColor" className="text-white">
                  Farba karosérie *
                </Label>
                <Input
                  id="exteriorColor"
                  value={exteriorColor}
                  onChange={(e) => setExteriorColor(e.target.value)}
                  required
                  className="bg-[#121212] text-white border-white/20"
                />
              </div>
              <div>
                <Label htmlFor="interiorColor" className="text-white">
                  Farba interiéru *
                </Label>
                <Input
                  id="interiorColor"
                  value={interiorColor}
                  onChange={(e) => setInteriorColor(e.target.value)}
                  required
                  className="bg-[#121212] text-white border-white/20"
                />
              </div>
              <div>
                <Label htmlFor="fuelType" className="text-white">
                  Typ paliva *
                </Label>
                <Select value={fuelType} onValueChange={setFuelType} required>
                  <SelectTrigger className="bg-[#121212] text-white border-white/20">
                    <SelectValue placeholder="Vyberte typ paliva" />
                  </SelectTrigger>
                  <SelectContent>
                    {FUEL_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="transmission" className="text-white">
                  Prevodovka *
                </Label>
                <Select
                  value={transmission}
                  onValueChange={setTransmission}
                  required
                >
                  <SelectTrigger className="bg-[#121212] text-white border-white/20">
                    <SelectValue placeholder="Vyberte prevodovku" />
                  </SelectTrigger>
                  <SelectContent>
                    {TRANSMISSIONS.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="pohon" className="text-white">
                  Pohon *
                </Label>
                <Select value={pohon} onValueChange={setPohon} required>
                  <SelectTrigger className="bg-[#121212] text-white border-white/20">
                    <SelectValue placeholder="Vyberte pohon" />
                  </SelectTrigger>
                  <SelectContent>
                    {POHON_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="engine" className="text-white">
                  Výkon (KW / PS) *
                </Label>
                <Input
                  id="engine"
                  value={engine}
                  onChange={(e) => setEngine(e.target.value)}
                  required
                  className="bg-[#121212] text-white border-white/20"
                />
              </div>
              <div>
                <Label htmlFor="vin" className="text-white">
                  VIN číslo *
                </Label>
                <Input
                  id="vin"
                  value={vin}
                  onChange={(e) => setVin(e.target.value)}
                  required
                  className="bg-[#121212] text-white border-white/20"
                />
              </div>
            </div>
          </section>

          {/* Description */}
          <section className="bg-[#1a1a1a] rounded-lg p-4 sm:p-6 border border-white/10">
            <h2 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4">Popis</h2>
            <div>
              <Label htmlFor="description" className="text-white text-sm sm:text-base">
                Popis *
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={6}
                className="bg-[#121212] text-white border-white/20 text-sm sm:text-base"
              />
            </div>
          </section>

          {/* Features */}
          <section className="bg-[#1a1a1a] rounded-lg p-4 sm:p-6 border border-white/10">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-3 sm:mb-4">
              <h2 className="text-lg sm:text-xl font-semibold text-white">Vybavenie</h2>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddFeature}
                className="w-full sm:w-auto"
              >
                <Plus className="h-4 w-4 mr-2" />
                Pridať vybavenie
              </Button>
            </div>
            <div className="space-y-2">
              {features.map((feature, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={feature}
                    onChange={(e) => handleFeatureChange(index, e.target.value)}
                    placeholder="Zadajte vybavenie"
                    className="bg-[#121212] text-white border-white/20 text-sm sm:text-base"
                  />
                  {features.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveFeature(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Images */}
          <section className="bg-[#1a1a1a] rounded-lg p-4 sm:p-6 border border-white/10">
            <h2 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4">Obrázky</h2>
            <ImageUploader
              images={images}
              onImagesChange={setImages}
            />
          </section>

          {/* Featured */}
          <section className="bg-[#1a1a1a] rounded-lg p-4 sm:p-6 border border-white/10">
            <div className="flex items-center gap-3 sm:gap-4">
              <Switch
                id="featured"
                checked={featured}
                onCheckedChange={setFeatured}
              />
              <Label htmlFor="featured" className="text-white text-sm sm:text-base">
                Označiť ako odporúčané vozidlo
              </Label>
            </div>
          </section>

          {/* Error */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Submit */}
          <div className="flex gap-4 sticky bottom-0 bg-[#121212] pt-4 pb-2 -mx-3 sm:-mx-4 md:-mx-8 px-3 sm:px-4 md:px-8 border-t border-white/10">
            <Button type="submit" disabled={saving} className="flex-1 text-sm sm:text-base">
              {saving ? 'Ukladám zmeny...' : 'Uložiť zmeny'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
