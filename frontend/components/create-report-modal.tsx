'use client';

import { useState, useEffect } from 'react';
import { MapPin, ImagePlus, Navigation, CheckCircle2, Hash, Heart, MessageCircle, Share2, Calendar, User, BadgeCheck } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { createReport, updateReport, type Report } from '@/lib/api';

type Category = 'Safety' | 'Event' | 'Note';
type Urgency = 'Non-urgent' | 'Warning' | 'Urgent';
type Step = 'form' | 'preview' | 'confirmed';
type Status = 'open' | 'in_progress' | 'resolved' | 'closed';

const STATUS_OPTIONS: { label: Status; display: string; color: string; active: string }[] = [
  { label: 'open', display: 'Active', color: 'border-gray-300 text-gray-600', active: 'bg-gray-100 text-gray-800 border-gray-300' },
  { label: 'in_progress', display: 'In Progress', color: 'border-blue-300 text-blue-600', active: 'bg-blue-100 text-blue-700 border-blue-300' },
  { label: 'resolved', display: 'Resolved', color: 'border-green-300 text-green-600', active: 'bg-green-100 text-green-700 border-green-300' },
  { label: 'closed', display: 'Closed', color: 'border-red-300 text-red-600', active: 'bg-red-100 text-red-700 border-red-300' },
];

const CATEGORIES: { label: Category; color: string; active: string }[] = [
  { label: 'Safety', color: 'tag-outline-safety',    active: 'tag-solid-safety' },
  { label: 'Event',  color: 'tag-outline-event',     active: 'tag-solid-event' },
  { label: 'Note',   color: 'tag-outline-note',      active: 'tag-solid-note' },
];

const URGENCY_LEVELS: { label: Urgency; color: string; active: string }[] = [
  { label: 'Non-urgent', color: 'tag-outline-nonurgent', active: 'tag-solid-nonurgent' },
  { label: 'Warning',    color: 'tag-outline-warning',   active: 'tag-solid-warning' },
  { label: 'Urgent',     color: 'tag-outline-urgent',    active: 'tag-solid-urgent' },
];

const TAG_COLORS = {
  urgent:    'tag-urgent',
  warning:   'tag-warning',
  nonurgent: 'tag-nonurgent',
  event:     'tag-event',
  note:      'tag-note',
};

const AVATAR_COLORS = {
  urgent:    'tag-urgent',
  warning:   'tag-warning',
  nonurgent: 'tag-nonurgent',
  event:     'tag-event',
  note:      'tag-note',
};

function getTagKey(category: Category | null, urgency: Urgency | null) {
  if (category === 'Event') return 'event';
  if (category === 'Note') return 'note';
  if (category === 'Safety') {
    if (urgency === 'Urgent') return 'urgent';
    if (urgency === 'Warning') return 'warning';
    return 'nonurgent';
  }
  return 'nonurgent';
}

function getInitials(text: string) {
  return text
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');
}

function getTagLabel(category: Category | null, urgency: Urgency | null) {
  if (category === 'Safety') return urgency ?? 'Safety';
  return category ?? '';
}

interface EditableReport {
  id: number;
  title: string;
  description: string;
  category: Report['category'];
  safety_level: Report['safety_level'];
  latitude: number;
  longitude: number;
  status: Report['status'];
}

interface CreateReportModalProps {
  open: boolean;
  onClose: () => void;
  onReportCreated?: () => void;
  onReportUpdated?: () => void;
  initialLatitude?: number;
  initialLongitude?: number;
  initialLocation?: string;
  onSearchLocation?: (query: string) => Promise<{ lat: number; lng: number; label: string } | null>;
  mode?: 'create' | 'edit';
  reportToEdit?: EditableReport | null;
}

