'use client';

import React, { useMemo } from 'react';
import { useNotices } from '@/hooks/useNotices';
import { AssistantSidebar } from '@/components/AssistantSidebar';
import { MainWorkspace } from '@/components/MainWorkspace';
import { Sparkles } from 'lucide-react';

export default function CampusPulsePage() {
  const {
    notices,
    isMounted,
    addNotice,
    deleteNotice,
    resetToSeed,
  } = useNotices();

  // Browser calculates local date (YYYY-MM-DD) in user's local timezone
  const todayStr = useMemo(() => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);

  // Hydration safety: render clean minimalist loading state before client mounts
  if (!isMounted) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-slate-400">
        <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3 animate-pulse">
          <Sparkles className="w-5 h-5" />
        </div>
        <p className="text-xs font-medium text-slate-500">Loading Campus Pulse...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
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
    </div>
  );
}
