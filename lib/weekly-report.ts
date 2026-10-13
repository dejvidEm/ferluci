import { Resend } from "resend"
import { client } from "@/lib/sanity"

export type RouteStat = {
  route: string
  pageviews: number
  visitors: number
}

export type VehicleStat = {
  name: string
  path: string
  pageviews: number
  visitors: number
}

export type ShareStat = {
  name: string
  visitors: number
  share: number
}

export type InquiryStat = {
  name: string
  count: number
}

export type WeeklyReport = {
  sample: boolean
  siteUrl: string
  periodLabel: string
  previousPeriodLabel: string
  pageviews: number
  visitors: number
  visitorsChange: string
  pageviewsChange: string
  previousPageviews: number
  previousVisitors: number
  contactSubmits: number
  previousContactSubmits: number
  customVehicleSubmits: number
  previousCustomVehicleSubmits: number
  inquiries: number
  inquiriesChange: string
  phoneClicks: number
  phoneClicksChange: string
  sources: ShareStat[]
  devices: ShareStat[]
  vehicleInquiries: InquiryStat[]
  topRoutes: RouteStat[]
  topVehicles: VehicleStat[]
  note?: string
}

type VisitTotals = { pageviews: number; visitors: number }

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.ferlucicars.eu"

function isoDaysAgo(days: number): string {
  const date = new Date()
  date.setUTCDate(date.getUTCDate() - days)
  date.setUTCHours(0, 0, 0, 0)
  return date.toISOString()
}

function formatDay(iso: string): string {
  return new Intl.DateTimeFormat("sk-SK", {
    day: "numeric",
    month: "numeric",
    year: "numeric",
    timeZone: "Europe/Bratislava",
  }).format(new Date(iso))
}

function percentChange(current: number, previous: number): string {
  if (previous <= 0) return current > 0 ? "nové" : "0 %"
  const change = ((current - previous) / previous) * 100
  const rounded = Math.round(change)
  if (rounded > 0) return `+${rounded} %`
  return `${rounded} %`
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

async function analyticsQuery(path: string, params: Record<string, string>) {
  const token = process.env.VERCEL_ACCESS_TOKEN
  const projectId = process.env.VERCEL_PROJECT_ID
  if (!token || !projectId) {
    throw new Error("Missing VERCEL_ACCESS_TOKEN or VERCEL_PROJECT_ID")
  }

  const url = new URL(`https://api.vercel.com/v1/query/web-analytics/${path}`)
  url.searchParams.set("projectId", projectId)
  if (process.env.VERCEL_TEAM_ID) {
    url.searchParams.set("teamId", process.env.VERCEL_TEAM_ID)
  }
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value)
  }

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`Vercel Analytics ${response.status}: ${body.slice(0, 300)}`)
  }

  return response.json() as Promise<{ data?: unknown }>
}

function readTotals(data: unknown): VisitTotals {
  if (data && typeof data === "object" && "pageviews" in data && "visitors" in data) {
    const row = data as { pageviews?: number; visitors?: number }
    return {
      pageviews: Number(row.pageviews ?? 0),
      visitors: Number(row.visitors ?? 0),
    }
  }
  return { pageviews: 0, visitors: 0 }
}

function readLabeledRows(data: unknown, limit = 20): RouteStat[] {
  const rows = Array.isArray(data)
    ? data
    : data && typeof data === "object" && Array.isArray((data as { rows?: unknown }).rows)
      ? (data as { rows: unknown[] }).rows
      : []

  return rows
    .map((row) => {
      if (!row || typeof row !== "object") return null
      const item = row as Record<string, unknown>
      const route = String(
        item.route ?? item.requestPath ?? item.referrerHostname ?? item.deviceType ?? item.key ?? "—"
      )
      if (!route || route === "null" || route === "Others") return null
      return {
        route,
        pageviews: Number(item.pageviews ?? item.count ?? item.total ?? 0),
        visitors: Number(item.visitors ?? item.count ?? 0),
      }
    })
    .filter((row): row is RouteStat => row !== null)
    .slice(0, limit)
}

function readRoutes(data: unknown): RouteStat[] {
  return readLabeledRows(data, 8)
}

function readEventCount(data: unknown): number {
  if (data && typeof data === "object" && "count" in data) {
    return Number((data as { count?: number }).count ?? 0)
  }
  return 0
}

