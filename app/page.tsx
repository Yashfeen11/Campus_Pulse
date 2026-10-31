'use client';

import React, { useMemo } from 'react';
import { useNotices } from '@/hooks/useNotices';
import { AssistantSidebar } from '@/components/AssistantSidebar';
import { MainWorkspace } from '@/components/MainWorkspace';
import { Sparkles } from 'lucide-react';

/**
 * Root page orchestrating the 2-column layout for the AI Assistant and Cue Card Workspace
 */
export default function CampusPulsePage(): React.JSX.Element {
  const {
    notices,
    isMounted,
    addNotice,
    deleteNotice,
    resetToSeed,
  } = useNotices();

  // Browser calculates local date (YYYY-MM-DD) in user's local timezone
  const todayStr = useMemo((): string => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);

  // Hydration safety: render clean warm editorial loading state before client mounts
  if (!isMounted) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex flex-col items-center justify-center p-6 text-stone-400">
        <div className="w-10 h-10 rounded-2xl bg-orange-100 text-orange-700 flex items-center justify-center mb-3 animate-pulse">
          <Sparkles className="w-5 h-5" />
        </div>
        <p className="text-sm font-medium text-stone-600 font-heading">Loading Campus Pulse...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#FAF8F5] text-stone-900">
      {/* 2-Column Responsive Workspace */}
      <div className="max-w-7xl mx-auto p-3 sm:p-4 lg:p-6 min-h-screen">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* ================= LEFT COLUMN: AI Assistant Sidebar ================= */}
          <div className="lg:col-span-4 w-full">
            <AssistantSidebar
              todayStr={todayStr}
              notices={notices}
              onNoticeCreated={addNotice}
            />
          </div>

          {/* ================= RIGHT COLUMN: Unified 3D Cue Card Deck ================= */}
          <div className="lg:col-span-8 w-full min-w-0">
            <MainWorkspace
              notices={notices}
              todayStr={todayStr}
              onDeleteNotice={deleteNotice}
              onResetSeed={resetToSeed}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
