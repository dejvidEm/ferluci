"use client"

import { track } from "@vercel/analytics"

function safeTrack(name: string, data?: Record<string, string>) {
  try {
    if (data) track(name, data)
    else track(name)
  } catch {
    // Analytics is unavailable in local preview. The click or submit still proceeds.
  }
}

export function trackPhoneClick() {
  safeTrack("phone_click")
}

export function trackContactSubmit(vehicleName?: string) {
  safeTrack("contact_submit", vehicleName ? { vehicle: vehicleName } : undefined)
}

export function trackCustomVehicleSubmit() {
  safeTrack("custom_vehicle_submit")
}

export function phoneHref(phone: string) {
  const normalized = phone.replace(/[^\d+]/g, "")
  return normalized ? `tel:${normalized}` : undefined
}
