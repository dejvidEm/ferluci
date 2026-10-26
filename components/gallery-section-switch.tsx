import Link from "next/link"
import { cn } from "@/lib/utils"

type Props = {
  active: "gallery" | "delivered"
  galleryLabel: string
  deliveredLabel: string
}

export default function GallerySectionSwitch({ active, galleryLabel, deliveredLabel }: Props) {
  const badge = (selected: boolean) =>
    cn(
      "inline-flex h-10 items-center justify-center rounded-full px-5 text-sm font-medium transition-colors",
      selected
        ? "bg-white text-[#121212]"
        : "border border-white/30 bg-transparent text-white hover:bg-white/10"
    )

  return (
    <div className="mb-10 flex flex-wrap items-center justify-center gap-3">
      <Link
        href="/gallery"
        aria-current={active === "gallery" ? "page" : undefined}
        className={badge(active === "gallery")}
      >
        {galleryLabel}
      </Link>
      <Link
        href="/gallery/odovzdane"
        aria-current={active === "delivered" ? "page" : undefined}
        className={badge(active === "delivered")}
      >
        {deliveredLabel}
      </Link>
    </div>
  )
}
