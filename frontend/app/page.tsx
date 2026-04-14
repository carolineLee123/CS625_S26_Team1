'use client';

import { useState, useCallback, useRef } from 'react';
import L from 'leaflet';
import { MapBackground, type MapPin } from '@/components/map-background';
import { TrendingSidebar, type TrendingPost } from '@/components/trending-sidebar';
import { MapControls } from '@/components/map-controls';

// Sample posts with map locations
const POSTS: TrendingPost[] = [
  {
    id: 1,
    rank: 1,
    username: 'Winter Weather Alert',
    handle: 'Amherst, MA',
    avatar: 'WA',
    content: 'Active Winter Weather Warning for winter blizzard storm in the Amherst Area. Expected Temps 20-25 tonight.',
    location: 'Amherst, MA',
    likes: 14200,
    comments: 832,
    shares: 2100,
    tag: 'Urgent',
    tagColor: 'urgent' as const,
    timeAgo: '12m',
  },
  {
    id: 2,
    rank: 2,
    username: 'Minor Flooding in Men\'s 2nd Floor Bath',
    handle: 'John W. Lodges Graduate Research Center',
    avatar: 'MF',
    content: 'On the 2nd floor of the Men\'s restroom, there\'s some water I noticed. The people at the desk said they are aware.',
    location: 'Boston, MA',
    likes: 9870,
    comments: 1340,
    shares: 1600,
    tag: 'Warning',
    tagColor: 'warning' as const,
    timeAgo: '28m',
  },
  {
    id: 3,
    rank: 3,
    username: 'Weekly Student Farmers Market',
    handle: 'Student Union, Off-Campus Housing Way',
    avatar: 'SF',
    content: 'A vibrant farmers market between UMass market stalls. The UMass Student Farmers Market.',
    location: 'Amherst, MA',
    likes: 8450,
    comments: 560,
    shares: 3200,
    tag: 'Event',
    tagColor: 'event' as const,
    timeAgo: '45m',
  },
  {
    id: 4,
    rank: 4,
    username: 'Campus Maintenance Notice',
    handle: 'Amherst, MA',
    avatar: 'CM',
    content: 'Scheduled maintenance on building systems. Campus security is monitoring the area.',
    location: 'Central Campus, MA',
    likes: 7620,
    comments: 412,
    shares: 980,
    tag: 'Non-urgent',
    tagColor: 'nonurgent' as const,
    timeAgo: '1h',
  },
  {
    id: 5,
    rank: 5,
    username: 'Campus Event Reminder',
    handle: 'Downtown Amherst',
    avatar: 'CE',
    content: 'Community gathering in the central plaza this weekend. Open to all students and staff.',
    location: 'Downtown Amherst, MA',
    likes: 6100,
    comments: 290,
    shares: 750,
    tag: 'Note',
    tagColor: 'note' as const,
    timeAgo: '2h',
  },
  {
    id: 6,
    rank: 6,
    username: 'Farmers Market Update',
    handle: 'Market Square',
    avatar: 'FM',
    content: 'Fresh seasonal produce available this week. Support local farming and community.',
    location: 'Market Square, MA',
    likes: 5340,
    comments: 178,
    shares: 440,
    tag: 'Event',
    tagColor: 'event' as const,
    timeAgo: '3h',
  },
];

// Map pins with coordinates
const mapPins: MapPin[] = [
  {
    id: '1',
    lat: 42.3737,
    lng: -72.5224,
    title: 'Winter Weather Alert',
    color: '#ef4444',
    number: 1,
  },
  {
    id: '2',
    lat: 42.374,
    lng: -72.525,
    title: 'Minor Flooding',
    color: '#f59e0b',
    number: 2,
  },
  {
    id: '3',
    lat: 42.375,
    lng: -72.527,
    title: 'Farmers Market',
    color: '#14b8a6',
    number: 3,
  },
  {
    id: '4',
    lat: 42.376,
    lng: -72.523,
    title: 'Campus Safety',
    color: '#ef4444',
    number: 4,
  },
  {
    id: '5',
    lat: 42.372,
    lng: -72.522,
    title: 'Local Business',
    color: '#14b8a6',
    number: 5,
  },
  {
    id: '6',
    lat: 42.373,
    lng: -72.528,
    title: 'Market Square',
    color: '#f59e0b',
    number: 6,
  },
];

export default function Page() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activePost, setActivePost] = useState<string | null>('1');
  const mapRef = useRef<L.Map | null>(null);

  const handlePostClick = useCallback((id: number) => {
    setActivePost(String(id));
  }, []);

  const handlePinClick = useCallback((pinId: string) => {
    setActivePost(pinId);
  }, []);

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
    if (mapRef.current) mapRef.current.setView([42.3737, -72.5224], 14);
  }, []);

  return (
    <main
      className="relative w-screen h-screen overflow-hidden bg-background"
      aria-label="GeoFeed map interface"
    >
      {/* Map layer */}
      <MapBackground
        pins={mapPins}
        onPinClick={handlePinClick}
        selectedPinId={activePost}
        onMapReady={handleMapReady}
      />

      {/* Trending sidebar */}
      <TrendingSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activePost={activePost ? parseInt(activePost) : null}
        onPostClick={handlePostClick}
      />

      {/* Map controls (bottom right) */}
      <MapControls
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onCenter={handleCenter}
      />
    </main>
  );
}
