"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { client, vehiclesQuery } from "@/lib/sanity"
import { transformSanityVehicle } from "@/lib/sanity/utils"
import type { Vehicle } from "@/lib/types"
import { formatCurrency, formatNumber } from "@/lib/utils"

export default function HomeSearch() {
  const [searchQuery, setSearchQuery] = useState("")
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const router = useRouter()
  const dropdownRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Fetch vehicles on mount
  useEffect(() => {
    async function fetchVehicles() {
      try {
        const data = await client.fetch(vehiclesQuery)
        const transformedVehicles = data.map(transformSanityVehicle)
        setVehicles(transformedVehicles)
      } catch (error) {
        console.error("Error fetching vehicles:", error)
      }
    }
    fetchVehicles()
  }, [])

  // Filter vehicles based on search query
  useEffect(() => {
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      const queryWords = query.split(/\s+/).filter(word => word.length > 0)
      
      const filtered = vehicles.filter((vehicle) => {
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
      
      setFilteredVehicles(filtered.slice(0, 5)) // Show max 5 results
      setShowDropdown(true)
      setSelectedIndex(-1)
    } else {
      setFilteredVehicles([])
      setShowDropdown(false)
    }
  }, [searchQuery, vehicles])

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push(`/ponuka?search=${encodeURIComponent(searchQuery.trim())}`)
    } else {
      router.push("/ponuka")
    }
    setShowDropdown(false)
    // Scroll to top of the page
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      if (selectedIndex >= 0 && filteredVehicles[selectedIndex]) {
        router.push(`/ponuka/${filteredVehicles[selectedIndex].id}`)
        setShowDropdown(false)
        window.scrollTo({ top: 0, behavior: 'smooth' })
      } else {
        handleSearch()
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault()
      setSelectedIndex((prev) =>
        prev < filteredVehicles.length - 1 ? prev + 1 : prev
      )
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1))
    } else if (e.key === "Escape") {
      setShowDropdown(false)
    }
  }

  const handleVehicleClick = (vehicleId: string) => {
    router.push(`/ponuka/${vehicleId}`)
    setShowDropdown(false)
    setSearchQuery("")
  }

  return (
    <section className="pb-8 md:pb-8 md:pt-8 pt-4 -mt-36 md:-mt-[140px] z-[9999] md:bg-transparent bg-[#121212]">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-8 top-[14px] md:top-[20px] h-5 w-5 text-white z-10" />
              <Input
                ref={inputRef}
                placeholder="Hľadať podľa značky, modelu alebo kľúčových slov..."
                className="pl-16 h-12 md:h-16 rounded-full md:bg-[#121212]/10 bg-[#121212] border border-white/30 text-sm md:text-base text-white placeholder:text-gray-400 focus:border-white/30"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyPress}
                onFocus={() => {
                  if (filteredVehicles.length > 0) {
                    setShowDropdown(true)
                  }
                }}
              />
              {/* Dropdown Results */}
              {showDropdown && filteredVehicles.length > 0 && (
                <div
                  ref={dropdownRef}
                  className="absolute top-full left-0 right-0 mt-2 bg-[#121212] border border-white/30 rounded-lg shadow-xl max-h-[400px] overflow-y-auto z-50"
                >
                  {filteredVehicles.map((vehicle, index) => (
                    <div
                      key={vehicle.id}
                      onClick={() => handleVehicleClick(vehicle.id)}
                      className={`px-4 py-3 cursor-pointer border-b border-white/10 last:border-b-0 hover:bg-white/5 transition-colors ${
                        index === selectedIndex ? "bg-white/10" : ""
                      }`}
                      onMouseEnter={() => setSelectedIndex(index)}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1 flex items-center gap-2">
                          <span className="font-semibold text-white text-sm md:text-base">
                            {vehicle.make} {vehicle.model}
                          </span>
                          <span className="text-gray-400 text-xs md:text-sm">
                            {vehicle.year}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-xs md:text-sm text-gray-300">
                          <span className="font-semibold text-white">{formatCurrency(vehicle.price)}</span>
                          <span>{formatNumber(vehicle.mileage)} km</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {filteredVehicles.length >= 5 && (
                    <div
                      onClick={() => {
                        handleSearch()
                        window.scrollTo({ top: 0, behavior: 'smooth' })
                      }}
                      className="px-4 py-3 cursor-pointer hover:bg-white/5 transition-colors text-center border-t border-white/10"
                    >
                      <span className="text-sm text-primary">Zobraziť všetky výsledky</span>
                    </div>
                  )}
                </div>
              )}
            </div>
            <Button size="lg" className="h-12 md:h-16 text-base md:text-xl rounded-full" onClick={handleSearch}>
              <Search className="mr-2 h-5 w-5 md:h-6 md:w-6" /> Hľadať
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

