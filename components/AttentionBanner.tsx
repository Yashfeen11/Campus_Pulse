'use client';

import React from 'react';
import { Flame } from 'lucide-react';
import { NoticeItem } from '@/types/notice';

/**
 * Props for AttentionBanner component
 */
export interface AttentionBannerProps {
  urgentNotices: NoticeItem[];
}

/**
 * Renders high-visibility banner for events scheduled today or designated urgent
 */
export const AttentionBanner: React.FC<AttentionBannerProps> = ({
  urgentNotices,
}): React.JSX.Element | null => {
  if (urgentNotices.length === 0) return null;

  return (
    <div
      role="region"
      aria-label="Needs attention today"
      className="p-4 rounded-2xl bg-rose-50 border border-rose-200/90 flex items-start gap-3.5 text-rose-950 shadow-sm"
    >
      <div className="p-2 rounded-xl bg-rose-100 text-rose-700 mt-0.5 shrink-0">
        <Flame className="w-5 h-5 fill-rose-600 text-rose-600" />
      </div>
      <div className="flex-1 text-sm">
        <h4 className="font-heading font-bold text-rose-900 text-base tracking-tight mb-1 flex items-center gap-2">
          <span>Needs Attention Today</span>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-rose-200/90 text-rose-900">
            {urgentNotices.length} urgent
          </span>
        </h4>
        <p className="text-rose-800/90 leading-relaxed mb-2.5">
          High-priority campus events scheduled for today or designated as Urgent Announcements:
        </p>
        <div className="flex flex-wrap gap-2">
          {urgentNotices.map((item) => (
            <span
              key={item.id}
              className="px-3 py-1.5 rounded-xl bg-white/95 border border-rose-200 text-rose-900 font-semibold text-xs flex items-center gap-2 shadow-2xs"
            >
              <span className="w-2 h-2 rounded-full bg-rose-600 urgent-pulse" />
              <span className="truncate max-w-[220px]">{item.title}</span>
              <span className="text-rose-700 font-normal">({item.time || 'Today'})</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
