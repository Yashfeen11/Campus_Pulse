'use client';

import React, { useState } from 'react';
import {
  Calendar, Clock, MapPin, Trash2, RotateCw, RotateCcw,
  GraduationCap, Briefcase, Palette, Trophy, Cpu, Bell, AlertOctagon, CalendarPlus,
} from 'lucide-react';
import { NoticeCategory, NoticeItem } from '@/types/notice';
import { getNoticePriority, formatFriendlyDate } from '@/lib/priority';
import { getGoogleCalendarUrl } from '@/lib/calendar';

/**
 * Props for CueCard component
 */
export interface CueCardProps {
  notice: NoticeItem;
  todayStr: string;
  onDelete: (id: string) => void;
}

const CATEGORY_ICONS: Record<NoticeCategory, React.ElementType> = {
  Academic: GraduationCap,
  Placement: Briefcase,
  Cultural: Palette,
  Sports: Trophy,
  Workshop: Cpu,
  General: Bell,
  'Urgent Announcement': AlertOctagon,
};

function getPriorityBadgeClass(status: string): string {
  switch (status) {
    case 'urgent': return 'bg-rose-50 text-rose-800 border-rose-200';
    case 'upcoming': return 'bg-orange-50 text-orange-800 border-orange-200';
    case 'expired': return 'bg-stone-100 text-stone-700 border-stone-200';
    default: return 'bg-amber-50 text-amber-800 border-amber-200';
  }
}

/**
 * 3D interactive flip card presenting structured notice details and back-face rules
 */
export const CueCard: React.FC<CueCardProps> = ({ notice, todayStr, onDelete }): React.JSX.Element => {
  const [isFlipped, setIsFlipped] = useState(false);

  const priority = getNoticePriority(notice, todayStr);
  const isHappeningToday = priority.status === 'urgent' && priority.needsAttentionToday && notice.date === todayStr;
  const CategoryIcon = CATEGORY_ICONS[notice.category] || Bell;

  const handleKeyDown = (e: React.KeyboardEvent): void => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setIsFlipped((prev) => !prev);
    }
  };

  return (
    <div
      tabIndex={0}
      role="button"
      aria-label={`${notice.title}. Priority: ${priority.label}. ${isFlipped ? 'Card back shown. Press Enter or Space to flip back.' : 'Card front shown. Press Enter or Space to flip for summary and rules.'}`}
      onKeyDown={handleKeyDown}
      onClick={() => setIsFlipped((prev) => !prev)}
      className="h-80 w-full perspective-1000 cursor-pointer select-none focus:outline-none focus:ring-2 focus:ring-orange-600 rounded-2xl group transition-all duration-300 hover:-translate-y-1"
    >
      <div className={`relative w-full h-full transform-style-preserve-3d transition-transform duration-500 rounded-2xl ${isFlipped ? 'rotate-y-180' : ''}`}>
        {/* Front Face */}
        <div className="absolute inset-0 backface-hidden w-full h-full bg-white rounded-2xl border border-stone-200/90 shadow-sm group-hover:shadow-md p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-3.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-stone-100 text-stone-800 border border-stone-200/80">
                <CategoryIcon className="w-3.5 h-3.5 text-stone-600 shrink-0" />
                <span className="truncate max-w-[130px]">{notice.category}</span>
              </span>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${getPriorityBadgeClass(priority.status)}`}>
                {isHappeningToday && <span aria-hidden="true" className="w-2 h-2 rounded-full bg-rose-600 urgent-pulse" />}
                <span>{priority.label}</span>
              </span>
            </div>
            <h3 className="font-heading text-lg sm:text-xl font-bold text-stone-900 tracking-tight line-clamp-2 mb-3 leading-snug group-hover:text-orange-700 transition-colors">
              {notice.title}
            </h3>
          </div>

          <div>
            <div className="space-y-2 text-sm text-stone-600 pt-3 border-t border-stone-100">
              <div className="flex items-center gap-2.5">
                <Calendar className="w-4 h-4 text-orange-600 shrink-0" />
                <span className="font-semibold text-stone-900 truncate">
                  {formatFriendlyDate(notice.date, todayStr)}
                  {notice.date ? ` (${notice.date})` : ''}
                </span>
              </div>
              <div className="flex items-center gap-2.5 text-stone-600">
                <Clock className="w-4 h-4 text-stone-400 shrink-0" />
                <span className="truncate font-medium">{notice.time || 'TBA'}</span>
              </div>
              <div className="flex items-center gap-2.5 text-stone-600">
                <MapPin className="w-4 h-4 text-stone-400 shrink-0" />
                <span className="truncate font-medium">{notice.venue || 'Campus'}</span>
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-stone-100 flex items-center justify-between text-xs text-stone-400 font-medium">
              <span className="flex items-center gap-1.5 text-orange-700 font-semibold hover:text-orange-800">
                <RotateCw className="w-3.5 h-3.5" /> Tap to flip for rules & summary ↻
              </span>
              {notice.date && (
                <a
                  href={getGoogleCalendarUrl(notice, todayStr)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  title="Add to Google Calendar"
                  aria-label="Add to Google Calendar"
                  className="p-1.5 text-stone-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-orange-600"
                >
                  <CalendarPlus className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Back Face */}
        <div className="absolute inset-0 backface-hidden rotate-y-180 w-full h-full bg-stone-50/90 rounded-2xl border border-stone-200/90 shadow-sm p-5 flex flex-col justify-between text-stone-900">
          <div className="overflow-y-auto pr-1 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-stone-200">
              <span className="font-heading text-xs font-bold text-stone-900 uppercase tracking-wider">
                Event Summary & Rules
              </span>
              <span className="text-xs font-semibold text-stone-500">{notice.category}</span>
            </div>
            <p className="text-sm text-stone-800 leading-relaxed bg-white/95 p-3 rounded-xl border border-stone-200/80 shadow-2xs">
              {notice.summary}
            </p>
            {notice.importantRules && notice.importantRules.length > 0 && (
              <div className="space-y-1.5">
                <div className="font-heading text-xs font-bold text-stone-800 uppercase tracking-wider">Important Rules:</div>
                <ul className="space-y-1.5">
                  {notice.importantRules.map((rule, idx) => (
                    <li key={idx} className="text-sm text-stone-700 flex items-start gap-2">
                      <span className="w-2 h-2 rounded-full bg-orange-600 mt-1.5 shrink-0" />
                      <span className="leading-snug">{rule}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="pt-2.5 border-t border-stone-200 flex items-center justify-between">
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setIsFlipped(false); }}
              aria-label="Flip card back to front"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-stone-700 hover:text-stone-900 focus:outline-none focus:ring-2 focus:ring-orange-600 rounded-lg px-2.5 py-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Flip back ↺
            </button>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onDelete(notice.id); }}
              aria-label={`Delete notice ${notice.title}`}
              title="Delete notice"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-rose-700 hover:text-rose-800 hover:bg-rose-50 rounded-lg px-3 py-1.5 transition-colors focus:outline-none focus:ring-2 focus:ring-rose-500"
            >
              <Trash2 className="w-4 h-4" /> Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
