"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import AdminTabs from "@/components/admin/admin-tabs"
import { Download, LogOut } from "lucide-react"
import type { WeeklyReport } from "@/lib/weekly-report"

export default function AdminReportPage() {
  const router = useRouter()
  const reportRef = useRef<HTMLDivElement>(null)
  const [report, setReport] = useState<WeeklyReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const response = await fetch("/api/admin/report")
        if (!response.ok) {
          throw new Error("Nepodarilo sa načítať report")
        }
        setReport(await response.json())
      } catch (err) {
        setError(err instanceof Error ? err.message : "Nepodarilo sa načítať report")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" })
    router.push("/admin")
  }

  const downloadPdf = async () => {
    if (!reportRef.current) return
    setDownloading(true)
    try {
      const [{ default: html2canvas }, { default: JsPDF }] = await Promise.all([
        import("html2canvas"),
        import("jspdf"),
      ])
      const canvas = await html2canvas(reportRef.current, {
        backgroundColor: "#121212",
        scale: 2,
      })
      const image = canvas.toDataURL("image/png")
      const pdf = new JsPDF({ orientation: "portrait", unit: "mm", format: "a4" })
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      const imageHeight = (canvas.height * pageWidth) / canvas.width
      let heightLeft = imageHeight
      let position = 0

      pdf.addImage(image, "PNG", 0, position, pageWidth, imageHeight)
      heightLeft -= pageHeight
      while (heightLeft > 0) {
        position = heightLeft - imageHeight
        pdf.addPage()
        pdf.addImage(image, "PNG", 0, position, pageWidth, imageHeight)
        heightLeft -= pageHeight
      }

      pdf.save("ferluci-tyzdenny-report.pdf")
    } catch (err) {
      console.error(err)
      setError("PDF sa nepodarilo stiahnuť")
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#121212] p-3 sm:p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Report</h1>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button onClick={downloadPdf} disabled={!report || downloading} className="w-full sm:w-auto">
              <Download className="h-4 w-4 mr-2" />
              {downloading ? "Pripravujem PDF..." : "Stiahnuť PDF"}
            </Button>
            <Button variant="outline" onClick={handleLogout} className="w-full sm:w-auto">
              <LogOut className="h-4 w-4 mr-2" />
              Odhlásiť sa
            </Button>
          </div>
        </div>

        <AdminTabs />

        {loading ? (
          <p className="text-white">Načítavam report...</p>
        ) : error ? (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        ) : report ? (
          <div ref={reportRef} className="bg-[#161616] rounded-2xl border border-white/10 p-5 sm:p-8">
            <p className="text-primary text-xs tracking-widest uppercase">Ferluci Cars</p>
            <h2 className="text-2xl font-bold text-white mt-2">Týždenný report</h2>
            <p className="text-gray-400 mt-1">{report.periodLabel}</p>

            {report.sample && (
              <p className="mt-5 rounded-lg bg-[#3a1d1d] px-4 py-3 text-sm text-[#ffb4b4]">
                Testovací report. Čísla nižšie sú ukážka, nie živá návštevnosť.
              </p>
            )}

            <div className="grid sm:grid-cols-2 gap-4 mt-6">
              <div className="rounded-xl bg-[#1f1f1f] p-4">
                <p className="text-xs text-gray-400">Návštevy</p>
                <p className="text-3xl font-bold text-white mt-1">{report.visitors}</p>
                <p className="text-sm text-primary mt-2">
                  {report.visitorsChange} oproti {report.previousPeriodLabel}
                </p>
              </div>
              <div className="rounded-xl bg-[#1f1f1f] p-4">
                <p className="text-xs text-gray-400">Zobrazenia stránok</p>
                <p className="text-3xl font-bold text-white mt-1">{report.pageviews}</p>
                <p className="text-sm text-primary mt-2">
                  {report.pageviewsChange} oproti predošlému týždňu
                </p>
              </div>
            </div>

            <StatTable
              title="Najnavštevovanejšie stránky"
              nameLabel="Stránka"
              rows={report.topRoutes.map((route) => ({
                name: route.route,
                pageviews: route.pageviews,
                visitors: route.visitors,
              }))}
              empty="Žiadne dáta za toto obdobie."
            />

            <StatTable
              title="Najnavštevovanejšie vozidlá"
              nameLabel="Vozidlo"
              rows={report.topVehicles.map((vehicle) => ({
                name: vehicle.name,
                pageviews: vehicle.pageviews,
                visitors: vehicle.visitors,
              }))}
              empty="Za toto obdobie nie sú dáta o vozidlách."
            />

            {report.note && <p className="text-sm text-gray-400 mt-6">{report.note}</p>}
          </div>
        ) : null}
      </div>
    </div>
  )
}

function StatTable({
  title,
  nameLabel,
  rows,
  empty,
}: {
  title: string
  nameLabel: string
  rows: Array<{ name: string; pageviews: number; visitors: number }>
  empty: string
}) {
  return (
    <div className="mt-8">
      <h3 className="text-white font-semibold mb-3">{title}</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-400">
              <th className="py-2 pr-3 font-medium">{nameLabel}</th>
              <th className="py-2 px-3 font-medium text-right">Zobrazenia</th>
              <th className="py-2 pl-3 font-medium text-right">Návštevy</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={3} className="py-3 text-gray-400">
                  {empty}
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.name} className="border-t border-white/10 text-[#E8E3D3]">
                  <td className="py-3 pr-3">{row.name}</td>
                  <td className="py-3 px-3 text-right">{row.pageviews}</td>
                  <td className="py-3 pl-3 text-right">{row.visitors}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
