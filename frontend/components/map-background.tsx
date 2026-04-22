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
  location?: string
  status?: string
  createdAt?: string
  verifiedCount?: number
  likes?: number
  comments?: number
  shares?: number
  username?: string
}

interface MapBackgroundProps {
  pins?: MapPin[]
  onPinClick?: (pinId: string) => void
  onReadMore?: (pinId: string) => void
  selectedPinId?: string
  onMapReady?: (map: any) => void
  onMapClick?: (lat: number, lng: number) => void
}

export function MapBackground({
  pins = [],
  onPinClick,
  onReadMore,
  selectedPinId,
  onMapReady,
  onMapClick,
}: MapBackgroundProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<any>(null)
  const markersRef = useRef<{ [key: string]: any }>({})
  const bridgesRef = useRef<{ [key: string]: HTMLDivElement }>({})
  const [mapReady, setMapReady] = useState(false)
  const selectedPinIdRef = useRef<string | null>(null)
  const onReadMoreRef = useRef(onReadMore)
  const onPinClickRef = useRef(onPinClick)

  useEffect(() => { onReadMoreRef.current = onReadMore }, [onReadMore])
  useEffect(() => { onPinClickRef.current = onPinClick }, [onPinClick])

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

      if (onMapClick) {
        map.current.on('click', (e: any) => {
          onMapClick(e.latlng.lat, e.latlng.lng)
        })
      }

      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
        iconUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
        shadowUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
      })

      setMapReady(true)
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
  }, [onMapReady, onMapClick])

  useEffect(() => {
    const updatePins = async () => {
      if (!map.current || !mapReady) return

      const L = (await import("leaflet")).default

      Object.values(markersRef.current).forEach((marker) => {
        map.current?.removeLayer(marker)
      })
      markersRef.current = {}
      bridgesRef.current = {}

      pins.forEach((pin) => {
        const html = `
          <div class="map-pin map-pin-${pin.id}" style="background:${pin.color};">
            !
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
            onPinClickRef.current?.(pin.id)
          })

        // Build rich tooltip HTML
        let tooltipContent = pin.title
        let isRich = false

        if (pin.description || pin.category || pin.safetyLevel) {
          isRich = true

          const isSafety = pin.category === 'safety' || !pin.category
          const urgencyLabel = !isSafety ? null
          : pin.safetyLevel === 'critical' ? 'Urgent'
          : pin.safetyLevel === 'high' ? 'Warning'
          : 'Non-urgent'
          const urgencyClass = urgencyLabel === 'Urgent' ? 'tag-urgent'
            : urgencyLabel === 'Warning' ? 'tag-warning'
            : 'tag-nonurgent'

          const categoryClassMap: Record<string, string> = {
            safety: 'tag-safety', event: 'tag-event', note: 'tag-note',
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
            const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
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

          /* Card contents */
          tooltipContent = `
            <div class="tp-card">
              <h3 class="tp-title">${pin.title}</h3>
              <div class="tp-tags">
                ${urgencyLabel ? `<span class="tp-tag ${urgencyClass}">${urgencyLabel}</span>` : ''}
                ${categoryLabel ? `<span class="tp-tag ${catClass}">${categoryLabel}</span>` : ''}
              </div>
              ${pin.location ? `<div class="tp-location">${pin.location}</div>` : ''}
              ${statusDateLine ? `<div class="tp-meta">${statusDateLine}</div>` : ''}
              ${verifiedLine}
              ${truncDesc ? `<p class="tp-desc">${truncDesc}</p>` : ''}
              <div class="tp-cta">Click to read more</div>
            </div>
          `
        }

        // Bind as permanent so the tooltip element always lives in the DOM.
        // Visibility is controlled by the tp-hidden CSS class rather than
        // Leaflet's built-in mouseover/mouseout lifecycle, which lets us keep
        // the card open while the cursor moves between the pin and the card.
        marker.bindTooltip(tooltipContent, {
          direction: 'top',
          offset: [0, -20],
          opacity: 1,
          ...(isRich ? { className: 'custom-tooltip tp-hidden' } : { className: 'tp-hidden' }),
          permanent: true,
        })

        // Invisible bridge child div: extends upward from the marker element to
        // cover the gap between the pin circle and the hover preview tooltip card. Since it is
        // a child of the marker element, the browser never fires mouseleave on the
        // marker while the cursor is crossing that gap.
        const markerEl = marker.getElement() as HTMLElement | undefined
        const bridge = document.createElement('div')
        bridge.style.cssText =
          'position:absolute;bottom:0;left:50%;transform:translateX(-50%);' +
          'width:310px;height:270px;background:transparent;pointer-events:none;'
        if (markerEl) {
          markerEl.style.overflow = 'visible'
          markerEl.appendChild(bridge)
        }
        bridgesRef.current[pin.id] = bridge

        const tooltipEl = marker.getTooltip()?.getElement() as HTMLElement | undefined

        if (markerEl && tooltipEl) {
          tooltipEl.style.pointerEvents = 'none'
          tooltipEl.style.cursor = 'pointer'
          tooltipEl.onclick = (e) => { e.stopPropagation(); onPinClickRef.current?.(pin.id) }

          const showTooltip = () => {
            if (selectedPinIdRef.current === pin.id) return
            tooltipEl.classList.remove('tp-hidden')
            tooltipEl.style.pointerEvents = 'auto'
            bridge.style.pointerEvents = 'auto'
          }

          const hideTooltip = () => {
            if (selectedPinIdRef.current === pin.id) return
            tooltipEl.classList.add('tp-hidden')
            tooltipEl.style.pointerEvents = 'none'
            bridge.style.pointerEvents = 'none'
          }

          markerEl.addEventListener('mouseenter', showTooltip)
          markerEl.addEventListener('mouseleave', (e: MouseEvent) => {
            if (tooltipEl.contains(e.relatedTarget as Node | null)) return
            hideTooltip()
          })
          tooltipEl.addEventListener('mouseleave', (e: MouseEvent) => {
            if (markerEl.contains(e.relatedTarget as Node | null)) return
            hideTooltip()
          })
        }

        markersRef.current[pin.id] = marker
      })
    }

    updatePins()
  }, [pins, mapReady])

  // Manage selected pin: scale the pin circle and keep its tooltip permanently visible
  useEffect(() => {
    selectedPinIdRef.current = selectedPinId ?? null

    Object.entries(markersRef.current).forEach(([pinId, marker]) => {
      const isSelected = pinId === selectedPinId

      const pinEl = document.querySelector(`.map-pin-${pinId}`) as HTMLElement | null
      if (pinEl) {
        pinEl.style.transform = isSelected ? 'scale(1.3)' : 'scale(1)'
        pinEl.style.zIndex = isSelected ? '1000' : '999'
      }

      const tooltipEl = marker.getTooltip()?.getElement() as HTMLElement | undefined
      const bridge = bridgesRef.current[pinId]
      if (tooltipEl) {
        if (isSelected) {
          tooltipEl.classList.remove('tp-hidden')
          tooltipEl.style.pointerEvents = 'auto'
          tooltipEl.onclick = (e) => { e.stopPropagation(); onReadMoreRef.current?.(pinId) }
          if (bridge) bridge.style.pointerEvents = 'auto'
        } else {
          tooltipEl.classList.add('tp-hidden')
          tooltipEl.style.pointerEvents = 'none'
          tooltipEl.onclick = (e) => { e.stopPropagation(); onPinClickRef.current?.(pinId) }
          if (bridge) bridge.style.pointerEvents = 'none'
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
