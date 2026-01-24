"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Car } from "lucide-react"

export default function CustomVehicleForm() {
  const [brand, setBrand] = useState("")
  const [model, setModel] = useState("")
  const [budget, setBudget] = useState("")
  const [contact, setContact] = useState("")
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const formData = {
      brand,
      model,
      budget,
      contact,
    }

    console.log("Custom Vehicle Request:", formData)

    // In a real app, you would send formData to your backend/email service
    // Example: await fetch('/api/custom-vehicle', { method: 'POST', body: JSON.stringify(formData) })

    // Show success message
    setSubmitted(true)
    
    // Reset form
    setBrand("")
    setModel("")
    setBudget("")
    setContact("")
    
    // Reset success message after 5 seconds
    setTimeout(() => {
      setSubmitted(false)
    }, 5000)
  }

  if (submitted) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-[1.5fr,1fr] gap-8 items-start">
        <div className="lg:pl-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-primary/10 p-3 rounded-lg">
              <Car className="h-6 w-6 text-primary" />
            </div>
            <h2 className="text-3xl font-bold text-white">Nemáme auto ktoré hľadáte?</h2>
          </div>
          <p className="text-gray-400 text-lg mb-4">Formulár na dopyt auta na mieru</p>
          <p className="text-gray-300 leading-relaxed">
            Nenašli ste v našej ponuke presne to vozidlo, ktoré hľadáte? Vyplňte tento formulár a my vám pomôžeme nájsť ideálne auto podľa vašich požiadaviek. Naši odborníci vám čoskoro navrhnú vhodné možnosti alebo vám pomôžu objednať vozidlo na mieru.
          </p>
        </div>
        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-6 text-center max-w-lg">
          <div className="flex items-center justify-center mb-2">
            <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
              <svg className="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <h3 className="text-lg font-semibold text-white mb-1">Ďakujeme za váš dopyt!</h3>
          <p className="text-gray-300">Čoskoro vás budeme kontaktovať.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1.5fr,1fr] gap-8 items-start">
      {/* Heading and Description */}
      <div className="lg:pl-12">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-primary/10 p-3 rounded-lg">
            <Car className="h-6 w-6 text-primary" />
          </div>
          <h2 className="text-3xl font-bold text-white">Nemáme auto ktoré hľadáte?</h2>
        </div>
        <p className="text-gray-400 text-lg mb-4">Formulár na dopyt auta na mieru</p>
        <p className="text-gray-300 leading-relaxed">
          Nenašli ste v našej ponuke presne to vozidlo, ktoré hľadáte? Vyplňte tento formulár a my vám pomôžeme nájsť ideálne auto podľa vašich požiadaviek. Naši odborníci vám čoskoro navrhnú vhodné možnosti alebo vám pomôžu objednať vozidlo na mieru.
        </p>
      </div>

      {/* Form */}
      <div className="bg-[#1a1a1a] rounded-lg p-6 md:p-8 border border-white/10 max-w-xl">
        <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="brand" className="text-gray-300">Značka</Label>
            <Input
              id="brand"
              placeholder="Napríklad: BMW, Audi, Mercedes..."
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              className="bg-[#121212] border-white/10 text-white placeholder:text-gray-500 focus:border-white/20 focus:ring-0"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="model" className="text-gray-300">Model</Label>
            <Input
              id="model"
              placeholder="Napríklad: X5, A4, C-Class..."
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="bg-[#121212] border-white/10 text-white placeholder:text-gray-500 focus:border-white/20 focus:ring-0"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-2">
            <Label htmlFor="budget" className="text-gray-300">Rozpočet</Label>
            <Input
              id="budget"
              type="text"
              placeholder="Napríklad: 15 000 €"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              className="bg-[#121212] border-white/10 text-white placeholder:text-gray-500 focus:border-white/20 focus:ring-0"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact" className="text-gray-300">Kontakt</Label>
            <Input
              id="contact"
              type="text"
              placeholder="Telefón alebo email"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              className="bg-[#121212] border-white/10 text-white placeholder:text-gray-500 focus:border-white/20 focus:ring-0"
              required
            />
          </div>
        </div>

        <Button 
          type="submit" 
          size="lg" 
          className="w-full bg-white text-[#121212] hover:bg-gray-200 border-0 mt-6"
        >
          Odoslať dopyt
        </Button>
      </form>
      </div>
    </div>
  )
}