export function CreateReportModal({ open, onClose, onReportCreated, onReportUpdated, initialLatitude, initialLongitude, initialLocation, onSearchLocation, mode = 'create', reportToEdit = null, }: CreateReportModalProps) {
  const [step, setStep] = useState<Step>('form');
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState<Category | null>(null);
  const [description, setDescription] = useState('');
  const [urgency, setUrgency] = useState<Urgency | null>(null);
  const [photos, setPhotos] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [clickedLat, setClickedLat] = useState<number | undefined>(initialLatitude);
  const [clickedLng, setClickedLng] = useState<number | undefined>(initialLongitude);
  const [searchedLocation, setSearchedLocation] = useState<{
    lat: number;
    lng: number;
    label: string;
  } | null>(null);
  const [status, setStatus] = useState<Status>('open');

  async function handleLocationSearch() {
    if (!location.trim() || !onSearchLocation) return;
  
    const result = await onSearchLocation(location);
  
    if (result) {
      setSearchedLocation(result);
      setClickedLat(result.lat);
      setClickedLng(result.lng);
      setLocation(result.label);
    }
  }

  function handleClose() {
    onClose();
    // reset after animation settles
    setTimeout(reset, 300);
  }

  function reset() {
    setStep('form');
    setTitle('');
    setLocation('');
    setCategory(null);
    setDescription('');
    setUrgency(null);
    setPhotos([]);
    setIsSubmitting(false);
    setClickedLat(undefined);
    setClickedLng(undefined);
    setSearchedLocation(null);
    setStatus('open');
  }

  useEffect(() => {
    if (open && initialLatitude && initialLongitude) {
      setClickedLat(initialLatitude);
      setClickedLng(initialLongitude);
      if (initialLocation) {
        setLocation(initialLocation);
      } else {
        setLocation(`${initialLatitude.toFixed(4)}, ${initialLongitude.toFixed(4)}`);
      }
    }
  }, [open, initialLatitude, initialLongitude, initialLocation]);

  useEffect(() => {
    if (open && reportToEdit && mode === 'edit') {
      setStep('form');
      setTitle(reportToEdit.title);
      setDescription(reportToEdit.description);
      setClickedLat(reportToEdit.latitude);
      setClickedLng(reportToEdit.longitude);
      setLocation(`${reportToEdit.latitude.toFixed(4)}, ${reportToEdit.longitude.toFixed(4)}`);
      setStatus(reportToEdit.status);
  
      if (reportToEdit.category === 'safety') {
        setCategory('Safety');
  
        if (reportToEdit.safety_level === 'critical') setUrgency('Urgent');
        else if (reportToEdit.safety_level === 'high') setUrgency('Warning');
        else setUrgency('Non-urgent');
      } else if (reportToEdit.category === 'event') {
        setCategory('Event');
        setUrgency(null);
      } else {
        setCategory('Note');
        setUrgency(null);
      }
    }
  }, [open, reportToEdit, mode]);

  useEffect(() => {
    if (!open) {
      reset();
    }
  }, [open]);

  async function handleSubmit() {
    if (!category) return;
  
    setIsSubmitting(true);
  
    try {
      if (mode === 'edit' && reportToEdit) {
        const savedReport = await updateReport(reportToEdit.id, {
          title,
          description,
          category,
          urgency: category === 'Safety' ? (urgency ?? undefined) : undefined,
          status,
        });
        
  
        if (savedReport) {
          setStep('confirmed');
          onReportUpdated?.();
        } else {
          alert('Failed to save report. Please try again.');
          setIsSubmitting(false);
        }
  
        return;
      }

      let latitude = clickedLat || 42.3601;
      let longitude = clickedLng || -71.0589;
  
      if (!clickedLat && !clickedLng && location === 'Current Location' && navigator.geolocation) {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });
        latitude = position.coords.latitude;
        longitude = position.coords.longitude;
      }
  
      const reportData = {
        title,
        location,
        category,
        description,
        urgency: category === 'Safety' ? (urgency ?? undefined) : undefined,
        latitude,
        longitude,
      };
  
      const savedReport = await createReport(reportData);
  
      if (savedReport) {
        setStep('confirmed');
        onReportCreated?.();
      } else {
        alert('Failed to save report. Please try again.');
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error('Error saving report:', error);
      alert('Failed to save report. Please try again.');
      setIsSubmitting(false);
    }
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) setPhotos(Array.from(e.target.files));
  }

  const canPreview = title.trim() && location.trim() && description.trim() && category &&
    (category !== 'Safety' || urgency !== null);

  const tagKey = getTagKey(category, urgency);

  // ── Create Report Form ──────────────────────────────────────────────────────────────────
  if (step === 'form') {
    return (
      <Dialog open={open} onOpenChange={(o) => { if (!o) handleClose(); }}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto p-0">
          <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="text-base font-semibold">
            {mode === 'edit' ? 'Edit Report' : 'Create a Report'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'edit'
              ? 'You can update the title, description, category, urgency, and status. Location and photos are locked.'
              : 'This is where you can share your observations with the community! Your report will be visible on the map and can help others stay informed and safe.'}
          </DialogDescription>
          </DialogHeader>

          <div className="px-6 pb-6 flex flex-col gap-4">
            {/* Report Title */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">
                Report Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Minor flooding in Men's 2nd floor bath"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* Status */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">
                Status <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2 flex-wrap">
                {STATUS_OPTIONS.map(({ label, display, color, active }) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => setStatus(label)}
                    className={cn(
                      'rounded-full border px-4 py-1.5 text-sm font-medium transition-all capitalize',
                      status === label ? active : cn('bg-white hover:bg-gray-50', color)
                    )}
                  >
                    {display}
                  </button>
                ))}
              </div>
            </div>

            {/* Category */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">
                Category <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2 flex-wrap">
                {CATEGORIES.map(({ label, color, active }) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => { setCategory(label); setUrgency(null); }}
                    className={cn(
                      'rounded-full border px-4 py-1.5 text-sm font-medium transition-all',
                      category === label ? active : cn('bg-white hover:bg-gray-50', color)
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                placeholder="What's happening? Please include relevant details like timing, affected areas, or any follow-up actions."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 resize-none"
              />
            </div>

            {/* Location */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">
                Location <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setLocation('Current Location')}
                  disabled={mode === 'edit'}
                  className={cn(
                    "flex items-center gap-1.5 shrink-0 rounded-lg border px-3 py-2 text-xs font-medium transition-colors",
                    mode === 'edit'
                      ? "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "border-blue-300 bg-blue-50 text-blue-600 hover:bg-blue-100"
                  )}
                >
                  <Navigation size={13} />
                  Current Location
                </button>
                <input
                  type="text"
                  placeholder="or enter an address"
                  value={location === 'Current Location' ? '' : location}
                  onChange={(e) => setLocation(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && mode !== 'edit') {
                      e.preventDefault();
                      handleLocationSearch();
                    }
                  }}
                  disabled={mode === 'edit'}
                  className={cn(
                    "flex-1 rounded-lg border px-3 py-2 text-sm outline-none",
                    mode === 'edit'
                      ? "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  )}
                />
              </div>
              <button
                type="button"
                onClick={handleLocationSearch}
                disabled={mode === 'edit' || !location.trim() || location === 'Current Location'}
                className={cn(
                  "shrink-0 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  mode === 'edit' || !location.trim() || location === 'Current Location'
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-blue-500 text-white hover:bg-blue-600"
                )}
              >
                Search
              </button>
              {location === 'Current Location' && (
                <span className="flex items-center gap-1 text-xs text-blue-500 mt-0.5">
                  <MapPin size={11} /> Using your current location
                </span>
              )}
              {clickedLat && clickedLng && location !== 'Current Location' && (
                <span className="flex items-center gap-1 text-xs text-green-600 mt-0.5">
                  <MapPin size={11} /> Location from map click: {clickedLat.toFixed(4)}, {clickedLng.toFixed(4)}
                </span>
              )}
            </div>

            {/* Urgency Level — only for Safety */}
            {category === 'Safety' && (
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">
                  Urgency Level <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2 flex-wrap">
                  {URGENCY_LEVELS.map(({ label, color, active }) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => setUrgency(label)}
                      className={cn(
                        'rounded-full border px-4 py-1.5 text-sm font-medium transition-all',
                        urgency === label ? active : cn('bg-white hover:bg-gray-50', color)
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Add Photos */}
            <label
              className={cn(
                "flex items-center gap-2 w-fit rounded-lg border border-dashed px-4 py-2 text-sm transition-colors",
                mode === 'edit'
                  ? "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "cursor-pointer border-gray-300 text-gray-500 hover:border-blue-400 hover:text-blue-500"
              )}
            >
              <ImagePlus size={16} />
              {photos.length > 0 ? `${photos.length} photo(s) selected` : 'Upload photos'}
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handlePhotoChange}
                disabled={mode === 'edit'}
              />
            </label>

            {/* Footer */}
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setStep('preview')}
                disabled={!canPreview}
                className={cn(
                  'rounded-lg px-5 py-2 text-sm font-semibold transition-all',
                  canPreview
                    ? 'bg-blue-500 text-white hover:bg-blue-600 active:scale-95'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                )}
              >
                Preview Post
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // ── Preview Overlay───────────────────────────────────────────────────────────────
  if (step === 'preview') {
    const today = new Date();
    const postedLabel = `Posted ${today.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;

    return (
      <Dialog open={open} onOpenChange={(o) => { if (!o) handleClose(); }}>
        
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto p-0">
          <DialogHeader className="px-6 pt-6 pb-0">
            <DialogTitle className="text-base font-semibold">Preview Report</DialogTitle>
          </DialogHeader>
          <DialogDescription className="px-6 pt-0 pb-0 text-sm text-muted-foreground">
            This is how your report will appear on the public map feed. You can edit before submitting.
          </DialogDescription>
          {/* Report card */}
          <div className="mx-5 mt-5 rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">
            <div className="px-5 py-5 flex flex-col gap-3">
              {/* Title */}
              <h2 className="text-lg font-bold text-gray-900 leading-snug">{title}</h2>

              {/* Tag pills */}
              <div className="flex flex-wrap gap-1.5">
                <span className="rounded-full px-3 py-0.5 text-xs font-semibold bg-green-100 text-green-700 border border-green-200">
                  Active
                </span>
                {urgency && urgency !== 'Non-urgent' && (
                  <span className={cn(
                    'rounded-full px-3 py-0.5 text-xs font-semibold',
                    urgency === 'Urgent' ? 'tag-urgent' : 'tag-warning'
                  )}>
                    {urgency}
                  </span>
                )}
                {category && (
                  <span className={cn(
                    'rounded-full px-3 py-0.5 text-xs font-semibold',
                    category === 'Safety' ? 'tag-safety' :
                    category === 'Note'   ? 'tag-note'   : 'tag-event'
                  )}>
                    {category}
                  </span>
                )}
              </div>

              {/* Metadata grid */}
              <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm">
                <div className="flex flex-col gap-0.5">
                  <span className="flex items-center gap-1 font-semibold text-gray-700 text-xs">
                    <MapPin size={12} /> Location
                  </span>
                  <span className="text-xs text-gray-500 leading-snug">{location}</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="flex items-center gap-1 font-semibold text-gray-700 text-xs">
                    <Calendar size={12} /> Date &amp; Time
                  </span>
                  <span className="text-xs text-gray-500">{postedLabel}</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="flex items-center gap-1 font-semibold text-gray-700 text-xs">
                    <User size={12} /> Reported by
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-gray-500">
                    <span className={cn('w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0', AVATAR_COLORS[tagKey])}>
                      Y
                    </span>
                    You
                  </span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="flex items-center gap-1 font-semibold text-gray-700 text-xs">
                    <BadgeCheck size={12} /> Verified by
                  </span>
                  <span className="text-xs text-gray-500">0 members</span>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-gray-700 leading-relaxed line-clamp-4">{description}</p>

              {/* Photo strip */}
              {photos.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {photos.map((f, i) => (
                    <img
                      key={i}
                      src={URL.createObjectURL(f)}
                      alt={`attachment ${i + 1}`}
                      className="h-20 w-20 object-cover rounded-lg border border-gray-200"
                    />
                  ))}
                </div>
              )}

              {/* Stats */}
              <div className="flex items-center gap-5 pt-1 border-t border-gray-100 text-xs text-gray-400">
                <span className="flex items-center gap-1"><Heart size={12} /> 0</span>
                <span className="flex items-center gap-1"><MessageCircle size={12} /> 0</span>
                <span className="flex items-center gap-1"><Hash size={12} />✓ 0</span>
                <span className="flex items-center gap-1 ml-auto"><Share2 size={12} /></span>
              </div>
            </div>
          </div>

          {/* Info banner */}
          <div className="mx-5 mt-3 rounded-lg bg-blue-50 border border-blue-100 px-4 py-2.5 text-xs text-blue-600">
            Once you are satisfied with how your report looks, click "Submit Report". You can always make updates to your report later.
          </div>

          {/* Footer */}
          <div className="flex justify-between items-center px-5 py-4">
            <button
              type="button"
              onClick={() => setStep('form')}
              className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 hover:bg-gray-50 active:scale-95 transition-all"
            >
              Keep Editing
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={cn(
                "rounded-lg px-5 py-2 text-sm font-semibold transition-all",
                isSubmitting
                  ? "bg-gray-400 text-white cursor-not-allowed"
                  : "bg-blue-500 text-white hover:bg-blue-600 active:scale-95"
              )}
            >
              {isSubmitting
              ? (mode === 'edit' ? 'Saving...' : 'Submitting...')
              : (mode === 'edit' ? 'Save Changes' : 'Submit Report')}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // ── Confirmation ──────────────────────────────────────────────────────────
  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) handleClose(); }}>
      <DialogContent className="sm:max-w-sm p-0">
        <DialogHeader className="sr-only">
          <DialogTitle>
            {mode === 'edit' ? 'Report Updated' : 'Report Submitted'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'edit'
              ? 'Your report changes have been saved successfully.'
              : 'Your report has been submitted successfully.'}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center text-center px-8 py-10 gap-4">
          <CheckCircle2 size={48} className="text-green-500" strokeWidth={1.5} />
          <div>
            <h2 className="text-base font-semibold text-gray-900 mb-1">
              {mode === 'edit' ? 'Report Updated!' : 'Report Submitted!'}
            </h2>
            <p className="text-sm text-gray-500">
              {mode === 'edit'
                ? 'Your changes have been saved and the updated report is now reflected on the map.'
                : 'Your report has been received and is now pinned on the live map for the community to see.'}
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="mt-2 rounded-lg px-6 py-2 text-sm font-semibold bg-blue-500 text-white hover:bg-blue-600 active:scale-95 transition-all"
          >
            Done
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
