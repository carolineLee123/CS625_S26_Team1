'use client';

import { useState } from 'react';
import { MapPin, ImagePlus, Navigation } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

type Category = 'Safety' | 'Event' | 'Note';
type Urgency = 'Non-urgent' | 'Warning' | 'Urgent';

const CATEGORIES: { label: Category; color: string; active: string }[] = [
  { label: 'Safety',  color: 'border-orange-300 text-orange-600', active: 'bg-orange-500 border-orange-500 text-white' },
  { label: 'Event',   color: 'border-teal-300 text-teal-600',     active: 'bg-teal-500 border-teal-500 text-white' },
  { label: 'Note',    color: 'border-gray-300 text-gray-600',     active: 'bg-gray-500 border-gray-500 text-white' },
];

const URGENCY_LEVELS: { label: Urgency; color: string; active: string }[] = [
  { label: 'Non-urgent', color: 'border-gray-300 text-gray-600',    active: 'bg-gray-500 border-gray-500 text-white' },
  { label: 'Warning',    color: 'border-yellow-300 text-yellow-600', active: 'bg-yellow-500 border-yellow-500 text-white' },
  { label: 'Urgent',     color: 'border-red-300 text-red-600',       active: 'bg-red-500 border-red-500 text-white' },
];

interface CreateReportModalProps {
  open: boolean;
  onClose: () => void;
}

export function CreateReportModal({ open, onClose }: CreateReportModalProps) {
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState<Category | null>(null);
  const [description, setDescription] = useState('');
  const [urgency, setUrgency] = useState<Urgency | null>(null);
  const [photos, setPhotos] = useState<File[]>([]);

  function handleUseCurrentLocation() {
    setLocation('Current Location');
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) setPhotos(Array.from(e.target.files));
  }

  function handlePreview() {
    // Preview/submit logic goes here
  }

  const canPreview = title.trim() && location.trim() && description.trim() && category;

  return (
    <Dialog open={open} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="text-base font-semibold">Create a Report</DialogTitle>
        </DialogHeader>

        <div className="px-6 pb-6 flex flex-col gap-4">
          {/* Report Title */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Report Title <span className="text-red-500">*</span></label>
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
            <label className="text-sm font-medium text-gray-700">Location <span className="text-red-500">*</span></label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleUseCurrentLocation}
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
            <label className="text-sm font-medium text-gray-700">Category <span className="text-red-500">*</span></label>
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
            <label className="text-sm font-medium text-gray-700">Description <span className="text-red-500">*</span></label>
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
              <label className="text-sm font-medium text-gray-700">Urgency Level <span className="text-red-500">*</span></label>
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
            <label className="text-sm font-medium text-gray-700">Add Photos <span className="text-xs font-normal text-gray-400">(optional)</span></label>
            <label className="flex items-center gap-2 w-fit cursor-pointer rounded-lg border border-dashed border-gray-300 px-4 py-2 text-sm text-gray-500 hover:border-blue-400 hover:text-blue-500 transition-colors">
              <ImagePlus size={16} />
              {photos.length > 0 ? `${photos.length} photo(s) selected` : 'Upload photos'}
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handlePhotoChange}
              />
            </label>
          </div>

          {/* Footer */}
          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={handlePreview}
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
