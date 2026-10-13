"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const tabs = [
  { href: "/admin/vehicles", label: "Vozidlá" },
  { href: "/admin/report", label: "Report" },
]

export default function AdminTabs() {
  const pathname = usePathname()

  return (
    <div className="flex gap-2 mb-6">
      {tabs.map((tab) => {
        const active = pathname === tab.href || pathname.startsWith(`${tab.href}/`)
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "rounded-xl px-4 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-primary text-primary-foreground"
                : "bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white"
            )}
          >
            {tab.label}
          </Link>
        )
      })}
    </div>
  )
}
