"use client"

import type React from "react"

import { useState } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { CalendarIcon, Check, MapPin, Phone } from "lucide-react"
import { vehicles } from "@/lib/data"
import { cn } from "@/lib/utils"
import FAQ from "@/components/faq"

export default function ContactPage() {
  const searchParams = useSearchParams()
  const vehicleId = searchParams.get("vehicle")
  const action = searchParams.get("action")

  const vehicle = vehicleId ? vehicles.find((v) => v.id === vehicleId) : null

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [message, setMessage] = useState(
    vehicle ? `I'm interested in the ${vehicle.year} ${vehicle.make} ${vehicle.model} ${vehicle.trim}.` : "",
  )
  const [contactMethod, setContactMethod] = useState("email")
  const [date, setDate] = useState<Date | undefined>(undefined)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, you would send this data to your backend
    console.log({
      name,
      email,
      phone,
      message,
      contactMethod,
      date,
      vehicleId,
    })

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
          <h2 className="text-2xl font-bold text-green-800 mb-2">Thank You!</h2>
          <p className="text-green-700 mb-6">
            Your message has been sent successfully. One of our representatives will contact you shortly.
          </p>
          <Button onClick={() => setSubmitted(false)}>Send Another Message</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Contact Us</h1>
        <p className="text-muted-foreground mb-8">
          {action === "test-drive"
            ? "Schedule a test drive or get in touch with our sales team."
            : "Have questions? We're here to help! Fill out the form below and we'll get back to you as soon as possible."}
        </p>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <div className="bg-[#2a0f1a]/50 backdrop-blur-sm rounded-2xl p-6 border-0">
              <h2 className="text-xl font-semibold mb-6">
                {action === "test-drive"
                  ? "Schedule a Test Drive"
                  : vehicle
                    ? "Request Information"
                    : "Send Us a Message"}
              </h2>

              {vehicle && (
                <div className="mb-6 p-4 bg-muted/50 backdrop-blur-sm rounded-xl">
                  <h3 className="font-medium mb-2">Selected Vehicle:</h3>
                  <p>
                    {vehicle.year} {vehicle.make} {vehicle.model} {vehicle.trim}
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="grid gap-4 mb-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        placeholder="John Smith"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
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
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      placeholder="(123) 456-7890"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>

                  {action === "test-drive" && (
                    <div className="space-y-2">
                      <Label>Preferred Test Drive Date</Label>
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
                            {date ? format(date, "PPP") : "Select a date"}
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
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      placeholder="How can we help you?"
                      rows={5}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Preferred Contact Method</Label>
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
                        <Label htmlFor="contact-phone">Phone</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="text" id="contact-text" />
                        <Label htmlFor="contact-text">Text Message</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>

                <Button type="submit" size="lg">
                  {action === "test-drive" ? "Schedule Test Drive" : "Send Message"}
                </Button>
              </form>
            </div>
          </div>

          <div>
            <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 sticky top-24 border-0">
              <h2 className="text-xl font-semibold mb-6">Contact Information</h2>

              <div className="space-y-6">
                <div>
                  <h3 className="font-medium mb-2">Dealership Address</h3>
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
                  <h3 className="font-medium mb-2">Phone Numbers</h3>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <Phone className="h-5 w-5 text-primary mr-2" />
                      <span>Sales: 1-800-555-CARS</span>
                    </div>
                    <div className="flex items-center">
                      <Phone className="h-5 w-5 text-primary mr-2" />
                      <span>Service: 1-800-555-SERV</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Business Hours</h3>
                  <table className="w-full text-sm">
                    <tbody>
                      <tr>
                        <td className="py-1">Monday - Friday:</td>
                        <td className="py-1 text-right">9:00 AM - 8:00 PM</td>
                      </tr>
                      <tr>
                        <td className="py-1">Saturday:</td>
                        <td className="py-1 text-right">9:00 AM - 6:00 PM</td>
                      </tr>
                      <tr>
                        <td className="py-1">Sunday:</td>
                        <td className="py-1 text-right">Closed</td>
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
