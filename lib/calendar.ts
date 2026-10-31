import { NoticeItem } from '@/types/notice';

/**
 * Generates a direct Google Calendar web link for a given NoticeItem
 */
export function getGoogleCalendarUrl(notice: NoticeItem, todayStr?: string): string {
  const title = encodeURIComponent(`[Campus Pulse] ${notice.title}`);
  const details = encodeURIComponent(
    `${notice.summary}\n\nImportant Rules:\n${notice.importantRules.map((r) => `• ${r}`).join('\n')}\n\nVenue: ${notice.venue}`
  );
  const location = encodeURIComponent(notice.venue);

  // If no date, use todayStr or fallback
  const dateStr = notice.date || todayStr || new Date().toISOString().slice(0, 10);
  const dateClean = dateStr.replace(/-/g, '');
  const startParam = `${dateClean}T090000Z`;
  const endParam = `${dateClean}T110000Z`;

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startParam}/${endParam}&details=${details}&location=${location}`;
}

/**
 * Downloads a standard .ics iCalendar file for Apple Calendar, Outlook, etc.
 */
export function downloadIcsFile(notice: NoticeItem, todayStr?: string) {
  const dateStr = notice.date || todayStr || new Date().toISOString().slice(0, 10);
  const dateClean = dateStr.replace(/-/g, '');
  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Campus Pulse//Notice Calendar//EN',
    'BEGIN:VEVENT',
    `UID:${notice.id}@campuspulse.local`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').slice(0, 15)}Z`,
    `DTSTART:${dateClean}T090000Z`,
    `DTEND:${dateClean}T110000Z`,
    `SUMMARY:[Campus Pulse] ${notice.title}`,
    `DESCRIPTION:${notice.summary.replace(/\n/g, ' ')}`,
    `LOCATION:${notice.venue}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${notice.title.slice(0, 25).replace(/\s+/g, '_')}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
