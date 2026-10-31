/**
 * Strict input sanitizer for Campus Pulse
 * Strips HTML/script tags (<script>, <iframe>, javascript:), trims input,
 * and enforces a 4,000-character limit on text.
 */
export function sanitizeInputText(input: unknown): string {
  if (typeof input !== 'string') {
    return '';
  }

  // 1. Remove script tags and contents
  let sanitized = input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

  // 2. Remove iframe tags and contents
  sanitized = sanitized.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');

  // 3. Remove style tags and contents
  sanitized = sanitized.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');

  // 4. Remove 'javascript:' URI schemes and dangerous protocols
  sanitized = sanitized.replace(/javascript\s*:/gi, '');
  sanitized = sanitized.replace(/data\s*:\s*text\/html/gi, '');
  sanitized = sanitized.replace(/vbscript\s*:/gi, '');

  // 5. Remove inline event handlers like onload, onerror, onclick, etc.
  sanitized = sanitized.replace(/on\w+\s*=\s*(?:'[^']*'|"[^"]*"|[^\s>]+)/gi, '');

  // 6. Strip generic HTML tags while preserving inner text content
  sanitized = sanitized.replace(/<[^>]+>/g, '');

  // 7. Trim leading and trailing whitespace
  sanitized = sanitized.trim();

  // 8. Enforce 4,000-character limit
  const MAX_CHARS = 4000;
  if (sanitized.length > MAX_CHARS) {
    sanitized = sanitized.slice(0, MAX_CHARS).trim();
  }

  return sanitized;
}
