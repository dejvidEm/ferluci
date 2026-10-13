import { NextResponse } from "next/server"
import { sendWeeklyReport } from "@/lib/weekly-report"

export const dynamic = "force-dynamic"

function isAuthorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret) return false
  return request.headers.get("authorization") === `Bearer ${secret}`
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const to = process.env.WEEKLY_REPORT_EMAIL || process.env.CONTACT_EMAIL
  if (!to) {
    return NextResponse.json({ error: "Missing WEEKLY_REPORT_EMAIL" }, { status: 500 })
  }

  const sample = new URL(request.url).searchParams.get("sample") === "1"
  if (!sample && (!process.env.VERCEL_ACCESS_TOKEN || !process.env.VERCEL_PROJECT_ID)) {
    return NextResponse.json(
      { error: "Chýba VERCEL_ACCESS_TOKEN alebo VERCEL_PROJECT_ID" },
      { status: 503 }
    )
  }

  try {
    const result = await sendWeeklyReport(to, { sample })
    return NextResponse.json({ ok: true, ...result })
  } catch (error) {
    console.error("Weekly report error:", error)
    return NextResponse.json({ error: "Report sa nepodarilo odoslať" }, { status: 500 })
  }
}
