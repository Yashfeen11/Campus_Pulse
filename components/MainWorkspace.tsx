'use client';

import React, { useState, useMemo, useRef } from 'react';
import {
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  Flame,
  Calendar,
  Layers,
  Clock,
  Archive,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { NoticeCategory, NoticeItem, PriorityStatus } from '@/types/notice';
import { getNoticePriority, isThisWeekPure, sortNotices, formatFriendlyDate } from '@/lib/priority';
import { CueCard } from './CueCard';

export type WorkspaceTab = 'this_week' | 'all_active' | 'calendar' | 'expired';

interface MainWorkspaceProps {
  notices: NoticeItem[];
  todayStr: string;
  onDeleteNotice: (id: string) => void;
  onResetSeed: () => void;
}

const CATEGORIES: Array<{ id: string; label: string }> = [
  { id: 'All', label: 'All' },
  { id: 'Academic', label: 'Academic' },
  { id: 'Placement', label: 'Placement' },
  { id: 'Workshop', label: 'Workshop' },
  { id: 'Cultural', label: 'Cultural' },
  { id: 'Sports', label: 'Sports' },
  { id: 'General', label: 'General' },
  { id: 'Urgent Announcement', label: 'Urgent' },
];

export const MainWorkspace: React.FC<MainWorkspaceProps> = ({
  notices,
  todayStr,
  onDeleteNotice,
  onResetSeed,
}) => {
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('this_week');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedPriority, setSelectedPriority] = useState<string>('All');

  const carouselRef = useRef<HTMLDivElement>(null);

  const scrollCarousel = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const offset = direction === 'left' ? -320 : 320;
      carouselRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  // Sort undated notices after dated notices
  const sortedNotices = useMemo(() => {
    return sortNotices(notices);
  }, [notices]);

  // Separate notices that need attention today (strictly where needsAttentionToday is true)
  const needsAttentionTodayItems = useMemo(() => {
    return sortedNotices.filter((n) => {
      const p = getNoticePriority(n, todayStr);
      return p.needsAttentionToday;
    });
  }, [sortedNotices, todayStr]);

  // Filter notices based on active tab, search, category, and priority
  const tabFilteredNotices = useMemo(() => {
    return sortedNotices.filter((notice) => {
      const priority = getNoticePriority(notice, todayStr);

      // 1. Tab constraints
      if (activeTab === 'this_week') {
        if (priority.status === 'expired') return false;
        // In "This Week's Deck", include urgent items, this week's items, or undated urgent announcements
        const isUrgent = priority.status === 'urgent';
        const isThisWeek = isThisWeekPure(notice.date, todayStr);
        if (!isUrgent && !isThisWeek) return false;
      } else if (activeTab === 'all_active') {
        if (priority.status === 'expired') return false;
      } else if (activeTab === 'expired') {
        if (priority.status !== 'expired') return false;
      }
      // 'calendar' tab handles its own chronological groups

      // 2. Category filter
      if (selectedCategory !== 'All' && notice.category !== selectedCategory) {
        return false;
      }

      // 3. Priority pill filter
      if (selectedPriority !== 'All') {
        if (selectedPriority === 'Urgent' && priority.status !== 'urgent') return false;
        if (selectedPriority === 'Upcoming' && priority.status !== 'upcoming') return false;
        if (selectedPriority === 'Expired' && priority.status !== 'expired') return false;
        if (selectedPriority === 'Undated' && priority.status !== 'undated') return false;
      }

      // 4. Search query
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

  // Counts for tabs
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

  return (
    <section aria-label="Unified Cue Card Workspace" className="space-y-5">
      {/* ================= 1. Top Control Bar & View Switcher ================= */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-2.5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* View Switcher Tabs */}
        <div
          role="tablist"
          aria-label="Workspace views"
          className="flex items-center gap-1.5 overflow-x-auto p-1 bg-slate-100 rounded-xl"
        >
          <button
            role="tab"
            aria-selected={activeTab === 'this_week'}
            onClick={() => setActiveTab('this_week')}
            className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-blue-600 flex items-center gap-2 ${
              activeTab === 'this_week'
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>⚡ Focus Deck</span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
              activeTab === 'this_week' ? 'bg-blue-100 text-blue-800' : 'bg-slate-200/80 text-slate-600'
            }`}>
              {tabCounts.thisWeek}
            </span>
          </button>

          <button
            role="tab"
            aria-selected={activeTab === 'all_active'}
            onClick={() => setActiveTab('all_active')}
            className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-blue-600 flex items-center gap-2 ${
              activeTab === 'all_active'
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>📋 All Active</span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
              activeTab === 'all_active' ? 'bg-blue-100 text-blue-800' : 'bg-slate-200/80 text-slate-600'
            }`}>
              {tabCounts.active}
            </span>
          </button>

          <button
            role="tab"
            aria-selected={activeTab === 'calendar'}
            onClick={() => setActiveTab('calendar')}
            className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-blue-600 flex items-center gap-1.5 ${
              activeTab === 'calendar'
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-4 h-4 text-blue-600" />
            <span>Timeline</span>
          </button>

          <button
            role="tab"
            aria-selected={activeTab === 'expired'}
            onClick={() => setActiveTab('expired')}
            className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-blue-600 flex items-center gap-2 ${
              activeTab === 'expired'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Archive className="w-4 h-4" />
            <span>Archive</span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
              activeTab === 'expired' ? 'bg-slate-200 text-slate-800' : 'bg-slate-200/80 text-slate-600'
            }`}>
              {tabCounts.expired}
            </span>
          </button>
        </div>

        {/* Quick Reset Seed option */}
        <button
          type="button"
          onClick={onResetSeed}
          aria-label="Reload default seed deck"
          className="text-xs sm:text-sm font-medium text-slate-500 hover:text-slate-800 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors self-end sm:self-auto focus:outline-none focus:ring-2 focus:ring-blue-600 flex items-center gap-1.5"
        >
          <span>Reset Sample Data</span>
        </button>
      </div>

      {/* ================= 2. Refined Studio Filter Bar ================= */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-3.5 space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by event title, venue, rules, or summary..."
              aria-label="Search notices"
              className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search query"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Clean Status Filter Dropdown */}
          <div className="flex items-center gap-2">
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              aria-label="Filter notices by priority status"
              className="px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-colors cursor-pointer"
            >
              <option value="All">All Priorities</option>
              <option value="Urgent">🔥 Urgent Only</option>
              <option value="Upcoming">📅 Upcoming Only</option>
              <option value="Undated">⏳ Undated Only</option>
              <option value="Expired">📦 Expired Only</option>
            </select>
          </div>
        </div>

        {/* Clean Category Pill Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-0.5 scrollbar-thin">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
            Category:
          </span>
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                aria-pressed={isSelected}
                className={`px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-blue-600 shrink-0 ${
                  isSelected
                    ? 'bg-blue-600 text-white font-semibold shadow-sm shadow-blue-500/20'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ================= 3. Needs Attention Today Banner (ONLY if needsAttentionToday === true) ================= */}
      {needsAttentionTodayItems.length > 0 && activeTab === 'this_week' && (
        <div
          role="region"
          aria-label="Needs attention today"
          className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-900 shadow-sm"
        >
          <div className="p-2 rounded-xl bg-rose-100 text-rose-700 mt-0.5 shrink-0">
            <Flame className="w-4 h-4 fill-rose-600 text-rose-600" />
          </div>
          <div className="flex-1 text-xs">
            <h4 className="font-bold text-rose-800 text-sm tracking-tight mb-0.5 flex items-center gap-2">
              Needs Attention Today
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-rose-200/80 text-rose-800">
                {needsAttentionTodayItems.length} urgent
              </span>
            </h4>
            <p className="text-rose-700/90 leading-relaxed mb-2">
              High-priority events scheduled for today or designated as Urgent Announcements:
            </p>
            <div className="flex flex-wrap gap-2">
              {needsAttentionTodayItems.map((item) => (
                <span
                  key={item.id}
                  className="px-2.5 py-1 rounded-lg bg-white/90 border border-rose-200 text-rose-900 font-medium text-xs flex items-center gap-1.5 shadow-2xs"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 urgent-pulse" />
                  <span className="truncate max-w-[200px]">{item.title}</span>
                  <span className="text-[11px] text-rose-600">({item.time})</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ================= 4. View Modes Content ================= */}

      {/* Mode A: This Week's Deck (Horizontal Carousel Deck + Grid) */}
      {activeTab === 'this_week' && (
        <div className="space-y-6">
          {/* Carousel Header with Accessible Prev/Next buttons */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-blue-600" />
                This Week's Cue Cards
              </h3>
              <p className="text-xs text-slate-500">
                Interactive swipeable deck of events happening today and this week.
              </p>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => scrollCarousel('left')}
                aria-label="Scroll previous card"
                className="p-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => scrollCarousel('right')}
                aria-label="Scroll next card"
                className="p-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Carousel Container */}
          {tabFilteredNotices.length > 0 ? (
            <div
              ref={carouselRef}
              className="flex gap-4 overflow-x-auto pb-4 pt-1 snap-x snap-mandatory scroll-smooth"
            >
              {tabFilteredNotices.map((notice) => (
                <div key={notice.id} className="flex-none w-[280px] sm:w-[320px] snap-start">
                  <CueCard
                    notice={notice}
                    todayStr={todayStr}
                    onDelete={onDeleteNotice}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="p-10 rounded-2xl bg-white border border-slate-200 text-center text-xs text-slate-500">
              No notices match your active filter for this week.
            </div>
          )}

          {/* Grid View of all matching this week items */}
          <div className="pt-2">
            <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-3">
              Full Deck View ({tabFilteredNotices.length})
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {tabFilteredNotices.map((notice) => (
                <CueCard
                  key={notice.id}
                  notice={notice}
                  todayStr={todayStr}
                  onDelete={onDeleteNotice}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Mode B: All Active (2-column responsive grid) */}
      {activeTab === 'all_active' && (
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              All Active Cue Cards ({tabFilteredNotices.length})
            </h3>
            <span className="text-xs text-slate-400">
              Past notices are automatically moved to Expired
            </span>
          </div>

          {tabFilteredNotices.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {tabFilteredNotices.map((notice) => (
                <CueCard
                  key={notice.id}
                  notice={notice}
                  todayStr={todayStr}
                  onDelete={onDeleteNotice}
                />
              ))}
            </div>
          ) : (
            <div className="p-12 rounded-2xl bg-white border border-slate-200 text-center text-xs text-slate-500">
              No active notices found matching your criteria.
            </div>
          )}
        </div>
      )}

      {/* Mode C: Calendar View (Chronological Date-Grouped Timeline) */}
      {activeTab === 'calendar' && (
        <div className="space-y-8">
          {[
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
          ].map((group) => {
            const groupItems = tabFilteredNotices.filter(group.filter);
            if (groupItems.length === 0) return null;

            return (
              <div key={group.id} className="space-y-3">
                <div className="flex items-center gap-2 pb-1.5 border-b border-slate-200">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    {group.title}
                  </h4>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
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
      )}

      {/* Mode D: Expired View */}
      {activeTab === 'expired' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Archive className="w-4 h-4 text-slate-400" />
            <span>
              Archived notices whose event date has passed. These do not appear in active views.
            </span>
          </div>

          {tabFilteredNotices.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {tabFilteredNotices.map((notice) => (
                <CueCard
                  key={notice.id}
                  notice={notice}
                  todayStr={todayStr}
                  onDelete={onDeleteNotice}
                />
              ))}
            </div>
          ) : (
            <div className="p-12 rounded-2xl bg-white border border-slate-200 text-center text-xs text-slate-500">
              No expired notices in archive.
            </div>
          )}
        </div>
      )}
    </section>
  );
};
