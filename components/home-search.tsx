"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

export default function HomeSearch() {
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()

  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push(`/ponuka?search=${encodeURIComponent(searchQuery.trim())}`)
    } else {
      router.push("/ponuka")
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  return (
    <section className="pb-8 md:pb-8 md:pt-8 pt-4 -mt-36 md:-mt-[210px] z-20 md:bg-transparent bg-[#121212]">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-8 top-[14px] md:top-[20px] h-5 w-5 text-white z-10" />
              <Input
                placeholder="Hľadať podľa značky, modelu alebo kľúčových slov..."
                className="pl-16 h-12 md:h-16 rounded-full md:bg-[#121212]/10 bg-[#121212] border border-white/30 text-sm md:text-base text-white placeholder:text-gray-400 focus:border-white/30"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
              />
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

