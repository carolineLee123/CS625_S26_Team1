'use client';

import { MapPin as MapPinIcon, Calendar, User, BadgeCheck, Heart, MessageCircle, Hash, Share2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { type MapPin } from '@/components/map-background';
import { getCategoryTag, getUrgencyTag } from '@/lib/tags';

interface ViewReportModalProps {
  open: boolean;
  onClose: () => void;
  report: MapPin | null;
  canEdit?: boolean;
  onEdit?: () => void;
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

export function ViewReportModal({ open, onClose, report, canEdit = false, onEdit }: ViewReportModalProps) {
  if (!report) return null;

  const urgencyTag = getUrgencyTag(report.category, report.safetyLevel);
  const categoryTag = getCategoryTag(report.category);
  const postedLabel = report.createdAt
    ? `Posted ${new Date(report.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
    : getTimeAgo(report.createdAt);

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto p-0 rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">
        <DialogHeader className="px-6 pt-6 pb-2">
          {/* Title */}
          <DialogTitle className="text-2xl font-semibold">{report.title}</DialogTitle>
          {/* Report card — mirrors the create-report preview style */}
            <div className=" py-2 flex flex-col gap-3">
            {/* Tag pills */}
            <div className="flex flex-wrap gap-1.5">
              {report.status && (
                <span className={cn(
                  'rounded-full px-3 py-0.5 text-sm font-semibold',
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
              {urgencyTag && (
                <span className={cn('rounded-full px-3 py-0.5 text-sm font-semibold', urgencyTag.cssClass)}>
                  {urgencyTag.label}
                </span>
              )}
              <span className={cn('rounded-full px-3 py-0.5 text-sm font-semibold', categoryTag.cssClass)}>
                {categoryTag.label}
              </span>
            </div>

            {/* Metadata grid */}
            <div className="grid grid-cols-2 gap-y-3 gap-x-4">
              <div className="flex flex-col gap-0.5">
                <span className="flex items-center gap-1 font-semibold text-gray-700 text-sm">
                  <MapPinIcon size={12} /> Location
                </span>
                <span className="text-sm text-gray-500 leading-snug">{report.location}</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="flex items-center gap-1 font-semibold text-gray-700 text-sm">
                  <Calendar size={12} /> Date &amp; Time
                </span>
                <span className="text-sm text-gray-500">{postedLabel}</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="flex items-center gap-1 font-semibold text-gray-700 text-sm">
                  <User size={12} /> Reported by
                </span>
                <span className="flex items-center gap-1.5 text-sm text-gray-500">
                  <span className={cn('w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0', categoryTag.cssClass)}>
                    {getInitials(report.username)}
                  </span>
                  {report.username ?? 'Anonymous'}
                </span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="flex items-center gap-1 font-semibold text-gray-700 text-sm">
                  <BadgeCheck size={12} /> Verified by
                </span>
                <span className="text-sm text-gray-500">
                  {report.verifiedCount ?? 0} member{report.verifiedCount === 1 ? '' : 's'}
                </span>
              </div>
            </div>

            {/* Description */}
            <p className="text-sm text-gray-700 leading-relaxed">{report.description}</p>

            {/* Stats */}
            <div className="flex items-center gap-5 pt-1 border-t border-gray-100 text-sm text-gray-400">
              <span className="flex items-center gap-1"><Heart size={12} /> {report.likes ?? 0}</span>
              <span className="flex items-center gap-1"><MessageCircle size={12} /> {report.comments ?? 0}</span>
              <span className="flex items-center gap-1"><Hash size={12} />✓ {report.verifiedCount ?? 0}</span>
              <span className="flex items-center gap-1 ml-auto"><Share2 size={12} /> {report.shares ?? 0}</span>
            </div>
          </div>
          
        </DialogHeader>

        

        {/* Footer */}
        <div className="flex justify-end items-center gap-3 px-5 py-4">
          {canEdit && (
            <button
              type="button"
              onClick={onEdit}
              className="rounded-lg px-4 py-2 text-sm font-medium text-blue-600 border border-blue-200 hover:bg-blue-50 transition-all"
            >
              Edit Report
            </button>
          )}
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
