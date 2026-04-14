'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export interface MapPin {
  id: string;
  lat: number;
  lng: number;
  title: string;
  color: string;
  number: number;
}

interface MapBackgroundProps {
  pins?: MapPin[];
  onPinClick?: (pinId: string) => void;
  selectedPinId?: string;
  onMapReady?: (map: L.Map) => void;
}

export function MapBackground({
  pins = [],
  onPinClick,
  selectedPinId,
  onMapReady,
}: MapBackgroundProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [key: string]: L.Marker }>({});

  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialize map centered on the US
    map.current = L.map(mapContainer.current).setView([39.8283, -98.5795], 4);

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map.current);

    // Fix for default marker icons
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl:
        'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
      iconUrl:
        'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
      shadowUrl:
        'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    });

    onMapReady?.(map.current);

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [onMapReady]);

  // Update pins
  useEffect(() => {
    if (!map.current) return;

    // Clear old markers
    Object.values(markersRef.current).forEach((marker) => {
      map.current?.removeLayer(marker);
    });
    markersRef.current = {};

    // Add new markers
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
      `;

      const icon = L.divIcon({
        html,
        className: '',
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      });

      const marker = L.marker([pin.lat, pin.lng], { icon })
        .addTo(map.current!)
        .on('click', () => {
          onPinClick?.(pin.id);
        });

      markersRef.current[pin.id] = marker;
    });
  }, [pins, onPinClick]);

  // Highlight selected pin
  useEffect(() => {
    Object.entries(markersRef.current).forEach(([pinId]) => {
      const pinEl = document.querySelector(`.map-pin-${pinId}`) as HTMLElement;
      if (pinEl) {
        if (pinId === selectedPinId) {
          pinEl.style.transform = 'scale(1.3)';
          pinEl.style.zIndex = '1000';
        } else {
          pinEl.style.transform = 'scale(1)';
          pinEl.style.zIndex = '999';
        }
      }
    });
  }, [selectedPinId]);

  return (
    <div
      ref={mapContainer}
      className="absolute inset-0 w-full h-full bg-slate-100"
      style={{ zIndex: 0 }}
    />
  );
}
