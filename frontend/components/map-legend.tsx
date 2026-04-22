'use client';

import { Info } from 'lucide-react';
import { useState } from 'react';

export function MapLegend() {
  const [isExpanded, setIsExpanded] = useState(true);

  const legendItems = [
    { label: 'Critical', color: '#ef4444', description: 'Urgent safety issues' },
    { label: 'High Priority', color: '#eab308', description: 'Safety concerns' },
    { label: 'Event', color: '#14b8a6', description: 'Community events' },
    { label: 'Note', color: '#6b7280', description: 'General updates' },
  ];

  return (
    <div className="absolute bottom-24 right-6 bg-white rounded-lg shadow-lg border border-gray-200 z-[1000]">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 rounded-lg transition-colors"
      >
        <div className="flex items-center gap-2">
          <Info size={16} className="text-gray-600" />
          <span className="font-semibold text-sm text-gray-700">Map Legend</span>
        </div>
        <svg
          className={`w-4 h-4 text-gray-600 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isExpanded && (
        <div className="px-4 pb-3 space-y-2 border-t border-gray-100 pt-2">
          {legendItems.map((item) => (
            <div key={item.label} className="flex items-center gap-3">
              <div
                className="w-4 h-4 rounded-full shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-700">{item.label}</span>
                <span className="text-xs text-gray-500">{item.description}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
