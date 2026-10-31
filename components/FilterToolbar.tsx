'use client';

import React from 'react';
import { Search, X, Calendar, Archive, RotateCcw, Zap, Layers } from 'lucide-react';
import { CATEGORY_FILTER_OPTIONS } from '@/lib/constants';

export type WorkspaceTab = 'this_week' | 'all_active' | 'calendar' | 'expired';

/**
 * Props for FilterToolbar component
 */
export interface FilterToolbarProps {
  activeTab: WorkspaceTab;
  setActiveTab: (tab: WorkspaceTab) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  selectedPriority: string;
  setSelectedPriority: (p: string) => void;
  tabCounts: { thisWeek: number; active: number; expired: number };
  onResetSeed: () => void;
}

/**
 * Editorial studio toolbar providing view switcher, search, priority, and category controls
 */
export const FilterToolbar: React.FC<FilterToolbarProps> = ({
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  selectedPriority,
  setSelectedPriority,
  tabCounts,
  onResetSeed,
}): React.JSX.Element => {
  const tabs: Array<{ id: WorkspaceTab; label: string; count?: number; icon?: React.ElementType }> = [
    { id: 'this_week', label: '⚡ Focus Deck', count: tabCounts.thisWeek },
    { id: 'all_active', label: '📋 All Active', count: tabCounts.active },
    { id: 'calendar', label: 'Timeline', icon: Calendar },
    { id: 'expired', label: 'Archive', count: tabCounts.expired, icon: Archive },
  ];

  return (
    <div className="space-y-3">
      {/* View Switcher Tabs */}
      <div className="bg-white rounded-2xl border border-stone-200/90 shadow-sm p-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div role="tablist" aria-label="Workspace views" className="flex items-center gap-1.5 overflow-x-auto p-1 bg-stone-100 rounded-xl">
          {tabs.map((tab) => {
            const isSelected = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={isSelected}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-orange-600 flex items-center gap-2 ${
                  isSelected ? 'bg-white text-stone-900 shadow-sm font-bold' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {Icon && <Icon className={`w-4 h-4 ${tab.id === 'calendar' ? 'text-orange-600' : 'text-stone-500'}`} />}
                <span>{tab.label}</span>
                {typeof tab.count === 'number' && (
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                    isSelected ? (tab.id === 'this_week' ? 'bg-orange-100 text-orange-800' : 'bg-stone-200 text-stone-900') : 'bg-stone-200/80 text-stone-600'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={onResetSeed}
          aria-label="Reload default seed deck"
          className="text-xs sm:text-sm font-medium text-stone-500 hover:text-stone-900 px-3 py-1.5 rounded-lg hover:bg-stone-100 transition-colors self-end sm:self-auto focus:outline-none focus:ring-2 focus:ring-orange-600 flex items-center gap-1.5"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Sample Data</span>
        </button>
      </div>

      {/* Search & Filter Strip */}
      <div className="bg-white rounded-2xl border border-stone-200/90 shadow-sm p-3.5 space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by event title, venue, rules, or summary..."
              aria-label="Search notices"
              className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-600 focus:bg-white transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search query"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              aria-label="Filter notices by priority status"
              className="px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs sm:text-sm font-semibold text-stone-700 hover:bg-stone-100 focus:outline-none focus:ring-2 focus:ring-orange-600 transition-colors cursor-pointer"
            >
              <option value="All">All Priorities</option>
              <option value="Urgent">🔥 Urgent Only</option>
              <option value="Upcoming">📅 Upcoming Only</option>
              <option value="Undated">⏳ Undated Only</option>
              <option value="Expired">📦 Expired Only</option>
            </select>
          </div>
        </div>

        {/* Category Pill Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-0.5 scrollbar-thin">
          <span className="text-xs font-bold text-stone-400 uppercase tracking-wider shrink-0 mr-1">
            Category:
          </span>
          {CATEGORY_FILTER_OPTIONS.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                aria-pressed={isSelected}
                className={`px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-orange-600 shrink-0 ${
                  isSelected
                    ? 'bg-stone-900 text-white font-semibold shadow-sm'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200/80 hover:text-stone-900'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
