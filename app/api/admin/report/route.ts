import { NextResponse } from "next/server"
import { buildWeeklyReport } from "@/lib/weekly-report"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const report = await buildWeeklyReport()
    return NextResponse.json(report)
  } catch (error) {
    console.error("Admin report error:", error)
    return NextResponse.json({ error: "Report sa nepodarilo načítať" }, { status: 500 })
  }
}
