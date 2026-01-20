"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import VehicleCard from "@/components/vehicle-card"
import { formatCurrency } from "@/lib/utils"
import type { Vehicle } from "@/lib/types"
import { Filter, Search } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import FAQ from "@/components/faq"
import { client, vehiclesQuery } from "@/lib/sanity"
import { transformSanityVehicle } from "@/lib/sanity/utils"

export default function InventoryPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [priceRange, setPriceRange] = useState([0, 100000])
  const [yearRange, setYearRange] = useState([2010, 2024])
  const [selectedMakes, setSelectedMakes] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchVehicles() {
      try {
        const data = await client.fetch(vehiclesQuery)
        const transformedVehicles = data.map(transformSanityVehicle)
        setVehicles(transformedVehicles)
        setFilteredVehicles(transformedVehicles)
        
        // Set initial filter ranges based on fetched data
        if (transformedVehicles.length > 0) {
          const prices = transformedVehicles.map((v) => v.price)
          const years = transformedVehicles.map((v) => v.year)
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

  // Get min and max prices
  const minPrice = vehicles.length > 0 ? Math.min(...vehicles.map((v) => v.price)) : 0
  const maxPrice = vehicles.length > 0 ? Math.max(...vehicles.map((v) => v.price)) : 100000

  // Get min and max years
  const minYear = vehicles.length > 0 ? Math.min(...vehicles.map((v) => v.year)) : 2010
  const maxYear = vehicles.length > 0 ? Math.max(...vehicles.map((v) => v.year)) : 2024

  const handleSearch = () => {
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

    setFilteredVehicles(results)
  }

  const resetFilters = () => {
    setSearchQuery("")
    setPriceRange([minPrice, maxPrice])
    setYearRange([minYear, maxYear])
    setSelectedMakes([])
    setFilteredVehicles(vehicles)
  }

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
              <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Hľadať podľa značky, modelu, roku..."
                className="pl-10 h-12"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button className="h-12" onClick={handleSearch}>
              Hľadať
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
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
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
              </Accordion>

              <Button className="w-full mt-6" onClick={handleSearch}>
                Použiť filtre
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Results */}
        <div className="w-full lg:w-3/4">
          <div className="flex justify-between items-center mb-4">
            <p className="text-muted-foreground">Zobrazených {filteredVehicles.length} vozidiel</p>
            <Select defaultValue="newest">
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

          {filteredVehicles.length > 0 ? (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredVehicles.map((vehicle) => (
                <VehicleCard key={vehicle.id} vehicle={vehicle} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-xl font-semibold mb-2">Nenašli sa žiadne vozidlá</h3>
              <p className="text-muted-foreground mb-4">Skúste upraviť kritériá vyhľadávania alebo filtre</p>
              <Button onClick={resetFilters}>Resetovať filtre</Button>
            </div>
          )}
        </div>
      </div>

      {/* FAQ */}
      <FAQ />
    </div>
  )
}
