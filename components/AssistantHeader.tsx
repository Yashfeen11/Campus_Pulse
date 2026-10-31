'use client';

import React from 'react';
import { Sparkles } from 'lucide-react';

/**
 * Props for AssistantHeader component
 */
export interface AssistantHeaderProps {
  onWeeklySummary: () => void;
  isGeneratingWeekly: boolean;
}

/**
 * Top header for AI Assistant with brand icon and weekly digest trigger
 */
export const AssistantHeader: React.FC<AssistantHeaderProps> = ({
  onWeeklySummary,
  isGeneratingWeekly,
}): React.JSX.Element => {
  return (
    <div className="p-4 border-b border-stone-100 flex items-center justify-between gap-3 bg-white/95 backdrop-blur-sm z-10">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-orange-600 text-white flex items-center justify-center font-bold text-base shadow-sm shadow-orange-600/20 shrink-0 font-heading">
          CP
        </div>
        <div>
          <h2 className="font-heading text-base font-bold text-stone-900 tracking-tight leading-tight">
            Campus Pulse
          </h2>
          <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
            <span>AI Assistant Ready</span>
          </div>
        </div>
      </div>

      {/* EXACTLY REQUIRED BUTTON: "What do I need to know this week?" */}
      <button
        type="button"
        onClick={onWeeklySummary}
        disabled={isGeneratingWeekly}
        aria-label="Generate weekly campus digest"
        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-orange-600 hover:bg-orange-700 transition-all shadow-sm shadow-orange-600/20 active:scale-95 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-orange-600"
      >
        <Sparkles className="w-3.5 h-3.5 text-orange-200" />
        <span className="whitespace-nowrap">What do I need to know this week?</span>
      </button>
    </div>
  );
};
