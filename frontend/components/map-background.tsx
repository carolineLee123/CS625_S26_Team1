"use client"

import { useEffect, useRef } from "react"
import "leaflet/dist/leaflet.css"

export interface MapPin {
  id: string
  lat: number
  lng: number
  color: string
  number: number
  title: string
}

interface MapBackgroundProps {
  pins?: MapPin[]
  onPinClick?: (pinId: string) => void
  selectedPinId?: string
  onMapReady?: (map: any) => void
}

export function MapBackground({
  pins = [],
  onPinClick,
  selectedPinId,
  onMapReady,
}: MapBackgroundProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<any>(null)
  const markersRef = useRef<{ [key: string]: any }>({})

  useEffect(() => {
    let isMounted = true

    const initMap = async () => {
      if (!mapContainer.current || map.current) return

      const L = (await import("leaflet")).default
      if (!isMounted || !mapContainer.current) return

      map.current = L.map(mapContainer.current).setView([39.8283, -98.5795], 4)

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map.current)

      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
        iconUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
        shadowUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
      })

      onMapReady?.(map.current)
    }

    initMap()

    return () => {
      isMounted = false
      if (map.current) {
        map.current.remove()
        map.current = null
      }
    }
  }, [onMapReady])

  useEffect(() => {
    const updatePins = async () => {
      if (!map.current) return

      const L = (await import("leaflet")).default

      Object.values(markersRef.current).forEach((marker) => {
        map.current?.removeLayer(marker)
      })
      markersRef.current = {}

      pins.forEach((pin) => {
        const html = `
          <div style="
            width: 40px;
            height: 40px;
            background: ${pin.color};
            border: 3px solid white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            color: white;
            font-size: 18px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
            cursor: pointer;
            transition: all 0.2s;
          " class="map-pin-${pin.id}">
            ${pin.number}
          </div>
        `

        const icon = L.divIcon({
          html,
          className: "",
          iconSize: [40, 40],
          iconAnchor: [20, 20],
        })

        const marker = L.marker([pin.lat, pin.lng], { icon })
          .addTo(map.current)
          .on("click", () => {
            onPinClick?.(pin.id)
          })

        markersRef.current[pin.id] = marker
      })
    }

    updatePins()
  }, [pins, onPinClick])

  useEffect(() => {
    Object.entries(markersRef.current).forEach(([pinId]) => {
      const pinEl = document.querySelector(`.map-pin-${pinId}`) as HTMLElement | null
      if (pinEl) {
        if (pinId === selectedPinId) {
          pinEl.style.transform = "scale(1.3)"
          pinEl.style.zIndex = "1000"
        } else {
          pinEl.style.transform = "scale(1)"
          pinEl.style.zIndex = "999"
        }
      }
    })
  }, [selectedPinId])

  return (
    <div
      ref={mapContainer}
      className="absolute inset-0 h-full w-full bg-slate-100"
      style={{ zIndex: 0 }}
    />
  )
}