function withShare(rows: Array<{ name: string; visitors: number }>): ShareStat[] {
  const total = rows.reduce((sum, row) => sum + row.visitors, 0)
  return rows
    .filter((row) => row.visitors > 0)
    .sort((a, b) => b.visitors - a.visitors)
    .map((row) => ({
      ...row,
      share: total > 0 ? Math.round((row.visitors / total) * 100) : 0,
    }))
}

function bucketSource(host: string): string {
  const value = host.toLowerCase()
  if (!value || value === "—" || value === "direct" || value === "(direct)") return "Priama návšteva"
  if (value.includes("instagram")) return "Instagram"
  if (value.includes("google")) return "Google"
  if (value.includes("facebook") || value.includes("fb.")) return "Facebook"
  return "Ostatné"
}

function bucketDevice(device: string): string {
  const value = device.toLowerCase()
  if (value.includes("mobile") || value.includes("phone")) return "Mobil"
  if (value.includes("desktop")) return "Počítač"
  if (value.includes("tablet")) return "Tablet"
  return "Ostatné"
}

function groupBuckets(rows: RouteStat[], bucket: (label: string) => string): ShareStat[] {
  const totals = new Map<string, number>()
  for (const row of rows) {
    const name = bucket(row.route)
    totals.set(name, (totals.get(name) ?? 0) + (row.visitors || row.pageviews))
  }
  return withShare([...totals.entries()].map(([name, visitors]) => ({ name, visitors })))
}

function sampleReport(since: string, until: string, previousSince: string): WeeklyReport {
  const pageviews = 1280
  const visitors = 640
  const previousPageviews = 1104
  const previousVisitors = 590
  return {
    sample: true,
    siteUrl: SITE_URL,
    periodLabel: `${formatDay(since)} – ${formatDay(until)}`,
    previousPeriodLabel: `${formatDay(previousSince)} – ${formatDay(since)}`,
    pageviews,
    visitors,
    visitorsChange: percentChange(visitors, previousVisitors),
    pageviewsChange: percentChange(pageviews, previousPageviews),
    previousPageviews,
    previousVisitors,
    contactSubmits: 18,
    previousContactSubmits: 14,
    customVehicleSubmits: 6,
    previousCustomVehicleSubmits: 4,
    inquiries: 24,
    inquiriesChange: percentChange(24, 18),
    phoneClicks: 41,
    phoneClicksChange: percentChange(41, 33),
    sources: [
      { name: "Google", visitors: 280, share: 44 },
      { name: "Instagram", visitors: 160, share: 25 },
      { name: "Priama návšteva", visitors: 120, share: 19 },
      { name: "Facebook", visitors: 48, share: 7 },
      { name: "Ostatné", visitors: 32, share: 5 },
    ],
    devices: [
      { name: "Mobil", visitors: 460, share: 72 },
      { name: "Počítač", visitors: 154, share: 24 },
      { name: "Tablet", visitors: 26, share: 4 },
    ],
    vehicleInquiries: [
      { name: "2022 BMW M4 Competition", count: 5 },
      { name: "2021 Audi RS6 Avant", count: 4 },
      { name: "2023 BMW X5", count: 3 },
      { name: "Bez konkrétneho vozidla", count: 6 },
    ],
    topRoutes: [
      { route: "/", pageviews: 540, visitors: 310 },
      { route: "/ponuka", pageviews: 410, visitors: 220 },
      { route: "/contact", pageviews: 96, visitors: 70 },
      { route: "/gallery", pageviews: 84, visitors: 61 },
      { route: "/services", pageviews: 52, visitors: 40 },
    ],
    topVehicles: [
      { name: "2022 BMW M4 Competition", path: "/ponuka/bmw-m4", pageviews: 86, visitors: 54 },
      { name: "2021 Audi RS6 Avant", path: "/ponuka/audi-rs6", pageviews: 71, visitors: 48 },
      { name: "2020 Mercedes-AMG GT", path: "/ponuka/amg-gt", pageviews: 44, visitors: 31 },
      { name: "2019 Porsche 911 Turbo S", path: "/ponuka/911-turbo", pageviews: 38, visitors: 27 },
      { name: "2023 BMW X5", path: "/ponuka/bmw-x5", pageviews: 29, visitors: 21 },
    ],
    note: "Toto sú ukážkové čísla. Reálne štatistiky sa doplnia po nastavení VERCEL_ACCESS_TOKEN a VERCEL_PROJECT_ID vo Verceli.",
  }
}

