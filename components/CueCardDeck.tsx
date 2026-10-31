'use client';

import React, { useRef } from 'react';
import { Layers, ChevronLeft, ChevronRight } from 'lucide-react';
import { NoticeItem } from '@/types/notice';
import { CueCard } from './CueCard';

/**
 * Props for CueCardDeck component
 */
export interface CueCardDeckProps {
  notices: NoticeItem[];
  todayStr: string;
  onDeleteNotice: (id: string) => void;
  showCarousel?: boolean;
  emptyMessage?: string;
  sectionTitle?: string;
}

/**
 * Renders interactive swipeable carousel and responsive grid of 3D cue cards
 */
export const CueCardDeck: React.FC<CueCardDeckProps> = ({
  notices,
  todayStr,
  onDeleteNotice,
  showCarousel = false,
  emptyMessage = 'No notices match your active criteria.',
  sectionTitle,
}): React.JSX.Element => {
  const carouselRef = useRef<HTMLDivElement>(null);

  const scrollCarousel = (direction: 'left' | 'right'): void => {
    if (carouselRef.current) {
      const offset = direction === 'left' ? -340 : 340;
      carouselRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  if (notices.length === 0) {
    return (
      <div className="p-12 rounded-2xl bg-white border border-stone-200/90 text-center text-sm text-stone-500 shadow-sm">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {showCarousel && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-heading text-sm sm:text-base font-bold text-stone-900 tracking-tight flex items-center gap-2">
                <Layers className="w-4 h-4 text-orange-600" />
                <span>Swipeable Priority Deck</span>
              </h3>
              <p className="text-xs text-stone-500">
                Interactive cards for events happening today and this week.
              </p>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => scrollCarousel('left')}
                aria-label="Scroll previous card"
                className="p-2 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-600 shadow-2xs"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => scrollCarousel('right')}
                aria-label="Scroll next card"
                className="p-2 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-600 shadow-2xs"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div
            ref={carouselRef}
            className="flex gap-4 overflow-x-auto pb-4 pt-1 snap-x snap-mandatory scroll-smooth"
          >
            {notices.map((notice) => (
              <div key={notice.id} className="flex-none w-[290px] sm:w-[330px] snap-start">
                <CueCard
                  notice={notice}
                  todayStr={todayStr}
                  onDelete={onDeleteNotice}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Grid View */}
      <div className="space-y-3">
        {sectionTitle && (
          <h4 className="font-heading text-xs sm:text-sm font-bold text-stone-700 uppercase tracking-wider">
            {sectionTitle} ({notices.length})
          </h4>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {notices.map((notice) => (
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
  );
};
