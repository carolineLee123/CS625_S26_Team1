'use client';

import { useState } from 'react';
import { MapPin, ImagePlus, Navigation, CheckCircle2, Hash, Heart, MessageCircle, Share2, Calendar, User, BadgeCheck } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

type Category = 'Safety' | 'Event' | 'Note';
type Urgency = 'Non-urgent' | 'Warning' | 'Urgent';
type Step = 'form' | 'preview' | 'confirmed';

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

interface CreateReportModalProps {
  open: boolean;
  onClose: () => void;
}

export function CreateReportModal({ open, onClose }: CreateReportModalProps) {
  const [step, setStep] = useState<Step>('form');
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState<Category | null>(null);
  const [description, setDescription] = useState('');
  const [urgency, setUrgency] = useState<Urgency | null>(null);
  const [photos, setPhotos] = useState<File[]>([]);

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
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto p-0">
          <DialogHeader className="px-6 pt-6 pb-2">
            <DialogTitle className="text-base font-semibold">Create a Report</DialogTitle>
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

            {/* Location */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">
                Location <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setLocation('Current Location')}
                  className="flex items-center gap-1.5 shrink-0 rounded-lg border border-blue-300 bg-blue-50 px-3 py-2 text-xs font-medium text-blue-600 hover:bg-blue-100 transition-colors"
                >
                  <Navigation size={13} />
                  Current Location
                </button>
                <input
                  type="text"
                  placeholder="or enter an address"
                  value={location === 'Current Location' ? '' : location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                />
              </div>
              {location === 'Current Location' && (
                <span className="flex items-center gap-1 text-xs text-blue-500 mt-0.5">
                  <MapPin size={11} /> Using your current location
                </span>
              )}
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
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">
                Add Photos <span className="text-xs font-normal text-gray-400">(optional)</span>
              </label>
              <label className="flex items-center gap-2 w-fit cursor-pointer rounded-lg border border-dashed border-gray-300 px-4 py-2 text-sm text-gray-500 hover:border-blue-400 hover:text-blue-500 transition-colors">
                <ImagePlus size={16} />
                {photos.length > 0 ? `${photos.length} photo(s) selected` : 'Upload photos'}
                <input type="file" accept="image/*" multiple className="hidden" onChange={handlePhotoChange} />
              </label>
            </div>

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
        
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto p-0">
          <DialogHeader className="px-6 pt-6 pb-2">
            <DialogTitle className="text-base font-semibold">Preview Report</DialogTitle>
          </DialogHeader>
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
            This is how your report will appear on the public map feed. You can edit before submitting.
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
              onClick={() => setStep('confirmed')}
              className="rounded-lg px-5 py-2 text-sm font-semibold bg-blue-500 text-white hover:bg-blue-600 active:scale-95 transition-all"
            >
              Submit Report
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
        <div className="flex flex-col items-center text-center px-8 py-10 gap-4">
          <CheckCircle2 size={48} className="text-green-500" strokeWidth={1.5} />
          <div>
            <h2 className="text-base font-semibold text-gray-900 mb-1">Report Submitted!</h2>
            <p className="text-sm text-gray-500">
              Your report has been received and is now pinned on the live map for the community to see.
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
