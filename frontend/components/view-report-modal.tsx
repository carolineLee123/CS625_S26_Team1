'use client';

import { MapPin, Calendar, User, BadgeCheck, Heart, MessageCircle, Hash, Share2, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface ViewReportModalProps {
  open: boolean;
  onClose: () => void;
  report: {
    id: number;
    title: string;
    description: string;
    location: string;
    category: string;
    urgency?: string;
    username: string;
    avatar: string;
    timeAgo: string;
    likes: number;
    comments: number;
    shares: number;
    tagColor: 'urgent' | 'warning' | 'event' | 'note' | 'nonurgent';
  } | null;
}

const TAG_COLORS = {
  urgent:    'bg-red-100 text-red-700 border-red-200',
  warning:   'bg-orange-100 text-orange-700 border-orange-200',
  nonurgent: 'bg-gray-100 text-gray-700 border-gray-200',
  event:     'bg-teal-100 text-teal-700 border-teal-200',
  note:      'bg-purple-100 text-purple-700 border-purple-200',
};

const AVATAR_COLORS = {
  urgent:    'bg-red-100 text-red-700 border border-red-300',
  warning:   'bg-orange-100 text-orange-700 border border-orange-300',
  nonurgent: 'bg-gray-100 text-gray-700 border border-gray-300',
  event:     'bg-teal-100 text-teal-700 border border-teal-300',
  note:      'bg-purple-100 text-purple-700 border border-purple-300',
};

export function ViewReportModal({ open, onClose, report }: ViewReportModalProps) {
  if (!report) return null;

  const today = new Date();
  const postedLabel = `Posted ${today.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="text-base font-semibold">Report Details</DialogTitle>
        </DialogHeader>

        {/* Report card */}
        <div className="mx-5 mt-3 rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">
          <div className="px-5 py-5 flex flex-col gap-3">
            {/* Title */}
            <h2 className="text-lg font-bold text-gray-900 leading-snug">{report.title}</h2>

            {/* Tag pills */}
            <div className="flex flex-wrap gap-1.5">
              <span className="rounded-full px-3 py-0.5 text-xs font-semibold bg-green-100 text-green-700 border border-green-200">
                Active
              </span>
              {report.urgency && report.urgency !== 'Non-urgent' && (
                <span className={cn(
                  'rounded-full px-3 py-0.5 text-xs font-semibold border',
                  report.urgency === 'Urgent'
                    ? 'bg-red-100 text-red-700 border-red-200'
                    : 'bg-yellow-100 text-yellow-700 border-yellow-200'
                )}>
                  {report.urgency}
                </span>
              )}
              <span className={cn(
                'rounded-full px-3 py-0.5 text-xs font-semibold border',
                TAG_COLORS[report.tagColor]
              )}>
                {report.category}
              </span>
            </div>

            {/* Metadata grid */}
            <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm">
              <div className="flex flex-col gap-0.5">
                <span className="flex items-center gap-1 font-semibold text-gray-700 text-xs">
                  <MapPin size={12} /> Location
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
                  <span className={cn('w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0', AVATAR_COLORS[report.tagColor])}>
                    {report.avatar}
                  </span>
                  {report.username}
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
            <p className="text-sm text-gray-700 leading-relaxed">{report.description}</p>

            {/* Stats */}
            <div className="flex items-center gap-5 pt-1 border-t border-gray-100 text-xs text-gray-400">
              <span className="flex items-center gap-1"><Heart size={12} /> {report.likes}</span>
              <span className="flex items-center gap-1"><MessageCircle size={12} /> {report.comments}</span>
              <span className="flex items-center gap-1"><Hash size={12} />✓ 0</span>
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
