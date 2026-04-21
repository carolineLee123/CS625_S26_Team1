'use client';

import dynamic from "next/dynamic"

const MapBackground = dynamic(
  () => import("@/components/map-background").then((mod) => mod.MapBackground),
  { ssr: false }
)

import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import L from 'leaflet';
import { Plus, User } from 'lucide-react';
import { type MapPin } from '@/components/map-background';
import { TrendingSidebar, type TrendingPost } from '@/components/trending-sidebar';
import { MapControls } from '@/components/map-controls';
import { fetchReports, type Report } from '@/lib/api';
import { CreateReportModal } from '@/components/create-report-modal';
// import { SearchBar } from "@/components/search-bar"; -- needs to be repurposed, updates underway
import { ViewReportModal } from '@/components/view-report-modal';
import { getPrimaryTag } from '@/lib/tags';

function getSafetyColorFromLevel(category: string, safetyLevel: string): string {
  if (category === 'event') return '#14b8a6';
  if (category === 'note')  return '#6b7280';
  switch (safetyLevel) {
    case 'critical':
    case 'high':   return '#ef4444';
    case 'medium': return '#f59e0b';
    default:       return '#6b7280';
  }
}

function getTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  return `${diffDays}d`;
}

function convertReportToPost(report: Report, rank: number): TrendingPost {
  const { tag, tagColor } = getPrimaryTag(report.category, report.safety_level);
  const initials = report.username.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);

  return {
    id: report.id,
    rank,
    username: report.title,
    handle: report.username,
    avatar: initials,
    content: report.description,
    location: `${report.latitude.toFixed(4)}, ${report.longitude.toFixed(4)}`,
    likes: report.likes,
    comments: report.comments,
    shares: report.shares,
    tag,
    tagColor,
    timeAgo: getTimeAgo(report.created_at),
  };
}

function convertReportToPin(report: Report): MapPin {
  return {
    id: String(report.id),
    lat: report.latitude,
    lng: report.longitude,
    title: report.title,
    color: getSafetyColorFromLevel(report.category, report.safety_level),
    number: report.id,
    description: report.description,
    category: report.category,
    safetyLevel: report.safety_level,
    location: `${report.latitude.toFixed(4)}, ${report.longitude.toFixed(4)}`,
    status: report.status,
    createdAt: report.created_at,
    verifiedCount: report.verified_count,
    likes: report.likes,
    comments: report.comments,
    shares: report.shares,
    username: report.username,
  };
}


