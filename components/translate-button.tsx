"use client"

import { Button } from "@/components/ui/button"

export default function TranslateButton() {
  const handleTranslate = () => {
    const currentUrl = window.location.href
    const encodedUrl = encodeURIComponent(currentUrl)
    const translateUrl = `https://translate.google.com/translate?sl=auto&tl=en&u=${encodedUrl}`
    window.open(translateUrl, '_blank', 'noopener,noreferrer')
  }

  return (
    <Button
      variant="outline"
      onClick={handleTranslate}
      className="text-sm"
    >
      Preložiť do EN
    </Button>
  )
}
