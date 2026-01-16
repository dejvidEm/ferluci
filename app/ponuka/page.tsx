"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { vehicles } from "@/lib/data"
import VehicleCard from "@/components/vehicle-card"
import { formatCurrency } from "@/lib/utils"
import type { Vehicle } from "@/lib/types"
import { Filter, Search } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import FAQ from "@/components/faq"

export default function InventoryPage() {
  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>(vehicles)
  const [searchQuery, setSearchQuery] = useState("")
  const [priceRange, setPriceRange] = useState([0, 100000])
  const [yearRange, setYearRange] = useState([2010, 2024])
  const [selectedMakes, setSelectedMakes] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)

  // Get unique makes
  const makes = Array.from(new Set(vehicles.map((v) => v.make))).sort()

  // Get min and max prices
  const minPrice = Math.min(...vehicles.map((v) => v.price))
  const maxPrice = Math.max(...vehicles.map((v) => v.price))

  // Get min and max years
  const minYear = Math.min(...vehicles.map((v) => v.year))
  const maxYear = Math.max(...vehicles.map((v) => v.year))

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

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Ponuka vozidiel</h1>

      <div className="flex flex-col lg:flex-row gap-6 mb-8">
        {/* Search Bar - Always visible */}
        <div className="w-full lg:w-2/3">
          <div className="flex gap-2">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search by make, model, year..."
                className="pl-10 h-12"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button className="h-12" onClick={handleSearch}>
              Search
            </Button>
            <Button variant="outline" className="h-12 lg:hidden" onClick={() => setShowFilters(!showFilters)}>
              <Filter className="h-5 w-5 mr-2" />
              Filters
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
                <h2 className="text-xl font-semibold">Filters</h2>
                <Button variant="ghost" size="sm" onClick={resetFilters}>
                  Reset
                </Button>
              </div>

              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="price">
                  <AccordionTrigger>Price Range</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4">
                      <Slider
                        defaultValue={[minPrice, maxPrice]}
                        min={minPrice}
                        max={maxPrice}
                        step={1000}
                        value={priceRange}
                        onValueChange={setPriceRange}
                      />
                      <div className="flex items-center justify-between">
                        <span>{formatCurrency(priceRange[0])}</span>
                        <span>{formatCurrency(priceRange[1])}</span>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="year">
                  <AccordionTrigger>Year Range</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4">
                      <Slider
                        defaultValue={[minYear, maxYear]}
                        min={minYear}
                        max={maxYear}
                        step={1}
                        value={yearRange}
                        onValueChange={setYearRange}
                      />
                      <div className="flex items-center justify-between">
                        <span>{yearRange[0]}</span>
                        <span>{yearRange[1]}</span>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="make">
                  <AccordionTrigger>Make</AccordionTrigger>
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
                Apply Filters
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Results */}
        <div className="w-full lg:w-3/4">
          <div className="flex justify-between items-center mb-4">
            <p className="text-muted-foreground">Showing {filteredVehicles.length} vehicles</p>
            <Select defaultValue="newest">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
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
              <h3 className="text-xl font-semibold mb-2">No vehicles found</h3>
              <p className="text-muted-foreground mb-4">Try adjusting your search criteria or filters</p>
              <Button onClick={resetFilters}>Reset Filters</Button>
            </div>
          )}
        </div>
      </div>

      {/* FAQ */}
      <FAQ />
    </div>
  )
}
