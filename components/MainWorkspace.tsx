'use client';

import React, { useState, useMemo } from 'react';
import { NoticeItem } from '@/types/notice';
import { getNoticePriority, isThisWeekPure, sortNotices } from '@/lib/priority';
import { FilterToolbar, WorkspaceTab } from './FilterToolbar';
import { AttentionBanner } from './AttentionBanner';
import { CueCardDeck } from './CueCardDeck';
import { CalendarTimeline } from './CalendarTimeline';

/**
 * Props for MainWorkspace component
 */
export interface MainWorkspaceProps {
  notices: NoticeItem[];
  todayStr: string;
  onDeleteNotice: (id: string) => void;
  onResetSeed: () => void;
}

/**
 * Orchestrator workspace component for cue cards, timeline, and view filters
 */
export const MainWorkspace: React.FC<MainWorkspaceProps> = ({
  notices,
  todayStr,
  onDeleteNotice,
  onResetSeed,
}): React.JSX.Element => {
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('this_week');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedPriority, setSelectedPriority] = useState<string>('All');

  // Sort undated notices after dated notices
  const sortedNotices = useMemo(() => sortNotices(notices), [notices]);

  // Urgent notices scheduled for today
  const urgentTodayItems = useMemo(() => {
    return sortedNotices.filter((n) => {
      const p = getNoticePriority(n, todayStr);
      return p.needsAttentionToday;
    });
  }, [sortedNotices, todayStr]);

  // Tab counts
  const tabCounts = useMemo(() => {
    let thisWeek = 0;
    let active = 0;
    let expired = 0;

    sortedNotices.forEach((n) => {
      const p = getNoticePriority(n, todayStr);
      if (p.status === 'expired') {
        expired++;
      } else {
        active++;
        if (p.status === 'urgent' || isThisWeekPure(n.date, todayStr)) {
          thisWeek++;
        }
      }
    });

    return { thisWeek, active, expired };
  }, [sortedNotices, todayStr]);

  // Filter notices based on active tab, search, category, and priority
  const filteredNotices = useMemo(() => {
    return sortedNotices.filter((notice) => {
      const priority = getNoticePriority(notice, todayStr);

      if (activeTab === 'this_week') {
        if (priority.status === 'expired') return false;
        const isUrgent = priority.status === 'urgent';
        const isThisWeek = isThisWeekPure(notice.date, todayStr);
        if (!isUrgent && !isThisWeek) return false;
      } else if (activeTab === 'all_active') {
        if (priority.status === 'expired') return false;
      } else if (activeTab === 'expired') {
        if (priority.status !== 'expired') return false;
      }

      if (selectedCategory !== 'All' && notice.category !== selectedCategory) {
        return false;
      }

      if (selectedPriority !== 'All') {
        if (selectedPriority === 'Urgent' && priority.status !== 'urgent') return false;
        if (selectedPriority === 'Upcoming' && priority.status !== 'upcoming') return false;
        if (selectedPriority === 'Expired' && priority.status !== 'expired') return false;
        if (selectedPriority === 'Undated' && priority.status !== 'undated') return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = notice.title.toLowerCase().includes(q);
        const matchesVenue = notice.venue.toLowerCase().includes(q);
        const matchesSummary = notice.summary.toLowerCase().includes(q);
        const matchesRules = notice.importantRules.some((r) => r.toLowerCase().includes(q));

        if (!matchesTitle && !matchesVenue && !matchesSummary && !matchesRules) {
          return false;
        }
      }

      return true;
    });
  }, [sortedNotices, activeTab, selectedCategory, selectedPriority, searchQuery, todayStr]);

  return (
    <section aria-label="Unified Cue Card Workspace" className="space-y-6">
      <FilterToolbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        selectedPriority={selectedPriority}
        setSelectedPriority={setSelectedPriority}
        tabCounts={tabCounts}
        onResetSeed={onResetSeed}
      />

      {activeTab === 'this_week' && (
        <AttentionBanner urgentNotices={urgentTodayItems} />
      )}

      {activeTab === 'this_week' && (
        <CueCardDeck
          notices={filteredNotices}
          todayStr={todayStr}
          onDeleteNotice={onDeleteNotice}
          showCarousel={true}
          sectionTitle="All Cards This Week"
          emptyMessage="No notices match your active filter for this week."
        />
      )}

      {activeTab === 'all_active' && (
        <CueCardDeck
          notices={filteredNotices}
          todayStr={todayStr}
          onDeleteNotice={onDeleteNotice}
          sectionTitle="All Active Notices"
          emptyMessage="No active notices found matching your search or category."
        />
      )}

      {activeTab === 'calendar' && (
        <CalendarTimeline
          notices={filteredNotices}
          todayStr={todayStr}
          onDeleteNotice={onDeleteNotice}
        />
      )}

      {activeTab === 'expired' && (
        <CueCardDeck
          notices={filteredNotices}
          todayStr={todayStr}
          onDeleteNotice={onDeleteNotice}
          sectionTitle="Archived / Expired Notices"
          emptyMessage="No expired notices in archive."
        />
      )}
    </section>
  );
};
