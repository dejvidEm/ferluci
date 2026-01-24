"use client"

import { useState, useEffect, useCallback } from "react"
import { useSearchParams } from "next/navigation"
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

export default function InventoryPage() {
  const searchParams = useSearchParams()
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [priceRange, setPriceRange] = useState([0, 100000])
  const [yearRange, setYearRange] = useState([2010, 2024])
  const [selectedMakes, setSelectedMakes] = useState<string[]>([])
  const [selectedFuelTypes, setSelectedFuelTypes] = useState<string[]>([])
  const [selectedTransmissions, setSelectedTransmissions] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)
  const [loading, setLoading] = useState(true)
  const [displayMode, setDisplayMode] = useState<"grid" | "list">("grid")
  const [sortBy, setSortBy] = useState<string>("newest")

  // Read search query from URL parameter
  useEffect(() => {
    const searchParam = searchParams.get("search")
    if (searchParam) {
      setSearchQuery(decodeURIComponent(searchParam))
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

  // Get min and max prices
  const minPrice = vehicles.length > 0 ? Math.min(...vehicles.map((v) => v.price)) : 0
  const maxPrice = vehicles.length > 0 ? Math.max(...vehicles.map((v) => v.price)) : 100000

  // Get min and max years
  const minYear = vehicles.length > 0 ? Math.min(...vehicles.map((v) => v.year)) : 2010
  const maxYear = vehicles.length > 0 ? Math.max(...vehicles.map((v) => v.year)) : 2024

  const applyFiltersAndSort = useCallback(() => {
    let results = vehicles

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      results = results.filter(
        (vehicle) =>
          vehicle.make.toLowerCase().includes(query) ||
          vehicle.model.toLowerCase().includes(query) ||
          vehicle.trim.toLowerCase().includes(query) ||
          vehicle.year.toString().includes(query),
      )
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
  }, [vehicles, searchQuery, priceRange, yearRange, selectedMakes, selectedFuelTypes, selectedTransmissions, sortBy])

  const handleSearch = () => {
    applyFiltersAndSort()
  }

  const resetFilters = () => {
    setSearchQuery("")
    setPriceRange([minPrice, maxPrice])
    setYearRange([minYear, maxYear])
    setSelectedMakes([])
    setSelectedFuelTypes([])
    setSelectedTransmissions([])
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

      <div className="flex flex-col lg:flex-row gap-6 mb-8">
        {/* Search Bar - Always visible */}
        <div className="w-full lg:w-2/3">
          <div className="flex gap-2">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground z-10" />
              <Input
                placeholder="Hľadať podľa značky, modelu, roku..."
                className="pl-10 h-12 bg-[#121212] border border-white/30 text-white placeholder:text-gray-400 focus:border-white/50"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button className="h-12" onClick={handleSearch}>
              <Search className="mr-2 h-5 w-5" /> Hľadať
            </Button>
            <Button variant="outline" className="h-12 lg:hidden" onClick={() => setShowFilters(!showFilters)}>
              <Filter className="h-5 w-5 mr-2" />
              Filtre
            </Button>
          </div>
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
              </Accordion>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="w-full lg:w-3/4">
          <div className="flex justify-between items-center mb-4">
            <p className="text-muted-foreground">Zobrazených {filteredVehicles.length} vozidiel</p>
            <div className="flex items-center gap-4">
              {/* Display Mode Toggle - Desktop Only */}
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
              <SelectTrigger className="w-[180px]">
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
