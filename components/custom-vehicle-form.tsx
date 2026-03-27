"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Car } from "lucide-react"
import { useLocale } from "@/lib/i18n/context"

export default function CustomVehicleForm() {
  const { t } = useLocale()
  const [brand, setBrand] = useState("")
  const [model, setModel] = useState("")
  const [budget, setBudget] = useState("")
  const [contact, setContact] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const formData = {
        brand,
        model,
        budget,
        contact,
      }

      const response = await fetch("/api/custom-vehicle", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || t("customVehicle.error"))
      }

      setSubmitted(true)

      setBrand("")
      setModel("")
      setBudget("")
      setContact("")

      setTimeout(() => {
        setSubmitted(false)
      }, 5000)
    } catch (err) {
      setError(err instanceof Error ? err.message : t("customVehicle.error"))
      console.error("Form submission error:", err)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-[1.5fr,1fr] gap-8 items-start">
        <div className="lg:pl-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-primary/10 p-3 rounded-lg">
              <Car className="h-6 w-6 text-primary" />
            </div>
            <h2 className="text-3xl font-bold text-white">{t("customVehicle.title")}</h2>
          </div>
          <p className="text-gray-400 text-lg mb-4">{t("customVehicle.subtitle")}</p>
          <p className="text-gray-300 leading-relaxed">{t("customVehicle.body")}</p>
        </div>
        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-6 text-center max-w-lg">
          <div className="flex items-center justify-center mb-2">
            <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
              <svg className="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <h3 className="text-lg font-semibold text-white mb-1">{t("customVehicle.successTitle")}</h3>
          <p className="text-gray-300">{t("customVehicle.successBody")}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1.5fr,1fr] gap-8 items-start">
      <div className="lg:pl-12">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-primary/10 p-3 rounded-lg">
            <Car className="h-6 w-6 text-primary" />
          </div>
          <h2 className="text-3xl font-bold text-white">{t("customVehicle.title")}</h2>
        </div>
        <p className="text-gray-400 text-lg mb-4">{t("customVehicle.subtitle")}</p>
        <p className="text-gray-300 leading-relaxed">{t("customVehicle.body")}</p>
      </div>

      <div className="bg-[#1a1a1a] rounded-lg p-6 md:p-8 border border-white/10 max-w-xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="brand" className="text-gray-300">
                {t("customVehicle.brand")}
              </Label>
              <Input
                id="brand"
                placeholder={t("customVehicle.brandPlaceholder")}
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="bg-[#121212] border-white/10 text-white placeholder:text-gray-500 focus:border-white/20 focus:ring-0"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="model" className="text-gray-300">
                {t("customVehicle.model")}
              </Label>
              <Input
                id="model"
                placeholder={t("customVehicle.modelPlaceholder")}
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="bg-[#121212] border-white/10 text-white placeholder:text-gray-500 focus:border-white/20 focus:ring-0"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="budget" className="text-gray-300">
                {t("customVehicle.budget")}
              </Label>
              <Input
                id="budget"
                type="text"
                placeholder={t("customVehicle.budgetPlaceholder")}
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="bg-[#121212] border-white/10 text-white placeholder:text-gray-500 focus:border-white/20 focus:ring-0"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact" className="text-gray-300">
                {t("customVehicle.contact")}
              </Label>
              <Input
                id="contact"
                type="text"
                placeholder={t("customVehicle.contactPlaceholder")}
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
            disabled={isSubmitting}
          >
            {isSubmitting ? t("customVehicle.submitting") : t("customVehicle.submit")}
          </Button>
        </form>
      </div>
    </div>
  )
}
