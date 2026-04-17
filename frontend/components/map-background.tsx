"use client"

import { useEffect, useRef, useState } from "react"
import "leaflet/dist/leaflet.css"

export interface MapPin {
  id: string
  lat: number
  lng: number
  color: string
  number: number
  title: string
  description?: string
  category?: string
  safetyLevel?: string
  urgency?: string
  location?: string
  status?: string
  createdAt?: string
  verifiedCount?: number
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
  const [mapReady, setMapReady] = useState(false)

  useEffect(() => {
    let isMounted = true

    const initMap = async () => {
      if (!mapContainer.current || map.current) return

      const L = (await import("leaflet")).default
      if (!isMounted || !mapContainer.current) return

      map.current = L.map(mapContainer.current).setView([42.3601, -71.0589], 13)

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

      console.log('MapBackground: Map initialized, setting mapReady to true');
      setMapReady(true);
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
      console.log('MapBackground: updatePins called with', pins.length, 'pins', 'mapReady:', mapReady);
      if (!map.current || !mapReady) {
        console.log('MapBackground: map not ready yet, skipping pin update');
        return;
      }

      const L = (await import("leaflet")).default

      Object.values(markersRef.current).forEach((marker) => {
        map.current?.removeLayer(marker)
      })
      markersRef.current = {}

      console.log('MapBackground: Adding pins to map:', pins);
      pins.forEach((pin) => {
        console.log('Adding pin:', pin.id, 'at', pin.lat, pin.lng);
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

        // Add tooltip with report information
        if (pin.description || pin.category || pin.safetyLevel) {
          const urgencyClass = pin.urgency === 'Urgent' ? 'tag-urgent'
            : pin.urgency === 'Warning' ? 'tag-warning'
            : 'tag-nonurgent'

          const categoryClassMap: Record<string, string> = {
            safety: 'tag-safety', event: 'tag-event', note: 'tag-note', weather: 'tag-weather',
          }
          const catClass = pin.category ? (categoryClassMap[pin.category.toLowerCase()] ?? 'tag-note') : ''
          const categoryLabel = pin.category
            ? pin.category.charAt(0).toUpperCase() + pin.category.slice(1)
            : ''

          const statusLabel = pin.status === 'open' ? 'Active'
            : pin.status === 'in_progress' ? 'In Progress'
            : pin.status === 'resolved' ? 'Resolved'
            : pin.status === 'closed' ? 'Inactive'
            : pin.status ?? ''

          let dateLabel = ''
          if (pin.createdAt) {
            const d = new Date(pin.createdAt)
            const days = ['SUN','MON','TUE','WED','THU','FRI','SAT']
            dateLabel = `${days[d.getDay()]} ${d.getMonth() + 1}/${d.getDate()}`
          }

          const metaLine = [statusLabel, dateLabel].filter(Boolean).join(' · ')
          const verifiedLine = typeof pin.verifiedCount === 'number'
            ? `<div style="display:flex;align-items:center;gap:4px;margin-bottom:6px;font-size:11px;color:#2563eb;">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" stroke="#2563eb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                ${pin.verifiedCount > 5 ? `>5` : pin.verifiedCount} member${pin.verifiedCount === 1 ? '' : 's'} verified this report
              </div>`
            : ''

          const truncDesc = pin.description
            ? pin.description.substring(0, 90) + (pin.description.length > 90 ? '…' : '')
            : ''

          const tooltipContent = `
            <div style="font-family:system-ui,-apple-system,sans-serif;width:260px;">
              <h3 style="margin:0 0 7px 0;font-size:14px;font-weight:700;color:#111;line-height:1.3;">${pin.title}</h3>
              <div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:7px;">
                ${pin.urgency ? `<span class="${urgencyClass}" style="display:inline-block;padding:2px 8px;border-radius:20px;font-size:11px;font-weight:600;">${pin.urgency}</span>` : ''}
                ${categoryLabel ? `<span class="${catClass}" style="display:inline-block;padding:2px 8px;border-radius:20px;font-size:11px;font-weight:600;">${categoryLabel}</span>` : ''}
              </div>
              ${pin.location ? `<div style="font-size:11px;color:#6b7280;margin-bottom:5px;">📍 ${pin.location}</div>` : ''}
              ${metaLine ? `<div style="font-size:11px;color:#9ca3af;margin-bottom:6px;">${metaLine}</div>` : ''}
              ${verifiedLine}
              ${truncDesc ? `<p style="margin:0 0 8px 0;font-size:12px;color:#444;line-height:1.45;">${truncDesc}</p>` : ''}
              <div style="text-align:center;background:#3b82f6;color:white;border-radius:8px;padding:6px 0;font-size:12px;font-weight:600;cursor:pointer;">Click to read more</div>
            </div>
          `

          marker.bindTooltip(tooltipContent, {
            direction: 'top',
            offset: [0, -20],
            opacity: 1,
            className: 'custom-tooltip'
          })
        } else {
          marker.bindTooltip(pin.title, {
            direction: 'top',
            offset: [0, -20],
          })
        }

        markersRef.current[pin.id] = marker
      })
    }

    updatePins()
  }, [pins, onPinClick, mapReady])

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