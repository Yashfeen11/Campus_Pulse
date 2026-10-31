'use client';

import React from 'react';
import { Calendar } from 'lucide-react';
import { NoticeItem } from '@/types/notice';
import { getNoticePriority, isThisWeekPure } from '@/lib/priority';
import { CueCard } from './CueCard';

/**
 * Props for CalendarTimeline component
 */
export interface CalendarTimelineProps {
  notices: NoticeItem[];
  todayStr: string;
  onDeleteNotice: (id: string) => void;
}

/**
 * Renders chronological date-grouped timeline for campus notices
 */
export const CalendarTimeline: React.FC<CalendarTimelineProps> = ({
  notices,
  todayStr,
  onDeleteNotice,
}): React.JSX.Element => {
  const timelineGroups = [
    {
      id: 'today',
      title: 'Today',
      filter: (n: NoticeItem) => n.date === todayStr,
    },
    {
      id: 'tomorrow',
      title: 'Tomorrow',
      filter: (n: NoticeItem) => {
        const p = getNoticePriority(n, todayStr);
        return n.date !== todayStr && p.status === 'urgent' && n.category !== 'Urgent Announcement';
      },
    },
    {
      id: 'this_week',
      title: 'Later This Week',
      filter: (n: NoticeItem) => {
        const p = getNoticePriority(n, todayStr);
        return p.status === 'upcoming' && isThisWeekPure(n.date, todayStr);
      },
    },
    {
      id: 'upcoming',
      title: 'Next Week & Beyond',
      filter: (n: NoticeItem) => {
        const p = getNoticePriority(n, todayStr);
        return p.status === 'upcoming' && !isThisWeekPure(n.date, todayStr);
      },
    },
    {
      id: 'undated',
      title: 'Undated Notices & Announcements',
      filter: (n: NoticeItem) => !n.date,
    },
  ];

  return (
    <div className="space-y-8">
      {timelineGroups.map((group) => {
        const groupItems = notices.filter(group.filter);
        if (groupItems.length === 0) return null;

        return (
          <div key={group.id} className="space-y-3.5">
            <div className="flex items-center gap-2 pb-2 border-b border-stone-200">
              <Calendar className="w-4 h-4 text-orange-600" />
              <h4 className="font-heading text-xs sm:text-sm font-bold text-stone-900 uppercase tracking-wider">
                {group.title}
              </h4>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-700 font-bold">
                {groupItems.length}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {groupItems.map((notice) => (
                <CueCard
                  key={notice.id}
                  notice={notice}
                  todayStr={todayStr}
                  onDelete={onDeleteNotice}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};
