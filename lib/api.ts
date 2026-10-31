import { NoticeItem, WeeklySummaryResponse } from '@/types/notice';

export interface ExtractApiPayload {
  text?: string;
  imageBase64?: string;
  mimeType?: string;
  currentDate: string;
}

/**
 * Client service to call /api/extract
 */
export async function extractNoticeApi(payload: ExtractApiPayload): Promise<NoticeItem> {
  const res = await fetch('/api/extract', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok || !data.success || !data.notice) {
    throw new Error(data.error || 'Failed to extract notice details');
  }

  return data.notice;
}

export interface SummaryApiPayload {
  notices: NoticeItem[];
  currentDate: string;
}

/**
 * Client service to call /api/summary
 */
export async function fetchWeeklySummaryApi(payload: SummaryApiPayload): Promise<WeeklySummaryResponse> {
  const res = await fetch('/api/summary', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok || !data.summary) {
    throw new Error(data.error || 'Failed to generate weekly digest');
  }

  return data.summary;
}
