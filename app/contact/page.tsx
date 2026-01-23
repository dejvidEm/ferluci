"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { CalendarIcon, Check, MapPin, Phone, X } from "lucide-react"
import { cn } from "@/lib/utils"
import FAQ from "@/components/faq"
import { client, vehicleByIdQuery } from "@/lib/sanity"
import { transformSanityVehicle } from "@/lib/sanity/utils"
import type { Vehicle } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import Map from "@/components/map"

export default function ContactPage() {
  const searchParams = useSearchParams()
  const vehicleId = searchParams.get("vehicle")
  const action = searchParams.get("action")

  const [vehicle, setVehicle] = useState<Vehicle | null>(null)
  const [loadingVehicle, setLoadingVehicle] = useState(false)

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [message, setMessage] = useState("")
  const [contactMethod, setContactMethod] = useState("email")
  const [date, setDate] = useState<Date | undefined>(undefined)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    async function fetchVehicle() {
      if (vehicleId) {
        setLoadingVehicle(true)
        try {
          const data = await client.fetch(vehicleByIdQuery, { id: vehicleId })
          if (data) {
            const transformedVehicle = transformSanityVehicle(data)
            setVehicle(transformedVehicle)
            setMessage(`Zaujíma ma ${transformedVehicle.year} ${transformedVehicle.make} ${transformedVehicle.model} ${transformedVehicle.trim}.`)
          }
        } catch (error) {
          console.error("Error fetching vehicle:", error)
        } finally {
          setLoadingVehicle(false)
        }
      }
    }
    fetchVehicle()
  }, [vehicleId])

  const removeVehicle = () => {
    setVehicle(null)
    setMessage("")
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, you would send this data to your backend
    const formData = {
      name,
      email,
      phone,
      message,
      contactMethod,
      date,
      vehicleId,
      vehicle: vehicle
        ? {
            id: vehicle.id,
            year: vehicle.year,
            make: vehicle.make,
            model: vehicle.model,
            trim: vehicle.trim,
            price: vehicle.price,
            fullName: `${vehicle.year} ${vehicle.make} ${vehicle.model} ${vehicle.trim}`,
          }
        : null,
    }

    console.log(formData)

    // In a real app, you would send formData to your backend/email service
    // Example: await fetch('/api/contact', { method: 'POST', body: JSON.stringify(formData) })

    // Show success message
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-3xl bg-[#121212] min-h-screen">
        <div className="bg-[#1a1a1a] rounded-lg p-8 text-center border border-white/10">
          <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Ďakujeme!</h2>
          <p className="text-gray-300 mb-6">
            Vaša správa bola úspešne odoslaná. Jeden z našich zástupcov vás čoskoro kontaktuje.
          </p>
          <Button 
            onClick={() => setSubmitted(false)}
            className="bg-white text-[#121212] hover:bg-gray-200 border-0"
          >
            Odoslať ďalšiu správu
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-[#121212] min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Kontaktujte nás</h1>
          <p className="text-muted-foreground mb-8">
            {action === "test-drive"
              ? "Objednajte si skúšobnú jazdu alebo sa spojte s naším predajným tímom."
              : "Máte otázky? Sme tu, aby sme vám pomohli! Vyplňte formulár nižšie a čoskoro sa vám ozveme."}
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <div className="bg-[#1a1a1a] rounded-lg p-8 border border-white/10">
                <h2 className="text-xl font-semibold mb-8 text-white">
                  {action === "test-drive"
                    ? "Objednať skúšobnú jazdu"
                    : vehicle
                      ? "Požiadať o informácie"
                      : "Odoslať správu"}
                </h2>

                {vehicle && (
                  <div className="mb-6">
                    <Label className="mb-2 block text-gray-300">Vybrané vozidlo:</Label>
                    <Badge variant="outline" className="text-sm px-3 py-1.5 h-auto flex items-center gap-2 w-fit bg-[#121212] border-white/20 text-gray-300">
                      <span>
                      {vehicle.year} {vehicle.make} {vehicle.model} {vehicle.trim}
                      </span>
                      <button
                        type="button"
                        onClick={removeVehicle}
                        className="ml-2 hover:bg-white/10 rounded-full p-0.5 transition-colors"
                        aria-label="Odstrániť vozidlo"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="grid gap-6 mb-8">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-gray-300">Celé meno</Label>
                        <Input
                          id="name"
                          placeholder="Ján Novák"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="bg-[#121212] border-white/10 text-white placeholder:text-gray-500 focus:border-white/20 focus:ring-0"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-gray-300">Emailová adresa</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="john@example.com"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="bg-[#121212] border-white/10 text-white placeholder:text-gray-500 focus:border-white/20 focus:ring-0"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-gray-300">Telefónne číslo</Label>
                      <Input
                        id="phone"
                        placeholder="+421 912 345 678"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="bg-[#121212] border-white/10 text-white placeholder:text-gray-500 focus:border-white/20 focus:ring-0"
                      />
                    </div>

                    {action === "test-drive" && (
                      <div className="space-y-2">
                        <Label className="text-gray-300">Preferovaný dátum skúšobnej jazdy</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal bg-[#121212] border-white/10 text-white hover:bg-white/5",
                                !date && "text-gray-500",
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {date ? format(date, "PPP") : "Vyberte dátum"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0 bg-[#1a1a1a] border-white/10">
                            <Calendar
                              mode="single"
                              selected={date}
                              onSelect={setDate}
                              initialFocus
                              disabled={(date) =>
                                date < new Date() || date > new Date(new Date().setMonth(new Date().getMonth() + 1))
                              }
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="message" className="text-gray-300">Správa</Label>
                      <Textarea
                        id="message"
                        placeholder="Ako vám môžeme pomôcť?"
                        rows={5}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="bg-[#121212] border-white/10 text-white placeholder:text-gray-500 focus:border-white/20 focus:ring-0"
                      />
                    </div>

                    <div className="space-y-3">
                      <Label className="text-gray-300">Preferovaný spôsob kontaktu</Label>
                      <RadioGroup
                        defaultValue="email"
                        value={contactMethod}
                        onValueChange={setContactMethod}
                        className="flex flex-col space-y-3"
                      >
                        <div className="flex items-center space-x-3">
                          <RadioGroupItem value="email" id="contact-email" className="border-white/20" />
                          <Label htmlFor="contact-email" className="text-gray-300 cursor-pointer">Email</Label>
                        </div>
                        <div className="flex items-center space-x-3">
                          <RadioGroupItem value="phone" id="contact-phone" className="border-white/20" />
                          <Label htmlFor="contact-phone" className="text-gray-300 cursor-pointer">Telefón</Label>
                        </div>
                        <div className="flex items-center space-x-3">
                          <RadioGroupItem value="text" id="contact-text" className="border-white/20" />
                          <Label htmlFor="contact-text" className="text-gray-300 cursor-pointer">SMS</Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    size="lg" 
                    className="w-full bg-white text-[#121212] hover:bg-gray-200 border-0"
                  >
                    {action === "test-drive" ? "Objednať skúšobnú jazdu" : "Odoslať správu"}
                  </Button>
                </form>
              </div>
            </div>

            <div>
              <div className="bg-[#1a1a1a] rounded-lg p-6 sticky top-24 border border-white/10">
                <h2 className="text-xl font-semibold mb-6 text-white">Kontaktné informácie</h2>

                <div className="space-y-6">
                  <div>
                    <h3 className="font-medium mb-2 text-gray-300">Adresa autosalónu</h3>
                    <div className="flex items-start">
                      <MapPin className="h-5 w-5 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                      <address className="not-italic text-gray-300">
                        Kopčianska 41
                        <br />
                        851 01 Petržalka
                      </address>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium mb-2 text-gray-300">Telefónne čísla</h3>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <Phone className="h-5 w-5 text-gray-400 mr-2 flex-shrink-0" />
                        <span className="text-gray-300">0905 326 292</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium mb-2 text-gray-300">Otváracie hodiny</h3>
                    <table className="w-full text-sm">
                      <tbody>
                        <tr>
                          <td className="py-1 text-gray-300">Pondelok - Piatok:</td>
                          <td className="py-1 text-right text-gray-300">9:00 - 20:00</td>
                        </tr>
                        <tr>
                          <td className="py-1 text-gray-300">Sobota:</td>
                          <td className="py-1 text-right text-gray-300">9:00 - 18:00</td>
                        </tr>
                        <tr>
                          <td className="py-1 text-gray-300">Nedeľa:</td>
                          <td className="py-1 text-right text-gray-300">Zatvorené</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Map - Full width edge to edge */}
      <div className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] mt-16">
        <Map />
      </div>

      {/* FAQ */}
      <div className="container mx-auto px-4">
        <FAQ />
      </div>
    </div>
  )
}
