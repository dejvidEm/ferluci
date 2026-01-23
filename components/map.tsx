"use client"

import { useEffect, useRef } from "react"

declare global {
  interface Window {
    google?: any
    initMap?: () => void
    __googleMapsScriptLoaded?: boolean
    __googleMapsCallbacks?: Array<() => void>
  }
}

// Initialize callbacks array if it doesn't exist
if (typeof window !== "undefined" && !window.__googleMapsCallbacks) {
  window.__googleMapsCallbacks = []
}

export default function Map() {
  const mapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Create custom car icon SVG
    const carIconSvg = `
      <svg width="48" height="48" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
        <circle cx="24" cy="24" r="22" fill="#dc2626" stroke="#fff" stroke-width="2"/>
        <path d="M14 20h20c1.1 0 2 .9 2 2v8c0 1.1-.9 2-2 2h-2c-.3 1.4-1.5 2.5-3 2.5s-2.7-1.1-3-2.5h-6c-.3 1.4-1.5 2.5-3 2.5s-2.7-1.1-3-2.5H14c-1.1 0-2-.9-2-2v-8c0-1.1.9-2 2-2zm1 2v6h20v-6H15zm-1.5 8c.8 0 1.5-.7 1.5-1.5s-.7-1.5-1.5-1.5-1.5.7-1.5 1.5.7 1.5 1.5 1.5zm19 0c.8 0 1.5-.7 1.5-1.5s-.7-1.5-1.5-1.5-1.5.7-1.5 1.5.7 1.5 1.5 1.5z" fill="#fff"/>
        <rect x="16" y="22" width="16" height="2" fill="#dc2626"/>
        <rect x="18" y="24" width="12" height="2" fill="#dc2626"/>
      </svg>
    `

    // Convert SVG to data URL
    const carIconUrl = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(carIconSvg)}`

    // Initialize map function
    const initMap = () => {
      if (!mapRef.current || !window.google) return

      const location = { lat: 48.1204, lng: 17.1077 } // Kopčianska 41, Petržalka coordinates

      const map = new window.google.maps.Map(mapRef.current, {
        center: location,
        zoom: 16,
        styles: [
          {
            featureType: "all",
            elementType: "geometry",
            stylers: [{ color: "#1a1a1a" }],
          },
          {
            featureType: "all",
            elementType: "labels.text.fill",
            stylers: [{ color: "#ffffff" }],
          },
          {
            featureType: "all",
            elementType: "labels.text.stroke",
            stylers: [{ color: "#000000" }],
          },
          {
            featureType: "road",
            elementType: "geometry",
            stylers: [{ color: "#2d2d2d" }],
          },
          {
            featureType: "water",
            elementType: "geometry",
            stylers: [{ color: "#1a1a1a" }],
          },
        ],
      })

      // Create custom marker with car icon
      const marker = new window.google.maps.Marker({
        position: location,
        map: map,
        title: "Kopčianska 41, 851 01 Petržalka",
        icon: {
          url: carIconUrl,
          scaledSize: new window.google.maps.Size(48, 48),
          anchor: new window.google.maps.Point(24, 48),
        },
      })

      // Add info window
      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="color: #000; padding: 8px;">
            <strong style="font-size: 16px;">Kopčianska 41</strong><br>
            <span style="font-size: 14px;">851 01 Petržalka</span>
          </div>
        `,
      })

      marker.addListener("click", () => {
        infoWindow.open(map, marker)
      })
    }

    // If Google Maps is already loaded, initialize immediately
    if (window.google && window.__googleMapsScriptLoaded) {
      initMap()
      return
    }

    // Add callback to the queue
    if (window.__googleMapsCallbacks) {
      window.__googleMapsCallbacks.push(initMap)
    }

    // Check if script is already being loaded or exists
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]')
    if (existingScript) {
      // Script exists, wait for it to load if not already loaded
      if (window.google) {
        initMap()
      }
      return () => {
        // Remove callback from queue on unmount
        if (window.__googleMapsCallbacks) {
          const index = window.__googleMapsCallbacks.indexOf(initMap)
          if (index > -1) {
            window.__googleMapsCallbacks.splice(index, 1)
          }
        }
      }
    }

    // Mark that we're loading the script
    window.__googleMapsScriptLoaded = false

    // Global callback that will initialize all queued maps
    window.initMap = () => {
      window.__googleMapsScriptLoaded = true
      // Initialize all queued callbacks
      if (window.__googleMapsCallbacks) {
        window.__googleMapsCallbacks.forEach((callback) => callback())
        window.__googleMapsCallbacks = []
      }
    }

    // Load Google Maps script only once
    const script = document.createElement("script")
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""}&callback=initMap`
    script.async = true
    script.defer = true
    script.id = "google-maps-script"

    document.head.appendChild(script)

    return () => {
      // Remove callback from queue on unmount
      if (window.__googleMapsCallbacks) {
        const index = window.__googleMapsCallbacks.indexOf(initMap)
        if (index > -1) {
          window.__googleMapsCallbacks.splice(index, 1)
        }
      }
    }
  }, [])

  // Fallback to iframe embed if API key is not available
  // Note: Custom car icon requires Google Maps JavaScript API key
  if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
    const encodedAddress = encodeURIComponent("Kopčianska 41, 851 01 Petržalka")

    return (
      <div className="w-full h-[500px] overflow-hidden">
        <iframe
          width="100%"
          height="100%"
          style={{ border: 0 }}
          loading="lazy"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
          src={`https://www.google.com/maps?q=${encodedAddress}&output=embed&zoom=16`}
        />
      </div>
    )
  }

  return <div ref={mapRef} className="w-full h-[500px] overflow-hidden bg-[#1a1a1a]" />
}

