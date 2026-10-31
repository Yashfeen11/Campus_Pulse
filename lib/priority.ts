import { NoticePriorityResult, PriorityStatus, NoticeCategory } from '@/types/notice';

/**
 * Validates strictly whether a string matches YYYY-MM-DD and is a real calendar date
 */
export function isValidDateString(str: unknown): str is string {
  if (typeof str !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    return false;
  }
  const [year, month, day] = str.split('-').map(Number);
  if (month < 1 || month > 12 || day < 1 || day > 31) return false;
  const d = new Date(Date.UTC(year, month - 1, day));
  return (
    d.getUTCFullYear() === year &&
    d.getUTCMonth() === month - 1 &&
    d.getUTCDate() === day
  );
}

/**
 * Returns tomorrow's date formatted as YYYY-MM-DD relative to a base YYYY-MM-DD date string.
 * Uses UTC date math so it is pure and does not query system clock.
 */
export function getTomorrowString(baseDateStr: string): string {
  const [year, month, day] = baseDateStr.split('-').map(Number);
  const d = new Date(Date.UTC(year, month - 1, day + 1));
  const nextYear = d.getUTCFullYear();
  const nextMonth = String(d.getUTCMonth() + 1).padStart(2, '0');
  const nextDay = String(d.getUTCDate()).padStart(2, '0');
  return `${nextYear}-${nextMonth}-${nextDay}`;
}

/**
 * Compares two YYYY-MM-DD strings to check if dateStr is within baseDateStr + 7 days
 */
export function isThisWeekPure(dateStr: string | null, todayStr: string): boolean {
  if (!dateStr) return false;
  const [year, month, day] = todayStr.split('-').map(Number);
  const sevenDays = new Date(Date.UTC(year, month - 1, day + 7));
  const y7 = sevenDays.getUTCFullYear();
  const m7 = String(sevenDays.getUTCMonth() + 1).padStart(2, '0');
  const d7 = String(sevenDays.getUTCDate()).padStart(2, '0');
  const maxWeekStr = `${y7}-${m7}-${d7}`;

  return dateStr >= todayStr && dateStr <= maxWeekStr;
}

export interface NoticeLike {
  date: string | null;
  category?: NoticeCategory | string;
}

/**
 * Pure function getNoticePriority(notice, todayStr)
 *
 * Rules:
 * - date before today -> "expired", needsAttentionToday false
 * - date is today -> "urgent", needsAttentionToday true
 * - date is tomorrow -> "urgent", needsAttentionToday false
 * - date is 2 or more days ahead -> "upcoming", needsAttentionToday false
 * - category "Urgent Announcement" and not in the past (or undated) -> "urgent", needsAttentionToday true
 * - no date and not an Urgent Announcement -> "undated", needsAttentionToday false
 *
 * This function is strictly pure and does NOT call new Date() to query system clock.
 */
export function getNoticePriority(
  notice: NoticeLike,
  todayStr: string
): NoticePriorityResult {
  const tomorrowStr = getTomorrowString(todayStr);
  const isUrgentCategory = notice.category === 'Urgent Announcement';
  const cleanDate = notice.date ? notice.date.trim().slice(0, 10) : null;

  // 1. Check if date is in the past
  if (cleanDate && cleanDate < todayStr) {
    return {
      status: 'expired',
      label: 'Expired',
      needsAttentionToday: false,
    };
  }

  // 2. Urgent Announcement category not in the past (undated or future)
  if (isUrgentCategory) {
    return {
      status: 'urgent',
      label: 'Urgent • Happening Soon',
      needsAttentionToday: true,
    };
  }

  // 3. No date and not an Urgent Announcement
  if (!cleanDate) {
    return {
      status: 'undated',
      label: 'No Date',
      needsAttentionToday: false,
    };
  }

  // 4. Date is today
  if (cleanDate === todayStr) {
    return {
      status: 'urgent',
      label: 'Urgent • Happening Soon',
      needsAttentionToday: true,
    };
  }

  // 5. Date is tomorrow
  if (cleanDate === tomorrowStr) {
    return {
      status: 'urgent',
      label: 'Urgent • Happening Soon',
      needsAttentionToday: false,
    };
  }

  // 6. Date is 2 or more days ahead
  return {
    status: 'upcoming',
    label: 'Upcoming',
    needsAttentionToday: false,
  };
}

/**
 * Formats a YYYY-MM-DD date or null into a clean friendly string
 */
export function formatFriendlyDate(dateStr: string | null, todayStr: string): string {
  if (!dateStr) return 'No date';
  const tomorrow = getTomorrowString(todayStr);

  if (dateStr === todayStr) return 'Today';
  if (dateStr === tomorrow) return 'Tomorrow';

  try {
    const [year, month, day] = dateStr.slice(0, 10).split('-').map(Number);
    const dateObj = new Date(Date.UTC(year, month - 1, day));
    return dateObj.toLocaleDateString('en-US', {
      timeZone: 'UTC',
      month: 'short',
      day: 'numeric',
      weekday: 'short',
    });
  } catch {
    return dateStr;
  }
}

/**
 * Sorts notices: dated notices first (chronologically), followed by undated notices
 */
export function sortNotices<T extends { date: string | null }>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    if (a.date && b.date) {
      return a.date.localeCompare(b.date);
    }
    if (a.date && !b.date) return -1;
    if (!a.date && b.date) return 1;
    return 0;
  });
}
