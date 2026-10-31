'use client';

import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Trash2,
  RotateCw,
  RotateCcw,
  GraduationCap,
  Briefcase,
  Palette,
  Trophy,
  Cpu,
  Bell,
  AlertOctagon,
  CalendarPlus,
} from 'lucide-react';
import { NoticeCategory, NoticeItem } from '@/types/notice';
import { getNoticePriority, formatFriendlyDate } from '@/lib/priority';
import { getGoogleCalendarUrl } from '@/lib/calendar';

interface CueCardProps {
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

export const CueCard: React.FC<CueCardProps> = ({ notice, todayStr, onDelete }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const priority = getNoticePriority(notice, todayStr);
  const isHappeningToday = priority.status === 'urgent' && priority.needsAttentionToday && notice.date === todayStr;

  const CategoryIcon = CATEGORY_ICONS[notice.category] || Bell;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setIsFlipped((prev) => !prev);
    }
  };

  // High contrast WCAG AA priority styles
  const getPriorityBadgeClass = () => {
    switch (priority.status) {
      case 'urgent':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'upcoming':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'expired':
        return 'bg-slate-100 text-slate-600 border-slate-200';
      case 'undated':
      default:
        return 'bg-amber-50 text-amber-700 border-amber-200';
    }
  };

  return (
    <div
      tabIndex={0}
      role="button"
      aria-label={`${notice.title}. Priority: ${priority.label}. ${isFlipped ? 'Card back shown. Press Enter or Space to flip back.' : 'Card front shown. Press Enter or Space to flip for summary and rules.'}`}
      onKeyDown={handleKeyDown}
      onClick={() => setIsFlipped((prev) => !prev)}
      className="h-72 w-full perspective-1000 cursor-pointer select-none focus:outline-none focus:ring-2 focus:ring-blue-600 rounded-2xl group transition-all duration-300 hover:-translate-y-1"
    >
      <div
        className={`relative w-full h-full transform-style-preserve-3d transition-transform duration-500 rounded-2xl ${
          isFlipped ? 'rotate-y-180' : ''
        }`}
      >
        {/* ================= FRONT FACE ================= */}
        <div className="absolute inset-0 backface-hidden w-full h-full bg-white rounded-2xl border border-slate-200/80 shadow-sm group-hover:shadow-md p-5 flex flex-col justify-between">
          <div>
            {/* Top row: Category pill + Priority badge */}
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200/80">
                <CategoryIcon className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span className="truncate max-w-[120px]">{notice.category}</span>
              </span>

              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${getPriorityBadgeClass()}`}
              >
                {isHappeningToday && (
                  <span
                    aria-hidden="true"
                    className="w-1.5 h-1.5 rounded-full bg-rose-500 urgent-pulse"
                  />
                )}
                <span>{priority.label}</span>
              </span>
            </div>

            {/* Event Title */}
            <h3 className="text-lg font-semibold text-slate-900 tracking-tight line-clamp-2 mb-3 leading-snug group-hover:text-blue-600 transition-colors">
              {notice.title}
            </h3>
          </div>

          <div>
            {/* Metadata Grid: Date, Time, Venue */}
            <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span className="font-medium text-slate-700">
                  {formatFriendlyDate(notice.date, todayStr)}
                  {notice.date ? ` (${notice.date})` : ''}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{notice.time || 'TBA'}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{notice.venue || 'Campus'}</span>
              </div>
            </div>

            {/* Subtle Footer Flip Prompt */}
            <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-medium">
              <span className="flex items-center gap-1 text-blue-600 font-medium">
                <RotateCw className="w-3 h-3" />
                Click to flip for summary & rules ↻
              </span>
              {notice.date && (
                <a
                  href={getGoogleCalendarUrl(notice, todayStr)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  title="Add to Google Calendar"
                  aria-label="Add to Google Calendar"
                  className="p-1 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <CalendarPlus className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* ================= BACK FACE ================= */}
        <div className="absolute inset-0 backface-hidden rotate-y-180 w-full h-full bg-blue-50/40 rounded-2xl border border-blue-200/90 shadow-sm p-5 flex flex-col justify-between text-slate-900">
          <div className="overflow-y-auto pr-1 space-y-2.5">
            {/* Header */}
            <div className="flex items-center justify-between pb-1.5 border-b border-blue-200/60">
              <span className="text-xs font-semibold text-blue-800 uppercase tracking-wider">
                Event Details & Rules
              </span>
              <span className="text-[11px] text-slate-500 font-medium">
                {notice.category}
              </span>
            </div>

            {/* Concise AI Summary */}
            <p className="text-xs text-slate-700 leading-relaxed bg-white/80 p-2.5 rounded-xl border border-blue-100">
              {notice.summary}
            </p>

            {/* Important Rules Checklist */}
            {notice.importantRules && notice.importantRules.length > 0 && (
              <div className="space-y-1">
                <div className="text-[11px] font-semibold text-slate-600">
                  Key Rules to Note:
                </div>
                <ul className="space-y-1">
                  {notice.importantRules.map((rule, idx) => (
                    <li
                      key={idx}
                      className="text-xs text-slate-700 flex items-start gap-1.5"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                      <span className="line-clamp-2">{rule}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Back Face Actions */}
          <div className="pt-2 border-t border-blue-200/60 flex items-center justify-between">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsFlipped(false);
              }}
              aria-label="Flip card back to front"
              className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 rounded-lg px-2 py-1"
            >
              <RotateCcw className="w-3 h-3" />
              Flip back ↺
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(notice.id);
              }}
              aria-label={`Delete notice ${notice.title}`}
              title="Delete notice"
              className="inline-flex items-center gap-1 text-xs font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg px-2.5 py-1 transition-colors focus:outline-none focus:ring-2 focus:ring-rose-500"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
