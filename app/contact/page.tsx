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
      <div className="container mx-auto px-4 py-16 max-w-3xl">
        <div className="bg-green-50/50 backdrop-blur-sm rounded-2xl p-8 text-center border-0">
          <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Check className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-green-800 mb-2">Ďakujeme!</h2>
          <p className="text-green-700 mb-6">
            Vaša správa bola úspešne odoslaná. Jeden z našich zástupcov vás čoskoro kontaktuje.
          </p>
          <Button onClick={() => setSubmitted(false)}>Odoslať ďalšiu správu</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 bg-[#121212] min-h-screen">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Kontaktujte nás</h1>
        <p className="text-muted-foreground mb-8">
          {action === "test-drive"
            ? "Objednajte si skúšobnú jazdu alebo sa spojte s naším predajným tímom."
            : "Máte otázky? Sme tu, aby sme vám pomohli! Vyplňte formulár nižšie a čoskoro sa vám ozveme."}
        </p>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <div className="bg-[#2a0f1a]/50 backdrop-blur-sm rounded-2xl p-6 border-0">
              <h2 className="text-xl font-semibold mb-6">
                {action === "test-drive"
                  ? "Objednať skúšobnú jazdu"
                  : vehicle
                    ? "Požiadať o informácie"
                    : "Odoslať správu"}
              </h2>

              {vehicle && (
                <div className="mb-6">
                  <Label className="mb-2 block">Vybrané vozidlo:</Label>
                  <Badge variant="outline" className="text-base px-4 py-2 h-auto flex items-center gap-2 w-fit">
                    <span>
                      {vehicle.year} {vehicle.make} {vehicle.model} {vehicle.trim}
                    </span>
                    <button
                      type="button"
                      onClick={removeVehicle}
                      className="ml-2 hover:bg-muted rounded-full p-0.5 transition-colors"
                      aria-label="Odstrániť vozidlo"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </Badge>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="grid gap-4 mb-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Celé meno</Label>
                      <Input
                        id="name"
                        placeholder="Ján Novák"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Emailová adresa</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="john@example.com"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefónne číslo</Label>
                    <Input
                      id="phone"
                      placeholder="+421 912 345 678"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>

                  {action === "test-drive" && (
                    <div className="space-y-2">
                      <Label>Preferovaný dátum skúšobnej jazdy</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !date && "text-muted-foreground",
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {date ? format(date, "PPP") : "Vyberte dátum"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
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
                    <Label htmlFor="message">Správa</Label>
                    <Textarea
                      id="message"
                      placeholder="Ako vám môžeme pomôcť?"
                      rows={5}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Preferovaný spôsob kontaktu</Label>
                    <RadioGroup
                      defaultValue="email"
                      value={contactMethod}
                      onValueChange={setContactMethod}
                      className="flex flex-col space-y-1"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="email" id="contact-email" />
                        <Label htmlFor="contact-email">Email</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="phone" id="contact-phone" />
                        <Label htmlFor="contact-phone">Telefón</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="text" id="contact-text" />
                        <Label htmlFor="contact-text">SMS</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>

                <Button type="submit" size="lg">
                  {action === "test-drive" ? "Objednať skúšobnú jazdu" : "Odoslať správu"}
                </Button>
              </form>
            </div>
          </div>

          <div>
            <div className="bg-[#121212]/50 backdrop-blur-sm rounded-2xl p-6 sticky top-24 border-0 border-gray-800">
              <h2 className="text-xl font-semibold mb-6">Kontaktné informácie</h2>

              <div className="space-y-6">
                <div>
                  <h3 className="font-medium mb-2">Adresa autosalónu</h3>
                  <div className="flex items-start">
                    <MapPin className="h-5 w-5 text-primary mr-2 mt-0.5" />
                    <address className="not-italic">
                      123 Auto Drive
                      <br />
                      Cartown, CT 12345
                    </address>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Telefónne čísla</h3>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <Phone className="h-5 w-5 text-primary mr-2" />
                      <span>Predaj: 1-800-555-CARS</span>
                    </div>
                    <div className="flex items-center">
                      <Phone className="h-5 w-5 text-primary mr-2" />
                      <span>Servis: 1-800-555-SERV</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Otváracie hodiny</h3>
                  <table className="w-full text-sm">
                    <tbody>
                      <tr>
                        <td className="py-1">Pondelok - Piatok:</td>
                        <td className="py-1 text-right">9:00 - 20:00</td>
                      </tr>
                      <tr>
                        <td className="py-1">Sobota:</td>
                        <td className="py-1 text-right">9:00 - 18:00</td>
                      </tr>
                      <tr>
                        <td className="py-1">Nedeľa:</td>
                        <td className="py-1 text-right">Zatvorené</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <FAQ />
    </div>
  )
}
