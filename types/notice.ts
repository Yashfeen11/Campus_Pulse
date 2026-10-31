export type NoticeCategory =
  | 'Academic'
  | 'Cultural'
  | 'Placement'
  | 'Sports'
  | 'Workshop'
  | 'General'
  | 'Urgent Announcement';

export interface NoticeItem {
  id: string;
  title: string;
  date: string | null; // Strictly YYYY-MM-DD or null if undated
  time: string; // e.g. "10:30 AM" or "TBA"
  venue: string; // e.g. "Main Auditorium" or "Online"
  category: NoticeCategory;
  importantRules: string[]; // 1-3 short bullet points
  summary: string; // 1 concise sentence
  createdAt: string; // ISO string
}

export type PriorityStatus = 'urgent' | 'upcoming' | 'expired' | 'undated';

export interface NoticePriorityResult {
  status: PriorityStatus;
  label: string;
  needsAttentionToday: boolean;
}

export interface WeeklySummaryResponse {
  todayPriorities: string[];
  upcomingDeadlines: string[];
  keyRulesToRemember: string[];
  motivationalAdvice?: string;
}