function isVehiclePath(path: string): boolean {
  return /^\/ponuka\/[^/]+$/.test(path)
}

async function resolveVehicleNames(rows: RouteStat[]): Promise<VehicleStat[]> {
  const vehicleRows = rows.filter((row) => isVehiclePath(row.route)).slice(0, 5)
  if (vehicleRows.length === 0) return []

  const ids = vehicleRows.map((row) => row.route.replace("/ponuka/", ""))
  let names = new Map<string, string>()
  try {
    const docs = await client.fetch<Array<{ _id: string; year?: number; make?: string; model?: string }>>(
      `*[_type == "vehicle" && _id in $ids]{ _id, year, make, model }`,
      { ids }
    )
    names = new Map(
      docs.map((doc) => [doc._id, [doc.year, doc.make, doc.model].filter(Boolean).join(" ")])
    )
  } catch (error) {
    console.error("Error resolving vehicle names for report:", error)
  }

  return vehicleRows.map((row) => {
    const id = row.route.replace("/ponuka/", "")
    return {
      name: names.get(id) || row.route,
      path: row.route,
      pageviews: row.pageviews,
      visitors: row.visitors,
    }
  })
}

export async function buildWeeklyReport(options?: { sample?: boolean }): Promise<WeeklyReport> {
  const until = new Date().toISOString()
  const since = isoDaysAgo(7)
  const previousSince = isoDaysAgo(14)

  if (options?.sample || !process.env.VERCEL_ACCESS_TOKEN || !process.env.VERCEL_PROJECT_ID) {
    return sampleReport(since, until, previousSince)
  }

  const event = (name: string, from: string, to: string) =>
    analyticsQuery("events/count", {
      since: from,
      until: to,
      filter: `eventName eq '${name}'`,
    }).catch(() => ({ data: undefined }))

  const [current, previous, routes, paths, referrers, devices, contactNow, contactPrev, customNow, customPrev, phoneNow, phonePrev, inquiryVehicles] =
    await Promise.all([
      analyticsQuery("visits/count", { since, until }),
      analyticsQuery("visits/count", { since: previousSince, until: since }),
      analyticsQuery("visits/aggregate", { since, until, by: "route", limit: "8" }),
      analyticsQuery("visits/aggregate", { since, until, by: "requestPath", limit: "50" }),
      analyticsQuery("visits/aggregate", { since, until, by: "referrerHostname", limit: "20" }).catch(() => ({ data: undefined })),
      analyticsQuery("visits/aggregate", { since, until, by: "deviceType", limit: "10" }).catch(() => ({ data: undefined })),
      event("contact_submit", since, until),
      event("contact_submit", previousSince, since),
      event("custom_vehicle_submit", since, until),
      event("custom_vehicle_submit", previousSince, since),
      event("phone_click", since, until),
      event("phone_click", previousSince, since),
      analyticsQuery("events/aggregate", {
        since,
        until,
        by: "eventData/vehicle",
        limit: "8",
        filter: "eventName eq 'contact_submit'",
      }).catch(() => ({ data: undefined })),
    ])

  const currentTotals = readTotals(current.data)
  const previousTotals = readTotals(previous.data)
  const topRoutes = readRoutes(routes.data)
    .filter((row) => !isVehiclePath(row.route))
    .slice(0, 5)
  const contactSubmits = readEventCount(contactNow.data)
  const previousContactSubmits = readEventCount(contactPrev.data)
  const customVehicleSubmits = readEventCount(customNow.data)
  const previousCustomVehicleSubmits = readEventCount(customPrev.data)
  const inquiries = contactSubmits + customVehicleSubmits
  const previousInquiries = previousContactSubmits + previousCustomVehicleSubmits
  const phoneClicks = readEventCount(phoneNow.data)
  const previousPhoneClicks = readEventCount(phonePrev.data)

  return {
    sample: false,
    siteUrl: SITE_URL,
    periodLabel: `${formatDay(since)} – ${formatDay(until)}`,
    previousPeriodLabel: `${formatDay(previousSince)} – ${formatDay(since)}`,
    pageviews: currentTotals.pageviews,
    visitors: currentTotals.visitors,
    visitorsChange: percentChange(currentTotals.visitors, previousTotals.visitors),
    pageviewsChange: percentChange(currentTotals.pageviews, previousTotals.pageviews),
    previousPageviews: previousTotals.pageviews,
    previousVisitors: previousTotals.visitors,
    contactSubmits,
    previousContactSubmits,
    customVehicleSubmits,
    previousCustomVehicleSubmits,
    inquiries,
    inquiriesChange: percentChange(inquiries, previousInquiries),
    phoneClicks,
    phoneClicksChange: percentChange(phoneClicks, previousPhoneClicks),
    sources: groupBuckets(readLabeledRows(referrers.data, 20), bucketSource),
    devices: groupBuckets(readLabeledRows(devices.data, 10), bucketDevice),
    vehicleInquiries: readLabeledRows(inquiryVehicles.data, 8).map((row) => ({
      name: row.route === "—" || row.route === "" ? "Bez konkrétneho vozidla" : row.route,
      count: row.pageviews || row.visitors,
    })),
    topRoutes,
    topVehicles: await resolveVehicleNames(readLabeledRows(paths.data, 50)),
  }
}

