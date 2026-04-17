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
}

interface MapBackgroundProps {
  pins?: MapPin[]
  onPinClick?: (pinId: string) => void
  selectedPinId?: string
  onMapReady?: (map: any) => void
  onMapClick?: (lat: number, lng: number) => void
}

export function MapBackground({
  pins = [],
  onPinClick,
  selectedPinId,
  onMapReady,
  onMapClick,
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

      // Add click handler to map
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
  }, [onMapReady, onMapClick])

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
          const tooltipContent = `
            <div style="font-family: system-ui, -apple-system, sans-serif;">
              <strong style="display: block; margin-bottom: 4px; font-size: 13px;">${pin.title}</strong>
              ${pin.description ? `<p style="margin: 0 0 4px 0; font-size: 12px; color: #555;">${pin.description.substring(0, 100)}${pin.description.length > 100 ? '...' : ''}</p>` : ''}
              ${pin.category ? `<span style="display: inline-block; background: #f3f4f6; padding: 2px 6px; border-radius: 3px; font-size: 11px; margin-right: 4px;">${pin.category}</span>` : ''}
              ${pin.safetyLevel ? `<span style="display: inline-block; background: ${pin.color}; color: white; padding: 2px 6px; border-radius: 3px; font-size: 11px;">${pin.safetyLevel}</span>` : ''}
            </div>
          `

          marker.bindTooltip(tooltipContent, {
            direction: 'top',
            offset: [0, -20],
            opacity: 0.95,
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