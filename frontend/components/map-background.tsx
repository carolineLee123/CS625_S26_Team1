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
  const tooltipDataRef = useRef<{ [key: string]: { content: string; rich: boolean } }>({})
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
          <div class="map-pin map-pin-${pin.id}" style="background:${pin.color};">
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

          const statusClass = pin.status === 'open' ? 'status-active' : 'status-inactive'
          const statusDateLine = (statusLabel || dateLabel)
            ? `<span class="${statusClass}">${statusLabel}</span>${dateLabel ? `<span class="status-inactive"> · ${dateLabel}</span>` : ''}`
            : ''
          const verifiedLine = typeof pin.verifiedCount === 'number'
            ? `<div class="tp-verified">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" stroke="#2563eb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                ${pin.verifiedCount > 5 ? `>5` : pin.verifiedCount} member${pin.verifiedCount === 1 ? '' : 's'} verified this report
              </div>`
            : ''

          const truncDesc = pin.description
            ? pin.description.substring(0, 70) + (pin.description.length > 70 ? '…' : '')
            : ''

          const tooltipContent = `
            <div class="tp-card">
              <h3 class="tp-title">${pin.title}</h3>
              <div class="tp-tags">
                ${pin.urgency ? `<span class="tp-tag ${urgencyClass}">${pin.urgency}</span>` : ''}
                ${categoryLabel ? `<span class="tp-tag ${catClass}">${categoryLabel}</span>` : ''}
              </div>
              ${pin.location ? `<div class="tp-location">${pin.location}</div>` : ''}
              ${statusDateLine ? `<div class="tp-meta">${statusDateLine}</div>` : ''}
              ${verifiedLine}
              ${truncDesc ? `<p class="tp-desc">${truncDesc}</p>` : ''}
              <div class="tp-cta">Click to read more</div>
            </div>
          `

          marker.bindTooltip(tooltipContent, {
            direction: 'top',
            offset: [0, -20],
            opacity: 1,
            className: 'custom-tooltip'
          })
          tooltipDataRef.current[pin.id] = { content: tooltipContent, rich: true }
        } else {
          marker.bindTooltip(pin.title, {
            direction: 'top',
            offset: [0, -20],
          })
          tooltipDataRef.current[pin.id] = { content: pin.title, rich: false }
        }

        markersRef.current[pin.id] = marker
      })
    }

    updatePins()
  }, [pins, onPinClick, mapReady])

  useEffect(() => {
    Object.entries(markersRef.current).forEach(([pinId, marker]) => {
      const isPinned = pinId === selectedPinId
      const pinEl = document.querySelector(`.map-pin-${pinId}`) as HTMLElement | null
      if (pinEl) {
        pinEl.style.transform = isPinned ? "scale(1.3)" : "scale(1)"
        pinEl.style.zIndex = isPinned ? "1000" : "999"
      }

      // Disable hover events on the selected pin's marker so the permanent
      // card doesn't flicker and cursor-over-card doesn't retrigger it.
      const markerEl = marker.getElement() as HTMLElement | undefined
      if (markerEl) markerEl.style.pointerEvents = isPinned ? 'none' : 'auto'

      const data = tooltipDataRef.current[pinId]
      if (data) {
        marker.unbindTooltip()
        marker.bindTooltip(data.content, {
          direction: 'top',
          offset: [0, -20],
          opacity: 1,
          ...(data.rich ? { className: 'custom-tooltip' } : {}),
          permanent: isPinned,
        })
        if (isPinned) {
          marker.openTooltip()
          // Inline style beats Leaflet's stylesheet — card blocks mouse events
          // so pins underneath can't trigger hover tooltips
          const tooltipEl = marker.getTooltip()?.getElement() as HTMLElement | undefined
          if (tooltipEl) tooltipEl.style.pointerEvents = 'auto'
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