export function renderWeeklyReportHtml(report: WeeklyReport): string {
  const rows = report.topRoutes
    .map(
      (route) => `
        <tr>
          <td style="padding: 10px 12px; border-bottom: 1px solid #2a2a2a; color: #E8E3D3;">${escapeHtml(route.route)}</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #2a2a2a; color: #E8E3D3; text-align: right;">${route.pageviews}</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #2a2a2a; color: #E8E3D3; text-align: right;">${route.visitors}</td>
        </tr>`
    )
    .join("")

  const banner = report.sample
    ? `<p style="margin: 0 0 20px; padding: 12px 14px; background: #3a1d1d; border-radius: 8px; color: #ffb4b4; font-size: 14px;">Testovací report. Čísla nižšie sú ukážka, nie živá návštevnosť.</p>`
    : ""

  return `<!DOCTYPE html>
<html>
  <body style="margin:0; padding:0; background:#0e0e0e; font-family: Arial, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#0e0e0e; padding: 32px 12px;">
      <tr>
        <td align="center">
          <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px; background:#161616; border-radius:16px; overflow:hidden;">
            <tr>
              <td style="padding: 28px 32px 8px;">
                <p style="margin:0; color:#E85D5D; font-size:12px; letter-spacing:0.08em; text-transform:uppercase;">Ferluci Cars</p>
                <h1 style="margin:8px 0 0; color:#ffffff; font-size:24px;">Týždenný report</h1>
                <p style="margin:8px 0 0; color:#B8B3A3; font-size:14px;">${escapeHtml(report.periodLabel)}</p>
              </td>
            </tr>
            <tr>
              <td style="padding: 8px 32px 28px;">
                ${banner}
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="width:50%; padding: 8px 8px 8px 0;">
                      <div style="background:#1f1f1f; border-radius:12px; padding:16px;">
                        <p style="margin:0; color:#B8B3A3; font-size:12px;">Návštevy</p>
                        <p style="margin:6px 0 0; color:#ffffff; font-size:28px; font-weight:700;">${report.visitors}</p>
                        <p style="margin:6px 0 0; color:#E85D5D; font-size:13px;">${escapeHtml(report.visitorsChange)} oproti ${escapeHtml(report.previousPeriodLabel)}</p>
                      </div>
                    </td>
                    <td style="width:50%; padding: 8px 0 8px 8px;">
                      <div style="background:#1f1f1f; border-radius:12px; padding:16px;">
                        <p style="margin:0; color:#B8B3A3; font-size:12px;">Zobrazenia stránok</p>
                        <p style="margin:6px 0 0; color:#ffffff; font-size:28px; font-weight:700;">${report.pageviews}</p>
                        <p style="margin:6px 0 0; color:#E85D5D; font-size:13px;">${escapeHtml(report.pageviewsChange)} oproti predošlému týždňu</p>
                      </div>
                    </td>
                  </tr>
                </table>
                <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:8px;">
                  <tr>
                    <td style="width:50%; padding: 8px 8px 8px 0;">
                      <div style="background:#1f1f1f; border-radius:12px; padding:16px;">
                        <p style="margin:0; color:#B8B3A3; font-size:12px;">Dopyty</p>
                        <p style="margin:6px 0 0; color:#ffffff; font-size:28px; font-weight:700;">${report.inquiries}</p>
                        <p style="margin:6px 0 0; color:#E85D5D; font-size:13px;">${escapeHtml(report.inquiriesChange)} oproti predošlému týždňu</p>
                      </div>
                    </td>
                    <td style="width:50%; padding: 8px 0 8px 8px;">
                      <div style="background:#1f1f1f; border-radius:12px; padding:16px;">
                        <p style="margin:0; color:#B8B3A3; font-size:12px;">Kliknutia na telefón</p>
                        <p style="margin:6px 0 0; color:#ffffff; font-size:28px; font-weight:700;">${report.phoneClicks}</p>
                        <p style="margin:6px 0 0; color:#E85D5D; font-size:13px;">${escapeHtml(report.phoneClicksChange)} oproti predošlému týždňu</p>
                      </div>
                    </td>
                  </tr>
                </table>
                <h2 style="margin:24px 0 8px; color:#ffffff; font-size:16px;">Najnavštevovanejšie stránky</h2>
                <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                  <tr>
                    <th align="left" style="padding:8px 12px; color:#B8B3A3; font-size:12px; font-weight:600;">Stránka</th>
                    <th align="right" style="padding:8px 12px; color:#B8B3A3; font-size:12px; font-weight:600;">Zobrazenia</th>
                    <th align="right" style="padding:8px 12px; color:#B8B3A3; font-size:12px; font-weight:600;">Návštevy</th>
                  </tr>
                  ${rows || `<tr><td colspan="3" style="padding:12px; color:#B8B3A3;">Žiadne dáta za toto obdobie.</td></tr>`}
                </table>
                <h2 style="margin:24px 0 8px; color:#ffffff; font-size:16px;">Najnavštevovanejšie vozidlá</h2>
                <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                  <tr>
                    <th align="left" style="padding:8px 12px; color:#B8B3A3; font-size:12px; font-weight:600;">Vozidlo</th>
                    <th align="right" style="padding:8px 12px; color:#B8B3A3; font-size:12px; font-weight:600;">Zobrazenia</th>
                    <th align="right" style="padding:8px 12px; color:#B8B3A3; font-size:12px; font-weight:600;">Návštevy</th>
                  </tr>
                  ${
                    report.topVehicles
                      .map(
                        (vehicle) => `
                  <tr>
                    <td style="padding: 10px 12px; border-bottom: 1px solid #2a2a2a; color: #E8E3D3;">${escapeHtml(vehicle.name)}</td>
                    <td style="padding: 10px 12px; border-bottom: 1px solid #2a2a2a; color: #E8E3D3; text-align: right;">${vehicle.pageviews}</td>
                    <td style="padding: 10px 12px; border-bottom: 1px solid #2a2a2a; color: #E8E3D3; text-align: right;">${vehicle.visitors}</td>
                  </tr>`
                      )
                      .join("") ||
                    `<tr><td colspan="3" style="padding:12px; color:#B8B3A3;">Za toto obdobie nie sú dáta o vozidlách.</td></tr>`
                  }
                </table>
                ${report.note ? `<p style="margin:20px 0 0; color:#B8B3A3; font-size:13px; line-height:1.5;">${escapeHtml(report.note)}</p>` : ""}
              </td>
            </tr>
            <tr>
              <td style="padding: 18px 32px 24px; background:#121212;">
                <p style="margin:0; color:#B8B3A3; font-size:12px;">
                  Report z <a href="${escapeHtml(report.siteUrl)}" style="color:#E85D5D; text-decoration:none;">${escapeHtml(report.siteUrl.replace(/^https?:\/\//, ""))}</a>
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`
}

export async function sendWeeklyReport(to: string, options?: { sample?: boolean }) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    throw new Error("Missing RESEND_API_KEY")
  }

  const report = await buildWeeklyReport(options)
  const resend = new Resend(apiKey)
  const { data, error } = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || "Ferluci Cars <onboarding@resend.dev>",
    to,
    subject: report.sample
      ? "Ferluci Cars — testovací týždenný report"
      : `Ferluci Cars — týždenný report (${report.periodLabel})`,
    html: renderWeeklyReportHtml(report),
  })

  if (error) {
    throw new Error(error.message)
  }

  return { id: data?.id ?? null, sample: report.sample }
}