export default function Page() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activePost, setActivePost] = useState<string | null>('1');
  const [createOpen, setCreateOpen] = useState(false);
  const mapRef = useRef<L.Map | null>(null);
  const [pins, setPins] = useState<MapPin[]>([]);
  const [loading, setLoading] = useState(true);
  const [clickedCoords, setClickedCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [viewReportOpen, setViewReportOpen] = useState(false);
  const [selectedPin, setSelectedPin] = useState<MapPin | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [reportToEdit, setReportToEdit] = useState<Report | null>(null);

  const posts = useMemo<TrendingPost[]>(
    () => pins.map((pin, index) => convertReportToPost({
      id: Number(pin.id),
      title: pin.title,
      username: pin.username ?? '',
      description: pin.description ?? '',
      latitude: pin.lat,
      longitude: pin.lng,
      category: (pin.category ?? 'safety') as Report['category'],
      safety_level: (pin.safetyLevel ?? 'low') as Report['safety_level'],
      status: (pin.status ?? 'open') as Report['status'],
      likes: pin.likes ?? 0,
      comments: pin.comments ?? 0,
      shares: pin.shares ?? 0,
      verified_count: pin.verifiedCount ?? 0,
      created_at: pin.createdAt ?? new Date().toISOString(),
      updated_at: pin.createdAt ?? new Date().toISOString(),
    }, index + 1)),
    [pins]
  );

  const loadReports = useCallback(async () => {
    setLoading(true);
    const reports = await fetchReports();
    console.log(reports);

    const convertedPins = reports.map(report => convertReportToPin(report));
    setPins(convertedPins);

    if (convertedPins.length > 0) {
      setActivePost(String(convertedPins[0].id));
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  const handlePostClick = useCallback((id: number) => {
    setActivePost(String(id));

    // Find the pin with this ID and center map on it
    const pin = pins.find(p => p.id === String(id));
    if (pin && mapRef.current) {
      mapRef.current.setView([pin.lat, pin.lng], 16, {
        animate: true,
        duration: 0.5
      });
    }

  }, [pins, posts]);

  const handlePinClick = useCallback((pinId: string) => {
    setActivePost(pinId);

    const pin = pins.find(p => p.id === pinId);
    if (pin) {
      if (mapRef.current) {
        mapRef.current.setView([pin.lat, pin.lng], 16, { animate: true, duration: 0.5 });
      }
      setSelectedPin(pin);
      setViewReportOpen(true);
    }
  }, [pins]);

  const handleReadMore = useCallback((pinId: string) => {
    const pin = pins.find(p => p.id === pinId);
    if (pin) {
      setSelectedPin(pin);
      setViewReportOpen(true);
    }
  }, [pins]);

  const handleMapReady = useCallback((map: L.Map) => {
    mapRef.current = map;
  }, []);

  const handleZoomIn = useCallback(() => {
    if (mapRef.current) mapRef.current.zoomIn();
  }, []);

  const handleZoomOut = useCallback(() => {
    if (mapRef.current) mapRef.current.zoomOut();
  }, []);

  const handleCenter = useCallback(() => {
    if (!mapRef.current) return;
  
    if (!navigator.geolocation) {
      console.error("Geolocation is not supported by this browser.");
      return;
    }
  
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        mapRef.current?.setView([latitude, longitude], 14);
      },
      (error) => {
        console.error("Unable to get current location:", error.message);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }, []);

  const handleSearchLocation = useCallback(async (query: string) => {
    if (!mapRef.current || !query.trim()) return null;
  
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`
      );
  
      if (!response.ok) {
        throw new Error("Search request failed");
      }
  
      const results = await response.json();
  
      if (!results.length) {
        console.error("No matching location found.");
        return null;
      }
  
      const lat = parseFloat(results[0].lat);
      const lng = parseFloat(results[0].lon);
      const label = results[0].display_name || query;
  
      mapRef.current.flyTo([lat, lng], 15);
  
      return { lat, lng, label };
    } catch (error) {
      console.error("Location search failed:", error);
      return null;
    }
  }, []);
  
  const handleSidebarSearch = useCallback(async (query: string) => {
    await handleSearchLocation(query);
  }, [handleSearchLocation]);

  
  const handleMapClick = useCallback((lat: number, lng: number) => {
    setClickedCoords({ lat, lng });
    setCreateOpen(true);
  }, []);

  const handleCreateClose = useCallback(() => {
    setCreateOpen(false);
    setClickedCoords(null);
  }, []);

  const currentUsername = 'testuser';

  const handleEditReport = useCallback(() => {
      if (!selectedPin) return;
    
      setViewReportOpen(false);
    
      setReportToEdit({
        id: Number(selectedPin.id),
        title: selectedPin.title,
        username: selectedPin.username ?? '',
        description: selectedPin.description ?? '',
        latitude: selectedPin.lat,
        longitude: selectedPin.lng,
        category: (selectedPin.category ?? 'safety') as Report['category'],
        safety_level: (selectedPin.safetyLevel ?? 'low') as Report['safety_level'],
        status: (selectedPin.status ?? 'open') as Report['status'],
        likes: selectedPin.likes ?? 0,
        comments: selectedPin.comments ?? 0,
        shares: selectedPin.shares ?? 0,
        verified_count: selectedPin.verifiedCount ?? 0,
        created_at: selectedPin.createdAt ?? new Date().toISOString(),
        updated_at: selectedPin.createdAt ?? new Date().toISOString(),
      });
    
      setEditOpen(true);
    }, [selectedPin]);

  return (
    <main
      className="relative w-screen h-screen overflow-hidden bg-background"
      aria-label="GeoFeed map interface"
    >
      {/* Map layer */}
      <MapBackground
        pins={pins}
        onPinClick={handlePinClick}
        onReadMore={handleReadMore}
        selectedPinId={activePost ?? undefined}
        onMapReady={handleMapReady}
        onMapClick={handleMapClick}
      />

      {/* Trending sidebar */}
      <TrendingSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activePost={activePost ? parseInt(activePost) : null}
        onPostClick={handlePostClick}
        posts={posts}
        onSearch={handleSidebarSearch}
      />

      {/* Map controls (bottom right) */}
      <MapControls
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onCenter={handleCenter}
      />

      {/* Floating (+) create report button */}
      <button
        onClick={() => setCreateOpen(true)}
        className="absolute bottom-6 right-4 z-30 w-14 h-14 rounded-full bg-blue-500 hover:bg-blue-600 active:scale-95 transition-all duration-150 flex items-center justify-center shadow-lg"
        aria-label="Create new report"
      >
        <Plus size={28} className="text-white" strokeWidth={2.5} />
      </button>

      {/* Create report modal */}
      <CreateReportModal
        open={createOpen}
        onClose={handleCreateClose}
        onReportCreated={loadReports}
        initialLatitude={clickedCoords?.lat}
        initialLongitude={clickedCoords?.lng}
        onSearchLocation={handleSearchLocation}
      />

      {/* User account button (top right) */}
      <button
        className="absolute top-4 right-4 z-30 w-10 h-10 rounded-full flex items-center justify-center shadow border border-gray-200 hover:bg-gray-100 active:scale-95 transition-all duration-150"
        style={{ background: "rgba(255, 255, 255, 0.9)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }}
        aria-label="User account"
      >
        <User size={20} className="text-gray-700" />
      </button>

      {/* View report modal */}
      <ViewReportModal
        open={viewReportOpen}
        onClose={() => { setViewReportOpen(false); setActivePost(null); }}
        report={selectedPin}
        canEdit={selectedPin?.username === currentUsername}
        onEdit={handleEditReport}
      />

      <CreateReportModal
        open={editOpen}
        onClose={() => {
          setEditOpen(false);
          setReportToEdit(null);
        }}
        onReportUpdated={async () => {
          await loadReports();
          setEditOpen(false);
          setReportToEdit(null);
        }}
        onSearchLocation={handleSearchLocation}
        mode="edit"
        reportToEdit={reportToEdit}
      />
    </main>
  );
}
