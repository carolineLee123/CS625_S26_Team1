export type TagColor = 'urgent' | 'warning' | 'nonurgent' | 'safety' | 'note' | 'event' | 'weather';

export interface TagInfo {
  label: string;
  cssClass: string;
  color: TagColor;
}

export function getCategoryTag(category?: string): TagInfo {
  switch (category?.toLowerCase()) {
    case 'safety':  return { label: 'Safety',  cssClass: 'tag-safety',  color: 'safety' };
    case 'event':   return { label: 'Event',   cssClass: 'tag-event',   color: 'event' };
    case 'weather': return { label: 'Weather', cssClass: 'tag-weather', color: 'weather' };
    default:        return { label: 'Note',    cssClass: 'tag-note',    color: 'note' };
  }
}

// Only meaningful for safety reports — returns null for event/note
export function getUrgencyTag(category?: string, safetyLevel?: string): TagInfo | null {
  if (category?.toLowerCase() !== 'safety') return null;

  switch (safetyLevel) {
    case 'critical':
      return { label: 'Urgent', cssClass: 'tag-urgent', color: 'urgent' };
    case 'high':
      return { label: 'Warning', cssClass: 'tag-warning', color: 'warning' };
    default:
      return { label: 'Non-urgent', cssClass: 'tag-nonurgent', color: 'nonurgent' };
  }
}

// Single most-prominent tag for sidebar cards and avatar colouring
export function getPrimaryTag(category?: string, safetyLevel?: string): { tag: string; tagColor: TagColor } {
  const urgency = getUrgencyTag(category, safetyLevel);
  if (urgency) return { tag: urgency.label, tagColor: urgency.color };
  const cat = getCategoryTag(category);
  return { tag: cat.label, tagColor: cat.color };
}
