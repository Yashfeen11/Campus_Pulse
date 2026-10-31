import { describe, it, expect } from 'vitest';
import { extractNoticeLocally, generateWeeklySummaryLocally } from '@/lib/localExtractor';
import { NoticeItem } from '@/types/notice';

describe('Smart Local Extractor Fallback (extractNoticeLocally)', () => {
  const refDate = '2026-10-31';

  it('correctly extracts placement notice with date, time, and venue', () => {
    const text = `Google Campus Drive 2026
Date: Tomorrow
Time: 10:30 AM
Venue: Main Auditorium (Hall A)
Category: Placement
Rules:
- Bring 2 copies of resume
- Formal attire mandatory
Contact coordinator: 9876543210`;

    const notice = extractNoticeLocally(text, refDate);

    expect(notice.title).toBe('Google Campus Drive 2026');
    expect(notice.date).toBe('2026-11-01'); // Tomorrow
    expect(notice.time).toBe('10:30 AM');
    expect(notice.venue).toContain('Main Auditorium');
    expect(notice.category).toBe('Placement');
    expect(notice.importantRules.length).toBeGreaterThan(0);
    expect(notice.importantRules.some((r) => r.includes('9876543210'))).toBe(true);
    expect(notice.summary).toContain('Google Campus Drive 2026');
  });

  it('correctly auto-classifies Urgent Announcement category and sets date to today', () => {
    const text = `🚨 URGENT ADVISORY: SEVERE WEATHER ALERT 🚨
Due to heavy rain, all classes are cancelled today.
Venue: Online / Google Meet
Stay indoors and check portal for updates.`;

    const notice = extractNoticeLocally(text, refDate);

    expect(notice.category).toBe('Urgent Announcement');
    expect(notice.date).toBe(refDate);
    expect(notice.venue).toContain('Online');
  });

  it('detects named months like "15th Nov"', () => {
    const text = `Annual Tech Fest 2026
Date: 15th Nov 2026
Time: 09:00 AM
Venue: Computer Center`;

    const notice = extractNoticeLocally(text, refDate);
    expect(notice.date).toBe('2026-11-15');
    expect(notice.category).toBe('Workshop');
  });

  it('never crashes on messy or minimal input', () => {
    const text = 'H';
    const notice = extractNoticeLocally(text, refDate);
    expect(notice.title).toBeDefined();
    expect(notice.date).toBeDefined();
    expect(notice.category).toBe('General');
    expect(notice.summary).toBeDefined();
  });
});

describe('Local Weekly Summary Synthesizer (generateWeeklySummaryLocally)', () => {
  const refDate = '2026-10-31';

  const notices: NoticeItem[] = [
    {
      id: '1',
      title: 'Maths Midterm Exam',
      date: refDate,
      time: '09:00 AM',
      venue: 'Hall 3',
      category: 'Academic',
      importantRules: ['Bring scientific calculator'],
      summary: 'Maths midterm today.',
      createdAt: new Date().toISOString(),
    },
    {
      id: '2',
      title: 'Badminton Trials',
      date: '2026-11-03',
      time: '04:00 PM',
      venue: 'Sports Arena',
      category: 'Sports',
      importantRules: ['Non-marking shoes only'],
      summary: 'Badminton trials later this week.',
      createdAt: new Date().toISOString(),
    },
  ];

  it('synthesizes today priorities and upcoming deadlines accurately', () => {
    const digest = generateWeeklySummaryLocally(notices, refDate);
    expect(digest.todayPriorities.some((p) => p.includes('Maths Midterm Exam'))).toBe(true);
    expect(digest.upcomingDeadlines.some((d) => d.includes('Badminton Trials'))).toBe(true);
    expect(digest.keyRulesToRemember.some((r) => r.includes('scientific calculator'))).toBe(true);
    expect(digest.motivationalAdvice).toBeDefined();
  });
});
