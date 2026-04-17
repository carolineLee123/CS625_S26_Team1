'use client';

import { MapPin as MapPinIcon, Calendar, User, BadgeCheck, Heart, MessageCircle, Hash, Share2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { type MapPin } from '@/components/map-background';

interface ViewReportModalProps {
  open: boolean;
  onClose: () => void;
  report: MapPin | null;
}

function getUrgencyLabel(safetyLevel?: string): string | null {
  if (safetyLevel === 'critical' || safetyLevel === 'high') return 'Urgent';
  if (safetyLevel === 'medium') return 'Warning';
  if (safetyLevel === 'low') return 'Note';
  return null;
}

function getUrgencyClass(label: string | null): string {
  if (label === 'Urgent') return 'tag-urgent';
  if (label === 'Warning') return 'tag-warning';
  return 'tag-nonurgent';
}

function getCategoryClass(category?: string): string {
  const map: Record<string, string> = {
    safety: 'tag-safety', event: 'tag-event', note: 'tag-note', weather: 'tag-weather',
  };
  return category ? (map[category.toLowerCase()] ?? 'tag-note') : 'tag-note';
}

function getTimeAgo(dateString?: string): string {
  if (!dateString) return '';
  const diffMs = Date.now() - new Date(dateString).getTime();
  const mins = Math.floor(diffMs / 60000);
  const hours = Math.floor(diffMs / 3600000);
  const days = Math.floor(diffMs / 86400000);
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

function getInitials(name?: string): string {
  if (!name) return '?';
  return name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('');
}

export function ViewReportModal({ open, onClose, report }: ViewReportModalProps) {
  if (!report) return null;

  const urgencyLabel = getUrgencyLabel(report.safetyLevel);
  const urgencyClass = getUrgencyClass(urgencyLabel);
  const categoryClass = getCategoryClass(report.category);
  const categoryLabel = report.category
    ? report.category.charAt(0).toUpperCase() + report.category.slice(1)
    : '';
  const postedLabel = report.createdAt
    ? `Posted ${new Date(report.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
    : getTimeAgo(report.createdAt);

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="text-base font-semibold">Report Details</DialogTitle>
        </DialogHeader>

        {/* Report card — mirrors the create-report preview style */}
        <div className="mx-5 mt-3 rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">
          <div className="px-5 py-5 flex flex-col gap-3">
            {/* Title */}
            <h2 className="text-lg font-bold text-gray-900 leading-snug">{report.title}</h2>

            {/* Tag pills */}
            <div className="flex flex-wrap gap-1.5">
              {report.status && (
                <span className={cn(
                  'rounded-full px-3 py-0.5 text-xs font-semibold',
                  report.status === 'open' ? 'bg-green-100 text-green-700 border border-green-200'
                  : report.status === 'in_progress' ? 'bg-blue-100 text-blue-700 border border-blue-200'
                  : 'bg-gray-100 text-gray-500 border border-gray-200'
                )}>
                  {report.status === 'open' ? 'Active'
                    : report.status === 'in_progress' ? 'In Progress'
                    : report.status === 'resolved' ? 'Resolved'
                    : 'Inactive'}
                </span>
              )}
              {urgencyLabel && (
                <span className={cn('rounded-full px-3 py-0.5 text-xs font-semibold', urgencyClass)}>
                  {urgencyLabel}
                </span>
              )}
              {categoryLabel && (
                <span className={cn('rounded-full px-3 py-0.5 text-xs font-semibold', categoryClass)}>
                  {categoryLabel}
                </span>
              )}
            </div>

            {/* Metadata grid */}
            <div className="grid grid-cols-2 gap-y-3 gap-x-4">
              <div className="flex flex-col gap-0.5">
                <span className="flex items-center gap-1 font-semibold text-gray-700 text-xs">
                  <MapPinIcon size={12} /> Location
                </span>
                <span className="text-xs text-gray-500 leading-snug">{report.location}</span>
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
                  <span className={cn('w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0', categoryClass)}>
                    {getInitials(report.username)}
                  </span>
                  {report.username ?? 'Anonymous'}
                </span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="flex items-center gap-1 font-semibold text-gray-700 text-xs">
                  <BadgeCheck size={12} /> Verified by
                </span>
                <span className="text-xs text-gray-500">
                  {report.verifiedCount ?? 0} member{report.verifiedCount === 1 ? '' : 's'}
                </span>
              </div>
            </div>

            {/* Description */}
            <p className="text-sm text-gray-700 leading-relaxed">{report.description}</p>

            {/* Stats */}
            <div className="flex items-center gap-5 pt-1 border-t border-gray-100 text-xs text-gray-400">
              <span className="flex items-center gap-1"><Heart size={12} /> 0</span>
              <span className="flex items-center gap-1"><MessageCircle size={12} /> 0</span>
              <span className="flex items-center gap-1"><Hash size={12} />✓ {report.verifiedCount ?? 0}</span>
              <span className="flex items-center gap-1 ml-auto"><Share2 size={12} /></span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-5 py-2 text-sm font-semibold bg-blue-500 text-white hover:bg-blue-600 active:scale-95 transition-all"
          >
            Close
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
