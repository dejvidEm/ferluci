"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import AdminTabs from "@/components/admin/admin-tabs"
import { Download, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ShareStat, WeeklyReport } from "@/lib/weekly-report"

const sections = [
  { id: "prehľad", label: "Prehľad" },
  { id: "dopyty", label: "Dopyty" },
  { id: "zdroje", label: "Zdroje" },
  { id: "zariadenia", label: "Zariadenia" },
  { id: "obsah", label: "Stránky a vozidlá" },
] as const

type SectionId = (typeof sections)[number]["id"]

export default function AdminReportPage() {
  const router = useRouter()
  const reportRef = useRef<HTMLDivElement>(null)
  const [report, setReport] = useState<WeeklyReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [downloading, setDownloading] = useState(false)
  const [section, setSection] = useState<SectionId>("prehľad")
  const [showAll, setShowAll] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const response = await fetch("/api/admin/report")
        if (!response.ok) throw new Error("Nepodarilo sa načítať report")
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
    setShowAll(true)
    await new Promise((resolve) => setTimeout(resolve, 50))
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
      setShowAll(false)
      setDownloading(false)
    }
  }

  const visible = (id: SectionId) => showAll || section === id

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
          <>
            <div className="flex gap-2 overflow-x-auto pb-4 mb-2">
              {sections.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSection(item.id)}
                  className={cn(
                    "shrink-0 rounded-full px-4 py-2 text-sm transition-colors",
                    section === item.id
                      ? "bg-white text-[#121212]"
                      : "bg-white/5 text-gray-300 hover:bg-white/10"
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div ref={reportRef} className="space-y-6">
              <div className="bg-[#161616] rounded-2xl border border-white/10 p-5 sm:p-8">
                <p className="text-primary text-xs tracking-widest uppercase">Ferluci Cars</p>
                <h2 className="text-2xl font-bold text-white mt-2">Týždenný report</h2>
                <p className="text-gray-400 mt-1">{report.periodLabel}</p>
                {report.sample && (
                  <p className="mt-5 rounded-lg bg-[#3a1d1d] px-4 py-3 text-sm text-[#ffb4b4]">
                    Testovací report. Čísla nižšie sú ukážka, nie živá návštevnosť. Dopyty a kliknutia na telefón sa začnú počítať až po nasadení.
                  </p>
                )}
              </div>

              {visible("prehľad") && (
                <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
                  <Kpi label="Návštevy" value={report.visitors} change={report.visitorsChange} hint={report.previousPeriodLabel} />
                  <Kpi label="Zobrazenia" value={report.pageviews} change={report.pageviewsChange} hint="oproti predošlému týždňu" />
                  <Kpi label="Dopyty" value={report.inquiries} change={report.inquiriesChange} hint="formuláre spolu" />
                  <Kpi label="Telefón" value={report.phoneClicks} change={report.phoneClicksChange} hint="kliknutia na číslo" />
                </div>
              )}

              {visible("dopyty") && (
                <section className="bg-[#161616] rounded-2xl border border-white/10 p-5 sm:p-8">
                  <h3 className="text-white text-lg font-semibold">Dopyty</h3>
                  <p className="text-sm text-gray-400 mt-1">Odoslané formuláre za {report.periodLabel}</p>
                  <div className="grid sm:grid-cols-2 gap-4 mt-6">
                    <Kpi label="Kontaktný formulár" value={report.contactSubmits} change={`${report.previousContactSubmits} predošlý týždeň`} hint="vrátane dopytu na konkrétne auto" />
                    <Kpi label="Auto na mieru" value={report.customVehicleSubmits} change={`${report.previousCustomVehicleSubmits} predošlý týždeň`} hint="formulár pod ponukou" />
                  </div>
                  <StatTable
                    title="O ktoré vozidlá ľudia písali"
                    nameLabel="Vozidlo"
                    valueLabel="Dopyty"
                    rows={report.vehicleInquiries.map((item) => ({ name: item.name, value: item.count }))}
                    empty="Zatiaľ nie je dopyt viazaný na konkrétne vozidlo."
                  />
                </section>
              )}

              {visible("zdroje") && (
                <section className="bg-[#161616] rounded-2xl border border-white/10 p-5 sm:p-8">
                  <h3 className="text-white text-lg font-semibold">Odkiaľ ľudia prišli</h3>
                  <p className="text-sm text-gray-400 mt-1">Podiel návštev podľa zdroja</p>
                  <ShareBars rows={report.sources} empty="Zatiaľ nie sú dáta o zdrojoch návštev." />
                </section>
              )}

              {visible("zariadenia") && (
                <section className="bg-[#161616] rounded-2xl border border-white/10 p-5 sm:p-8">
                  <h3 className="text-white text-lg font-semibold">Mobil a počítač</h3>
                  <p className="text-sm text-gray-400 mt-1">Na akom zariadení si web otvorili</p>
                  <ShareBars rows={report.devices} empty="Zatiaľ nie sú dáta o zariadeniach." />
                </section>
              )}

              {visible("obsah") && (
                <section className="bg-[#161616] rounded-2xl border border-white/10 p-5 sm:p-8">
                  <StatTable
                    title="Najnavštevovanejšie stránky"
                    nameLabel="Stránka"
                    valueLabel="Zobrazenia"
                    secondaryLabel="Návštevy"
                    rows={report.topRoutes.map((row) => ({
                      name: row.route,
                      value: row.pageviews,
                      secondary: row.visitors,
                    }))}
                    empty="Žiadne dáta za toto obdobie."
                  />
                  <StatTable
                    title="Najnavštevovanejšie vozidlá"
                    nameLabel="Vozidlo"
                    valueLabel="Zobrazenia"
                    secondaryLabel="Návštevy"
                    rows={report.topVehicles.map((row) => ({
                      name: row.name,
                      value: row.pageviews,
                      secondary: row.visitors,
                    }))}
                    empty="Za toto obdobie nie sú dáta o vozidlách."
                  />
                </section>
              )}

              {report.note && <p className="text-sm text-gray-400 px-1">{report.note}</p>}
            </div>
          </>
        ) : null}
      </div>
    </div>
  )
}

