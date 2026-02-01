"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"

interface LoanCalculatorProps {
  vehiclePrice: number
  vehicleId?: string
}

export default function LoanCalculator({ vehiclePrice, vehicleId }: LoanCalculatorProps) {
  const router = useRouter()
  const [downPaymentPercent, setDownPaymentPercent] = useState(20)
  const [financingYears, setFinancingYears] = useState(4)

  // Calculate loan details
  const calculations = useMemo(() => {
    const downPaymentAmount = (vehiclePrice * downPaymentPercent) / 100
    const loanAmount = vehiclePrice - downPaymentAmount
    const monthlyRate = 0.005 // 6% annual = 0.5% monthly (approximate)
    const numberOfPayments = financingYears * 12

    // Calculate monthly payment using loan formula
    // M = P * [r(1+r)^n] / [(1+r)^n - 1]
    const monthlyPayment =
      loanAmount > 0
        ? (loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments))) /
          (Math.pow(1 + monthlyRate, numberOfPayments) - 1)
        : 0

    return {
      downPaymentAmount,
      loanAmount,
      monthlyPayment,
    }
  }, [vehiclePrice, downPaymentPercent, financingYears])

  const downPaymentOptions = [0, 10, 20, 30, 40]
  const financingOptions = [3, 4, 5, 6, 7, 8]

  return (
    <Card className="bg-gradient-to-br from-blue-600/20 via-blue-500/10 to-transparent border-green-500/20 p-4 md:p-6 rounded-2xl backdrop-blur-sm relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `repeating-linear-gradient(
            45deg,
            transparent,
            transparent 10px,
            rgba(255,255,255,0.1) 10px,
            rgba(255,255,255,0.1) 20px
          )`
        }} />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <h3 className="text-lg md:text-xl font-bold text-white">Vypočítajte si vaše splátky</h3>
        </div>

        {/* Down Payment Section */}
        <div className="mb-4 md:mb-6">
          <label className="text-xs md:text-sm text-gray-300 mb-2 block">Výška akontácie</label>
          <div className="bg-[#121212]/50 rounded-lg p-3 md:p-4 mb-2 md:mb-3">
            <div className="text-xl md:text-2xl font-bold text-white">
              {formatCurrency(calculations.downPaymentAmount)}
            </div>
          </div>
          <div className="flex gap-1.5 md:gap-2 flex-wrap">
            {downPaymentOptions.map((percent) => (
              <Button
                key={percent}
                variant={downPaymentPercent === percent ? "default" : "outline"}
                size="sm"
                className={`text-xs md:text-sm ${
                  downPaymentPercent === percent
                    ? "bg-blue-600 hover:bg-blue-700 text-white border-blue-600"
                    : "bg-transparent border-white/20 text-gray-300 hover:bg-white/10"
                }`}
                onClick={() => setDownPaymentPercent(percent)}
              >
                {percent}%
              </Button>
            ))}
          </div>
        </div>

        {/* Financing Duration Section */}
        <div className="mb-4 md:mb-6">
          <label className="text-xs md:text-sm text-gray-300 mb-2 block">Dĺžka financovania</label>
          <div className="bg-[#121212]/50 rounded-lg p-3 md:p-4 mb-2 md:mb-3">
            <div className="text-base md:text-lg font-semibold text-white">
              {financingYears} {financingYears === 1 ? "rok" : financingYears < 5 ? "roky" : "rokov"}
            </div>
          </div>
          <div className="flex gap-1.5 md:gap-2 flex-wrap">
            {financingOptions.map((years) => (
              <Button
                key={years}
                variant={financingYears === years ? "default" : "outline"}
                size="sm"
                className={`text-xs md:text-sm ${
                  financingYears === years
                    ? "bg-blue-600 hover:bg-blue-700 text-white border-blue-600"
                    : "bg-transparent border-white/20 text-gray-300 hover:bg-white/10"
                }`}
                onClick={() => setFinancingYears(years)}
              >
                {years}
              </Button>
            ))}
          </div>
        </div>

        {/* Results Section */}
        <div className="space-y-3 md:space-y-4 mb-4 md:mb-6">
          <div className="flex justify-between items-center">
            <span className="text-xs md:text-sm text-gray-300">Cena vozidla</span>
            <span className="text-sm md:text-base text-white font-semibold">{formatCurrency(vehiclePrice)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs md:text-sm text-gray-300">Výška úveru</span>
            <span className="text-sm md:text-base text-white font-semibold">{formatCurrency(calculations.loanAmount)}</span>
          </div>
          <div className="flex justify-between items-center pt-3 md:pt-4 border-t border-white/10">
            <span className="text-xs md:text-sm text-gray-300">Mesačná splátka</span>
            <span className="text-xl md:text-2xl font-bold text-white">
              od {formatCurrency(calculations.monthlyPayment)}
            </span>
          </div>
        </div>

        {/* CTA Button */}
        <Button
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 md:py-6 text-sm md:text-base"
          onClick={() => {
            const params = new URLSearchParams()
            if (vehicleId) {
              params.set('vehicle', vehicleId)
            }
            params.set('loan', 'true')
            params.set('downPayment', downPaymentPercent.toString())
            params.set('financingYears', financingYears.toString())
            params.set('loanAmount', Math.round(calculations.loanAmount).toString())
            params.set('monthlyPayment', Math.round(calculations.monthlyPayment).toString())
            router.push(`/contact?${params.toString()}`)
            // Scroll to top of the page
            window.scrollTo({ top: 0, behavior: 'smooth' })
          }}
        >
          Mám záujem
        </Button>
      </div>
    </Card>
  )
}
