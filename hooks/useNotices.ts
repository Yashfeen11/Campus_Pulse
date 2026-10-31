'use client';

import { useState, useEffect, useCallback } from 'react';
import { NoticeItem } from '@/types/notice';
import { generateSeedNotices } from '@/lib/seedData';

const STORAGE_KEY = 'campus_pulse_notices_v2';

export function useNotices() {
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
    } catch (err) {
      console.error('Error accessing localStorage:', err);
      // Fallback in memory
      setNotices(generateSeedNotices(new Date()));
    }
  }, []);

  // Save changes to localStorage when notices change (only if mounted)
  const saveNotices = useCallback((updated: NoticeItem[]) => {
    setNotices(updated);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (err) {
      console.error('Failed to save notices to localStorage:', err);
    }
  }, []);

  const addNotice = useCallback(
    (newNotice: NoticeItem) => {
      setNotices((prev) => {
        const updated = [newNotice, ...prev];
        try {
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        } catch (e) {
          console.error(e);
        }
        return updated;
      });
    },
    []
  );

  const deleteNotice = useCallback((id: string) => {
    setNotices((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
  }, []);

  const resetToSeed = useCallback(() => {
    const fresh = generateSeedNotices(new Date());
    saveNotices(fresh);
  }, [saveNotices]);

  const clearAll = useCallback(() => {
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
