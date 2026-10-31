import { NoticeCategory } from '@/types/notice';

/**
 * Allowed notice categories for validation and filtering
 */
export const ALLOWED_CATEGORIES: readonly NoticeCategory[] = [
  'Academic',
  'Cultural',
  'Placement',
  'Sports',
  'Workshop',
  'General',
  'Urgent Announcement',
] as const;

/**
 * Category filter pills list including 'All'
 */
export const CATEGORY_FILTER_OPTIONS: ReadonlyArray<{ id: string; label: string }> = [
  { id: 'All', label: 'All' },
  { id: 'Academic', label: 'Academic' },
  { id: 'Placement', label: 'Placement' },
  { id: 'Workshop', label: 'Workshop' },
  { id: 'Cultural', label: 'Cultural' },
  { id: 'Sports', label: 'Sports' },
  { id: 'General', label: 'General' },
  { id: 'Urgent Announcement', label: 'Urgent' },
] as const;

/**
 * Prioritized Gemini model fallback chain
 */
export const MODEL_FALLBACK_CHAIN: readonly string[] = [
  'gemini-2.5-flash',
  'gemini-2.5-flash-lite',
  'gemini-2.0-flash',
  'gemini-2.0-flash-lite',
  'gemini-1.5-flash',
] as const;

/**
 * Allowed image MIME types for poster uploads
 */
export const ALLOWED_IMAGE_MIMES: readonly string[] = [
  'image/jpeg',
  'image/png',
  'image/webp',
] as const;

/**
 * Maximum character limit for sanitized student text
 */
export const MAX_TEXT_LENGTH = 4000;

/**
 * Maximum decoded image size in bytes (2 MB)
 */
export const MAX_IMAGE_SIZE_BYTES = 2 * 1024 * 1024;

/**
 * Maximum image dimension (px) for client compression
 */
export const MAX_IMAGE_DIMENSION = 1400;

/**
 * Rate limit request allowance per IP
 */
export const RATE_LIMIT_MAX_REQUESTS = 10;

/**
 * Rate limit window in milliseconds (1 minute)
 */
export const RATE_LIMIT_WINDOW_MS = 60 * 1000;
