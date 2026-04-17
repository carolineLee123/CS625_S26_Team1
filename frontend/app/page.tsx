'use client';

import dynamic from "next/dynamic"

const MapBackground = dynamic(
  () => import("@/components/map-background").then((mod) => mod.MapBackground),
  { ssr: false }
)

import { useState, useCallback, useRef, useEffect } from 'react';
import L from 'leaflet';
import { Plus, User } from 'lucide-react';
import { type MapPin } from '@/components/map-background';
import { TrendingSidebar, type TrendingPost } from '@/components/trending-sidebar';
import { MapControls } from '@/components/map-controls';
import { fetchReports, type Report } from '@/lib/api';
import { CreateReportModal } from '@/components/create-report-modal';
import { ViewReportModal } from '@/components/view-report-modal';

// Helper functions to convert reports to UI format
function getSafetyColorFromLevel(safetyLevel: string): string {
  switch (safetyLevel) {
    case 'critical':
      return '#ef4444';
    case 'high':
      return '#ef4444';
    case 'medium':
      return '#f59e0b';
    case 'low':
      return '#14b8a6';
    default:
      return '#6b7280';
  }
}

function getTagFromSafetyLevel(safetyLevel: string): { tag: string; tagColor: 'urgent' | 'warning' | 'event' | 'note' | 'nonurgent' } {
  switch (safetyLevel) {
    case 'critical':
      return { tag: 'Urgent', tagColor: 'urgent' };
    case 'high':
      return { tag: 'Warning', tagColor: 'warning' };
    case 'medium':
      return { tag: 'Warning', tagColor: 'warning' };
    case 'low':
      return { tag: 'Note', tagColor: 'note' };
    default:
      return { tag: 'Non-urgent', tagColor: 'nonurgent' };
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
  const { tag, tagColor } = getTagFromSafetyLevel(report.safety_level);
  const initials = report.username.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);

  return {
    id: report.id,
    rank,
    username: report.description.split('.')[0] || 'Report',
    handle: report.username,
    avatar: initials,
    content: report.description,
    location: `${report.latitude.toFixed(4)}, ${report.longitude.toFixed(4)}`,
    likes: 0,
    comments: 0,
    shares: 0,
    tag,
    tagColor,
    timeAgo: getTimeAgo(report.created_at),
  };
}

function convertReportToPin(report: Report): MapPin {
  const { tag } = getTagFromSafetyLevel(report.safety_level);
  return {
    id: String(report.id),
    lat: report.latitude,
    lng: report.longitude,
    title: report.description.split('.')[0] || 'Report',
    color: getSafetyColorFromLevel(report.safety_level),
    number: report.id,
    description: report.description,
    category: report.category,
    safetyLevel: report.safety_level,
    urgency: tag,
    location: `${report.latitude.toFixed(4)}, ${report.longitude.toFixed(4)}`,
    status: report.status,
    createdAt: report.created_at,
    verifiedCount: 0,
  };
}

// Sample posts with map locations (fallback data)
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
    description: 'Active Winter Weather Warning for winter blizzard storm in the Amherst Area. Expected Temps 20-25 tonight.',
    category: 'safety',
    safetyLevel: 'critical',
    urgency: 'Urgent',
    location: 'Amherst, MA',
    status: 'open',
    createdAt: new Date().toISOString(),
    verifiedCount: 14,
  },
  {
    id: '2',
    lat: 42.374,
    lng: -72.525,
    title: 'Minor Flooding in Men\'s 2nd Floor Bath',
    color: '#f59e0b',
    number: 2,
    description: 'On the 2nd floor of the Men\'s restroom, there\'s some water I noticed. The people at the desk said they are aware.',
    category: 'safety',
    safetyLevel: 'medium',
    urgency: 'Warning',
    location: 'John W. Lodges Graduate Research Center',
    status: 'in_progress',
    createdAt: new Date().toISOString(),
    verifiedCount: 3,
  },
  {
    id: '3',
    lat: 42.375,
    lng: -72.527,
    title: 'Weekly Student Farmers Market',
    color: '#14b8a6',
    number: 3,
    description: 'A collaboration between UMass Permaculture and the UMass Student Farmers Market. Fresh seasonal produce available.',
    category: 'event',
    safetyLevel: 'low',
    urgency: 'Non-urgent',
    location: 'Student Union · 41 Campus Center Way',
    status: 'closed',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    verifiedCount: 6,
  },
  {
    id: '4',
    lat: 42.376,
    lng: -72.523,
    title: 'Campus Maintenance Notice',
    color: '#6b7280',
    number: 4,
    description: 'Scheduled maintenance on building systems. Campus security is monitoring the area.',
    category: 'safety',
    safetyLevel: 'low',
    urgency: 'Non-urgent',
    location: 'Central Campus, MA',
    status: 'open',
    createdAt: new Date().toISOString(),
    verifiedCount: 2,
  },
  {
    id: '5',
    lat: 42.372,
    lng: -72.522,
    title: 'Campus Event Reminder',
    color: '#14b8a6',
    number: 5,
    description: 'Community gathering in the central plaza this weekend. Open to all students and staff.',
    category: 'event',
    safetyLevel: 'low',
    urgency: 'Non-urgent',
    location: 'Downtown Amherst, MA',
    status: 'open',
    createdAt: new Date().toISOString(),
    verifiedCount: 0,
  },
  {
    id: '6',
    lat: 42.373,
    lng: -72.528,
    title: 'Farmers Market Update',
    color: '#f59e0b',
    number: 6,
    description: 'Fresh seasonal produce available this week. Support local farming and community.',
    category: 'event',
    safetyLevel: 'low',
    urgency: 'Non-urgent',
    location: 'Market Square, MA',
    status: 'open',
    createdAt: new Date().toISOString(),
    verifiedCount: 1,
  },
];

