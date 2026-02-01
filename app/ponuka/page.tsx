"use client"

import { useState, useEffect, useCallback, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import VehicleCard from "@/components/vehicle-card"
import { formatCurrency, translateFuelType, translateTransmission } from "@/lib/utils"
import type { Vehicle } from "@/lib/types"
import { Filter, Search, Grid3x3, List } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import FAQ from "@/components/faq"
import CustomVehicleForm from "@/components/custom-vehicle-form"
import { client, vehiclesQuery } from "@/lib/sanity"
import { transformSanityVehicle } from "@/lib/sanity/utils"

function InventoryPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [priceRange, setPriceRange] = useState([0, 100000])
  const [yearRange, setYearRange] = useState([2010, 2024])
  const [selectedMakes, setSelectedMakes] = useState<string[]>([])
  const [selectedFuelTypes, setSelectedFuelTypes] = useState<string[]>([])
  const [selectedTransmissions, setSelectedTransmissions] = useState<string[]>([])
  const [selectedPohon, setSelectedPohon] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)
  const [loading, setLoading] = useState(true)
  const [displayMode, setDisplayMode] = useState<"grid" | "list">("grid")
  const [sortBy, setSortBy] = useState<string>("newest")

  // Read search query from URL parameter
  useEffect(() => {
    const searchParam = searchParams.get("search")
    if (searchParam) {
      const decoded = decodeURIComponent(searchParam)
      setSearchQuery(decoded)
    } else {
      setSearchQuery("")
    }
  }, [searchParams])

  useEffect(() => {
    async function fetchVehicles() {
      try {
        const data = await client.fetch(vehiclesQuery)
        const transformedVehicles = data.map(transformSanityVehicle)
        setVehicles(transformedVehicles)
        setFilteredVehicles(transformedVehicles)
        
        // Set initial filter ranges based on fetched data
        if (transformedVehicles.length > 0) {
          const prices = transformedVehicles.map((v: Vehicle) => v.price)
          const years = transformedVehicles.map((v: Vehicle) => v.year)
          setPriceRange([Math.min(...prices), Math.max(...prices)])
          setYearRange([Math.min(...years), Math.max(...years)])
        }
      } catch (error) {
        console.error("Error fetching vehicles:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchVehicles()
  }, [])

  // Get unique makes
  const makes = Array.from(new Set(vehicles.map((v) => v.make))).sort()

  // Get unique fuel types
  const fuelTypes = Array.from(new Set(vehicles.map((v) => v.fuelType).filter(Boolean))).sort()

  // Get unique transmission types
  const transmissions = Array.from(new Set(vehicles.map((v) => v.transmission).filter(Boolean))).sort()

  // Get unique pohon types
  const pohonTypes = Array.from(new Set(vehicles.map((v) => v.pohon).filter(Boolean))).sort()

  // Get min and max prices
  const minPrice = vehicles.length > 0 ? Math.min(...vehicles.map((v) => v.price)) : 0
  const maxPrice = vehicles.length > 0 ? Math.max(...vehicles.map((v) => v.price)) : 100000

  // Get min and max years
  const minYear = vehicles.length > 0 ? Math.min(...vehicles.map((v) => v.year)) : 2010
  const maxYear = vehicles.length > 0 ? Math.max(...vehicles.map((v) => v.year)) : 2024

  const applyFiltersAndSort = useCallback(() => {
    let results = vehicles

    // Filter by search query - search only in make, model, and year
    if (searchQuery) {
      const query = searchQuery.toLowerCase().trim()
      const queryWords = query.split(/\s+/).filter(word => word.length > 0)
      
      results = results.filter((vehicle) => {
        const makeLower = vehicle.make.toLowerCase()
        const modelLower = vehicle.model.toLowerCase()
        const yearStr = vehicle.year.toString()
        const combined = `${makeLower} ${modelLower} ${yearStr}`
        
        // Check if combined string contains the full query (for exact matches like "bmw 740")
        if (combined.includes(query)) {
          return true
        }
        
        // For multi-word queries, check if all words are found in the vehicle data
        // Each word must be found in at least one field (make, model, or year)
        if (queryWords.length > 1) {
          return queryWords.every(word => 
            makeLower.includes(word) ||
            modelLower.includes(word) ||
            yearStr.includes(word)
          )
        }
        
        // Single word query - check if it matches any field
        return makeLower.includes(query) ||
               modelLower.includes(query) ||
               yearStr.includes(query)
      })
    }

    // Filter by price range
    results = results.filter((vehicle) => vehicle.price >= priceRange[0] && vehicle.price <= priceRange[1])

    // Filter by year range
    results = results.filter((vehicle) => vehicle.year >= yearRange[0] && vehicle.year <= yearRange[1])

    // Filter by makes
    if (selectedMakes.length > 0) {
      results = results.filter((vehicle) => selectedMakes.includes(vehicle.make))
    }

    // Filter by fuel types
    if (selectedFuelTypes.length > 0) {
      results = results.filter((vehicle) => vehicle.fuelType && selectedFuelTypes.includes(vehicle.fuelType))
    }

    // Filter by transmission types
    if (selectedTransmissions.length > 0) {
      results = results.filter((vehicle) => vehicle.transmission && selectedTransmissions.includes(vehicle.transmission))
    }

    // Filter by pohon types
    if (selectedPohon.length > 0) {
      results = results.filter((vehicle) => vehicle.pohon && selectedPohon.includes(vehicle.pohon))
    }

    // Apply sorting
    const sortedResults = [...results].sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return b.year - a.year
        case "oldest":
          return a.year - b.year
        case "price-low":
          return a.price - b.price
        case "price-high":
          return b.price - a.price
        default:
          return 0
      }
    })

    setFilteredVehicles(sortedResults)
  }, [vehicles, searchQuery, priceRange, yearRange, selectedMakes, selectedFuelTypes, selectedTransmissions, selectedPohon, sortBy])

  const handleSearch = () => {
    // Update URL with search query
    const params = new URLSearchParams(searchParams.toString())
    if (searchQuery.trim()) {
      params.set("search", searchQuery.trim())
    } else {
      params.delete("search")
    }
    router.push(`/ponuka?${params.toString()}`, { scroll: false })
    applyFiltersAndSort()
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  const resetFilters = () => {
    setSearchQuery("")
    setPriceRange([minPrice, maxPrice])
    setYearRange([minYear, maxYear])
    setSelectedMakes([])
    setSelectedFuelTypes([])
    setSelectedTransmissions([])
    setSelectedPohon([])
    setSortBy("newest")
    applyFiltersAndSort()
  }

  // Apply filters automatically when filter values change
  useEffect(() => {
    if (!loading && vehicles.length > 0) {
      applyFiltersAndSort()
    }
  }, [applyFiltersAndSort, loading, vehicles.length])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Ponuka vozidiel</h1>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Načítavanie vozidiel...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 bg-[#121212] min-h-screen">
      <h1 className="text-3xl font-bold mb-8">Ponuka vozidiel</h1>

      <div className="flex flex-col lg:flex-row gap-4 mb-8 items-start lg:items-center">
        {/* Search Bar - Always visible */}
        <div className="w-full lg:flex-1">
          <div className="flex gap-2">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground z-10" />
              <Input
                placeholder="Vyhľadať vozidlo (značka, model, rok...)"
                className="pl-10 h-12 bg-[#121212] border border-white/30 text-white placeholder:text-gray-400 focus:border-white/50"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
              />
            </div>
            <Button className="h-12 min-w-[140px] md:min-w-[140px] min-w-[48px]" onClick={handleSearch}>
              <Search className="h-5 w-5 md:mr-2" />
              <span className="hidden md:inline">Hľadať</span>
            </Button>
          </div>
        </div>
        {/* Layout selector, Sort, and Filter button - Same level as search */}
        <div className="flex items-center gap-4 w-full lg:w-auto">
          {/* Filter button - Mobile only */}
          <Button variant="outline" className="h-10 bg-[#121212] lg:hidden border border-white/30" onClick={() => setShowFilters(!showFilters)}>
            <Filter className="h-5 w-5 mr-2" />
            Filtre
          </Button>
          {/* Display Mode Toggle - Hidden on mobile */}
          <div className="hidden md:flex items-center gap-2 border rounded-lg p-1">
            <Button
              variant={displayMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setDisplayMode("grid")}
              className="h-8"
            >
              <Grid3x3 className="h-4 w-4" />
            </Button>
            <Button
              variant={displayMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setDisplayMode("list")}
              className="h-8"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px] bg-[#121212] border border-white/30">
              <SelectValue placeholder="Zoradiť podľa" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Najnovšie prvé</SelectItem>
              <SelectItem value="oldest">Najstaršie prvé</SelectItem>
              <SelectItem value="price-low">Cena: od najnižšej</SelectItem>
              <SelectItem value="price-high">Cena: od najvyššej</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Filters - Collapsible on mobile */}
        <div className={`w-full lg:w-1/4 ${showFilters ? "block" : "hidden lg:block"}`}>
          <div className="bg-[#121212] border border-white/20 rounded-lg">
            <div className="px-6 pb-6 pt-0">
              <div className="flex items-center justify-between mb-4 pt-6">
                <h2 className="text-xl font-semibold">Filtre</h2>
                <Button variant="ghost" size="sm" onClick={resetFilters}>
                  Resetovať
                </Button>
              </div>

              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="price">
                  <AccordionTrigger>Rozsah cien</AccordionTrigger>
                  <AccordionContent className="pt-4 px-1">
                    <div className="space-y-4">
                      <div className="px-3">
                      <Slider
                        defaultValue={[minPrice, maxPrice]}
                        min={minPrice}
                        max={maxPrice}
                        step={1000}
                        value={priceRange}
                        onValueChange={setPriceRange}
                      />
                      </div>
                      <div className="flex items-center justify-between">
                        <span>{formatCurrency(priceRange[0])}</span>
                        <span>{formatCurrency(priceRange[1])}</span>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="year">
                  <AccordionTrigger>Rozsah rokov</AccordionTrigger>
                  <AccordionContent className="pt-4 px-1">
                    <div className="space-y-4">
                      <div className="px-3">
                      <Slider
                        defaultValue={[minYear, maxYear]}
                        min={minYear}
                        max={maxYear}
                        step={1}
                        value={yearRange}
                        onValueChange={setYearRange}
                      />
                      </div>
                      <div className="flex items-center justify-between">
                        <span>{yearRange[0]}</span>
                        <span>{yearRange[1]}</span>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="make">
                  <AccordionTrigger>Značka</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2">
                      {makes.map((make) => (
                        <div key={make} className="flex items-center space-x-2">
                          <Checkbox
                            id={`make-${make}`}
                            checked={selectedMakes.includes(make)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedMakes([...selectedMakes, make])
                              } else {
                                setSelectedMakes(selectedMakes.filter((m) => m !== make))
                              }
                            }}
                          />
                          <Label htmlFor={`make-${make}`}>{make}</Label>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="fuelType">
                  <AccordionTrigger>Typ paliva</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2">
                      {fuelTypes.map((fuelType) => (
                        <div key={fuelType} className="flex items-center space-x-2">
                          <Checkbox
                            id={`fuel-${fuelType}`}
                            checked={selectedFuelTypes.includes(fuelType)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedFuelTypes([...selectedFuelTypes, fuelType])
                              } else {
                                setSelectedFuelTypes(selectedFuelTypes.filter((f) => f !== fuelType))
                              }
                            }}
                          />
                          <Label htmlFor={`fuel-${fuelType}`}>{translateFuelType(fuelType)}</Label>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="transmission">
                  <AccordionTrigger>Prevodovka</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2">
                      {transmissions.map((transmission) => (
                        <div key={transmission} className="flex items-center space-x-2">
                          <Checkbox
                            id={`transmission-${transmission}`}
                            checked={selectedTransmissions.includes(transmission)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedTransmissions([...selectedTransmissions, transmission])
                              } else {
                                setSelectedTransmissions(selectedTransmissions.filter((t) => t !== transmission))
                              }
                            }}
                          />
                          <Label htmlFor={`transmission-${transmission}`}>{translateTransmission(transmission)}</Label>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="pohon">
                  <AccordionTrigger>Pohon</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2">
                      {pohonTypes.map((pohon) => (
                        <div key={pohon} className="flex items-center space-x-2">
                          <Checkbox
                            id={`pohon-${pohon}`}
                            checked={selectedPohon.includes(pohon)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedPohon([...selectedPohon, pohon])
                              } else {
                                setSelectedPohon(selectedPohon.filter((p) => p !== pohon))
                              }
                            }}
                          />
                          <Label htmlFor={`pohon-${pohon}`}>{pohon}</Label>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="w-full lg:w-3/4">
          {filteredVehicles.length > 0 ? (
            displayMode === "grid" ? (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredVehicles.map((vehicle) => (
                <VehicleCard key={vehicle.id} vehicle={vehicle} />
              ))}
            </div>
            ) : (
              <div className="space-y-4">
                {filteredVehicles.map((vehicle) => (
                  <VehicleCard key={vehicle.id} vehicle={vehicle} displayMode="list" />
                ))}
              </div>
            )
          ) : (
            <div className="text-center py-12">
              <h3 className="text-xl font-semibold mb-2">Nenašli sa žiadne vozidlá</h3>
              <p className="text-muted-foreground mb-4">Skúste upraviť kritériá vyhľadávania alebo filtre</p>
              <Button onClick={resetFilters}>Resetovať filtre</Button>
            </div>
          )}
        </div>
      </div>

      {/* Custom Vehicle Request Form */}
      <div className="mt-48 mb-32">
        <div className="max-w-6xl mx-auto px-8 lg:px-16">
          <CustomVehicleForm />
        </div>
      </div>

      {/* FAQ */}
      <FAQ />
    </div>
  )
}

export default function InventoryPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Ponuka vozidiel</h1>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Načítavanie...</p>
        </div>
      </div>
    }>
      <InventoryPageContent />
    </Suspense>
  )
}
