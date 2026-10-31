'use client';

import { useState, useEffect, useCallback } from 'react';
import { NoticeItem } from '@/types/notice';
import { generateSeedNotices } from '@/lib/seedData';

const STORAGE_KEY = 'campus_pulse_notices_v2';

/**
 * Custom hook interface for managing client-side notice deck state and persistence
 */
export interface UseNoticesResult {
  notices: NoticeItem[];
  isMounted: boolean;
  addNotice: (newNotice: NoticeItem) => void;
  deleteNotice: (id: string) => void;
  resetToSeed: () => void;
  clearAll: () => void;
}

/**
 * Hydration-safe React hook for campus notice state persisted to localStorage
 */
export function useNotices(): UseNoticesResult {
  const [notices, setNotices] = useState<NoticeItem[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  // Access localStorage ONLY inside client useEffect hook after mounting
  useEffect(() => {
    setIsMounted(true);
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setNotices(parsed);
          return;
        }
      }
      // If no stored data or empty, initialize with realistic dynamic seed notices
      const initialSeed = generateSeedNotices(new Date());
      setNotices(initialSeed);
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(initialSeed));
    } catch {
      // Fallback in memory
      setNotices(generateSeedNotices(new Date()));
    }
  }, []);

  // Save changes to localStorage when notices change (only if mounted)
  const saveNotices = useCallback((updated: NoticeItem[]): void => {
    setNotices(updated);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // Safe fallback
    }
  }, []);

  const addNotice = useCallback(
    (newNotice: NoticeItem): void => {
      setNotices((prev) => {
        const updated = [newNotice, ...prev];
        try {
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        } catch {
          // Safe fallback
        }
        return updated;
      });
    },
    []
  );

  const deleteNotice = useCallback((id: string): void => {
    setNotices((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // Safe fallback
      }
      return updated;
    });
  }, []);

  const resetToSeed = useCallback((): void => {
    const fresh = generateSeedNotices(new Date());
    saveNotices(fresh);
  }, [saveNotices]);

  const clearAll = useCallback((): void => {
    saveNotices([]);
  }, [saveNotices]);

  return {
    notices,
    isMounted,
    addNotice,
    deleteNotice,
    resetToSeed,
    clearAll,
  };
}
