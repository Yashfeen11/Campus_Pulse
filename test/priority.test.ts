import { describe, it, expect } from 'vitest';
import {
  getNoticePriority,
  isValidDateString,
  getTomorrowString,
  sortNotices,
} from '@/lib/priority';
import { sanitizeInputText } from '@/lib/sanitize';
import { checkRateLimit } from '@/lib/rateLimit';

describe('Priority & Auto-Expiration Logic (getNoticePriority)', () => {
  const todayStr = '2026-10-31';
  const tomorrowStr = '2026-11-01';
  const futureStr = '2026-11-05';
  const pastStr = '2026-10-25';

  it('marks date before today as expired with needsAttentionToday false', () => {
    const res = getNoticePriority({ date: pastStr, category: 'Academic' }, todayStr);
    expect(res.status).toBe('expired');
    expect(res.needsAttentionToday).toBe(false);
  });

  it('marks date is today as urgent with needsAttentionToday true', () => {
    const res = getNoticePriority({ date: todayStr, category: 'Placement' }, todayStr);
    expect(res.status).toBe('urgent');
    expect(res.needsAttentionToday).toBe(true);
  });

  it('marks date is tomorrow as urgent with needsAttentionToday false', () => {
    const res = getNoticePriority({ date: tomorrowStr, category: 'Workshop' }, todayStr);
    expect(res.status).toBe('urgent');
    expect(res.needsAttentionToday).toBe(false);
  });

  it('marks date 2 or more days ahead as upcoming with needsAttentionToday false', () => {
    const res = getNoticePriority({ date: futureStr, category: 'Sports' }, todayStr);
    expect(res.status).toBe('upcoming');
    expect(res.needsAttentionToday).toBe(false);
  });

  it('marks category "Urgent Announcement" (not in past) as urgent with needsAttentionToday true', () => {
    // Undated Urgent Announcement
    const res1 = getNoticePriority({ date: null, category: 'Urgent Announcement' }, todayStr);
    expect(res1.status).toBe('urgent');
    expect(res1.needsAttentionToday).toBe(true);

    // Future Urgent Announcement
    const res2 = getNoticePriority({ date: futureStr, category: 'Urgent Announcement' }, todayStr);
    expect(res2.status).toBe('urgent');
    expect(res2.needsAttentionToday).toBe(true);
  });

  it('marks category "Urgent Announcement" in the past as expired with needsAttentionToday false', () => {
    const res = getNoticePriority({ date: pastStr, category: 'Urgent Announcement' }, todayStr);
    expect(res.status).toBe('expired');
    expect(res.needsAttentionToday).toBe(false);
  });

  it('marks no date and not an Urgent Announcement as undated with needsAttentionToday false', () => {
    const res = getNoticePriority({ date: null, category: 'General' }, todayStr);
    expect(res.status).toBe('undated');
    expect(res.needsAttentionToday).toBe(false);
  });

  it('correctly calculates tomorrow via pure UTC math without system clock', () => {
    expect(getTomorrowString('2026-10-31')).toBe('2026-11-01');
    expect(getTomorrowString('2026-12-31')).toBe('2027-01-01');
    expect(getTomorrowString('2024-02-28')).toBe('2024-02-29'); // Leap year
    expect(getTomorrowString('2024-02-29')).toBe('2024-03-01');
  });

  it('sorts undated items after dated ones', () => {
    const items = [
      { id: '1', date: null },
      { id: '2', date: '2026-11-05' },
      { id: '3', date: null },
      { id: '4', date: '2026-10-31' },
    ];
    const sorted = sortNotices(items);
    expect(sorted.map((i) => i.id)).toEqual(['4', '2', '1', '3']);
  });

  it('validates strictly whether date is valid YYYY-MM-DD', () => {
    expect(isValidDateString('2026-10-31')).toBe(true);
    expect(isValidDateString('2026-02-29')).toBe(false); // 2026 is not a leap year
    expect(isValidDateString('invalid')).toBe(false);
    expect(isValidDateString('2026-13-01')).toBe(false);
    expect(isValidDateString(null)).toBe(false);
  });
});

describe('Sanitizer Security Checks (sanitizeInputText)', () => {
  it('strips script, iframe, and javascript protocols', () => {
    const raw = '<script>alert("hack")</script><iframe src="evil.com"></iframe>Hello <a href="javascript:steal()">World</a>';
    const clean = sanitizeInputText(raw);
    expect(clean).toBe('Hello World');
  });

  it('enforces 4,000 character limit', () => {
    const longStr = 'A'.repeat(5000);
    const clean = sanitizeInputText(longStr);
    expect(clean.length).toBe(4000);
  });
});

describe('In-Memory Rate Limiting (checkRateLimit)', () => {
  it('allows up to 10 requests per minute and blocks the 11th', () => {
    const testIp = '192.168.1.99';
    for (let i = 0; i < 10; i++) {
      const res = checkRateLimit(testIp);
      expect(res.allowed).toBe(true);
    }
    const blocked = checkRateLimit(testIp);
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
  });
});