function Kpi({ label, value, change, hint }: { label: string; value: number; change: string; hint: string }) {
  return (
    <div className="rounded-2xl bg-[#1f1f1f] border border-white/10 p-4">
      <p className="text-xs text-gray-400">{label}</p>
      <p className="text-3xl font-bold text-white mt-2">{value}</p>
      <p className="text-sm text-primary mt-2">{change}</p>
      <p className="text-xs text-gray-500 mt-1">{hint}</p>
    </div>
  )
}

function ShareBars({ rows, empty }: { rows: ShareStat[]; empty: string }) {
  if (rows.length === 0) return <p className="text-gray-400 mt-6">{empty}</p>
  const max = Math.max(...rows.map((row) => row.share), 1)
  return (
    <div className="mt-6 space-y-4">
      {rows.map((row) => (
        <div key={row.name}>
          <div className="flex justify-between text-sm mb-1.5">
            <span className="text-white">{row.name}</span>
            <span className="text-gray-400">{row.share} % · {row.visitors}</span>
          </div>
          <div className="h-2.5 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full bg-primary"
              style={{ width: `${Math.max(4, (row.share / max) * 100)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

function StatTable({
  title,
  nameLabel,
  valueLabel,
  secondaryLabel,
  rows,
  empty,
}: {
  title: string
  nameLabel: string
  valueLabel: string
  secondaryLabel?: string
  rows: Array<{ name: string; value: number; secondary?: number }>
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
              <th className="py-2 px-3 font-medium text-right">{valueLabel}</th>
              {secondaryLabel && <th className="py-2 pl-3 font-medium text-right">{secondaryLabel}</th>}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={secondaryLabel ? 3 : 2} className="py-3 text-gray-400">{empty}</td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.name} className="border-t border-white/10 text-[#E8E3D3]">
                  <td className="py-3 pr-3">{row.name}</td>
                  <td className="py-3 px-3 text-right">{row.value}</td>
                  {secondaryLabel && <td className="py-3 pl-3 text-right">{row.secondary ?? 0}</td>}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
