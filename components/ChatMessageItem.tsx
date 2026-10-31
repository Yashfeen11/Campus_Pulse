'use client';

import React from 'react';
import {
  Sparkles,
  CheckCircle2,
  Dice5,
  RotateCcw,
  AlertCircle,
  Flame,
  Zap,
  Calendar,
  ShieldCheck,
} from 'lucide-react';
import { NoticeItem, WeeklySummaryResponse } from '@/types/notice';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  type: 'text' | 'confirmation' | 'summary' | 'error';
  text?: string;
  notice?: NoticeItem;
  summary?: WeeklySummaryResponse;
  retryAction?: () => void;
  timestamp: string;
}

export interface ChatMessageItemProps {
  msg: ChatMessage;
  onSampleNotice: () => void;
}

/**
 * Renders individual chat stream message bubbles, confirmation cards, and digests
 */
export const ChatMessageItem: React.FC<ChatMessageItemProps> = ({
  msg,
  onSampleNotice,
}): React.JSX.Element => {
  return (
    <div className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
      {msg.sender === 'assistant' && (
        <span className="text-xs font-semibold text-stone-500 mb-1.5 ml-1 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-orange-600" /> Pulse Assistant
        </span>
      )}

      {msg.sender === 'user' && (
        <div className="max-w-[85%] bg-stone-900 text-white p-3.5 rounded-2xl rounded-tr-sm shadow-sm font-normal text-sm leading-relaxed whitespace-pre-wrap">
          {msg.text}
        </div>
      )}

      {msg.sender === 'assistant' && msg.type === 'text' && (
        <div className="max-w-[90%] bg-stone-50 border border-stone-200/90 p-4 rounded-2xl rounded-tl-sm text-stone-800 leading-relaxed shadow-2xs text-sm space-y-2.5">
          <p>{msg.text}</p>
          {msg.id === 'welcome' && (
            <div className="pt-2.5 border-t border-stone-200/70">
              <button
                type="button"
                onClick={onSampleNotice}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold text-orange-800 bg-orange-50 hover:bg-orange-100 border border-orange-200 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-600"
              >
                <Dice5 className="w-3.5 h-3.5 text-orange-600" />
                Try Sample WhatsApp Notice
              </button>
            </div>
          )}
        </div>
      )}

      {msg.type === 'confirmation' && msg.notice && (
        <div className="w-full bg-white border border-stone-200 rounded-2xl p-4 shadow-sm space-y-2.5">
          <div className="flex items-center gap-2 text-sm sm:text-base font-bold text-stone-900 font-heading">
            <CheckCircle2 className="w-5 h-5 text-orange-600 shrink-0" />
            <span>Extracted: {msg.notice.title}</span>
          </div>
          <p className="text-sm text-stone-700 leading-relaxed">{msg.notice.summary}</p>
          <div className="flex flex-wrap items-center gap-2 text-xs text-stone-600 font-medium pt-1">
            <span className="px-2.5 py-1 rounded-md bg-stone-100 text-stone-800 font-semibold border border-stone-200">
              {msg.notice.category}
            </span>
            <span>•</span>
            <span className="font-semibold text-stone-900">{msg.notice.date || 'No date'}</span>
            <span>•</span>
            <span className="truncate max-w-[150px]">{msg.notice.venue}</span>
          </div>
          <div className="text-xs text-emerald-700 font-semibold pt-1.5 border-t border-stone-100 flex items-center gap-1.5">
            ✓ Added to your 3D Cue Card Deck
          </div>
        </div>
      )}

      {msg.type === 'summary' && msg.summary && (
        <div className="w-full bg-stone-50 border border-stone-200 rounded-2xl p-4 shadow-sm space-y-3.5">
          <div className="flex items-center justify-between pb-2 border-b border-stone-200">
            <span className="font-heading text-sm sm:text-base font-bold text-stone-900 flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-600" />
              This Week's Campus Digest
            </span>
            <span className="text-xs text-orange-700 font-bold uppercase tracking-wider">
              Synthesized
            </span>
          </div>

          {[
            { title: 'Immediate Priorities', icon: Zap, color: 'rose', items: msg.summary.todayPriorities },
            { title: 'Upcoming Deadlines', icon: Calendar, color: 'orange', items: msg.summary.upcomingDeadlines },
            { title: 'Rules to Remember', icon: ShieldCheck, color: 'stone', items: msg.summary.keyRulesToRemember },
          ].map((sec, idx) => (
            <div key={idx}>
              <div className="text-xs font-bold text-stone-800 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <sec.icon className={`w-3.5 h-3.5 ${sec.color === 'rose' ? 'text-rose-600' : sec.color === 'orange' ? 'text-orange-600' : 'text-stone-600'}`} />
                <span>{sec.title}</span>
              </div>
              <ul className="space-y-1.5 text-sm text-stone-700">
                {sec.items.map((item, itemIdx) => (
                  <li key={itemIdx} className="flex items-start gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full mt-2 shrink-0 ${sec.color === 'rose' ? 'bg-rose-600' : sec.color === 'orange' ? 'bg-orange-600' : 'bg-stone-600'}`} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {msg.summary.motivationalAdvice && (
            <p className="text-xs sm:text-sm text-stone-800 italic bg-white/90 p-3 rounded-xl border border-stone-200">
              "{msg.summary.motivationalAdvice}"
            </p>
          )}
        </div>
      )}

      {msg.type === 'error' && (
        <div role="status" aria-live="polite" className="w-full bg-rose-50 border border-rose-200 text-rose-900 p-3.5 rounded-2xl text-sm space-y-2">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span className="leading-snug">{msg.text}</span>
          </div>
          {msg.retryAction && (
            <button
              type="button"
              onClick={msg.retryAction}
              className="inline-flex items-center gap-1 text-xs font-semibold text-rose-700 hover:text-rose-900 underline focus:outline-none focus:ring-2 focus:ring-rose-500 rounded"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Retry extraction
            </button>
          )}
        </div>
      )}
    </div>
  );
};