export default function Page() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activePost, setActivePost] = useState<string | null>('1');
  const [createOpen, setCreateOpen] = useState(false);
  const mapRef = useRef<L.Map | null>(null);
  const [posts, setPosts] = useState<TrendingPost[]>(POSTS);
  const [pins, setPins] = useState<MapPin[]>(mapPins);
  const [loading, setLoading] = useState(true);
  const [clickedCoords, setClickedCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [viewReportOpen, setViewReportOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<TrendingPost | null>(null);

  const loadReports = useCallback(async () => {
    console.log('Starting to load reports from API...');
    setLoading(true);
    const reports = await fetchReports();
    console.log('Fetched reports:', reports);
    console.log('Number of reports:', reports.length);

    if (reports.length > 0) {
      const convertedPosts = reports.map((report, index) => convertReportToPost(report, index + 1));
      const convertedPins = reports.map(report => convertReportToPin(report));

      console.log('Converted pins:', convertedPins);
      setPosts(convertedPosts);
      setPins(convertedPins);

      if (convertedPosts.length > 0) {
        setActivePost(String(convertedPosts[0].id));
      }
    } else {
      console.log('No reports found, using fallback data');
      setPosts(POSTS);
      setPins(mapPins);
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

    // Find the post and open the view modal
    const post = posts.find(p => p.id === id);
    if (post) {
      setSelectedReport(post);
      setViewReportOpen(true);
    }
  }, [pins, posts]);

  const handlePinClick = useCallback((pinId: string) => {
    setActivePost(pinId);

    // Center map on the clicked pin
    const pin = pins.find(p => p.id === pinId);
    if (pin && mapRef.current) {
      mapRef.current.setView([pin.lat, pin.lng], 16, {
        animate: true,
        duration: 0.5
      });
    }

    // Find the post and open the view modal
    const post = posts.find(p => p.id === parseInt(pinId));
    if (post) {
      setSelectedReport(post);
      setViewReportOpen(true);
    }
  }, [pins, posts]);

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
    if (mapRef.current) mapRef.current.setView([42.3757, -72.5199], 15);
  }, []);

  const handleMapClick = useCallback((lat: number, lng: number) => {
    setClickedCoords({ lat, lng });
    setCreateOpen(true);
  }, []);

  const handleCreateClose = useCallback(() => {
    setCreateOpen(false);
    setClickedCoords(null);
  }, []);

  return (
    <main
      className="relative w-screen h-screen overflow-hidden bg-background"
      aria-label="GeoFeed map interface"
    >
      {/* Map layer */}
      <MapBackground
        pins={pins}
        onPinClick={handlePinClick}
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
        onClose={() => setViewReportOpen(false)}
        report={selectedReport ? {
          id: selectedReport.id,
          title: selectedReport.username,
          description: selectedReport.content,
          location: selectedReport.location,
          category: selectedReport.tag,
          urgency: selectedReport.tag === 'Urgent' || selectedReport.tag === 'Warning' ? selectedReport.tag : undefined,
          username: selectedReport.handle,
          avatar: selectedReport.avatar,
          timeAgo: selectedReport.timeAgo,
          likes: selectedReport.likes,
          comments: selectedReport.comments,
          shares: selectedReport.shares,
          tagColor: selectedReport.tagColor,
        } : null}
      />
    </main>
  );
}
