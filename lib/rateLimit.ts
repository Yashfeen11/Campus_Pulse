// Note: In-memory rate limiting is best-effort on serverless hosting (Vercel)
// because separate serverless container instances have isolated memory.

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitRecord>();

const WINDOW_MS = 60 * 1000; // 1 minute window
const MAX_REQUESTS = 10; // 10 requests per minute

/**
 * Checks in-memory rate limit for a given IP address.
 * Returns { allowed: boolean, retryAfterSeconds: number, remaining: number }
 */
export function checkRateLimit(ip: string): {
  allowed: boolean;
  retryAfterSeconds: number;
  remaining: number;
} {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  // If no record or expired window, reset
  if (!record || now >= record.resetTime) {
    rateLimitMap.set(ip, {
      count: 1,
      resetTime: now + WINDOW_MS,
    });
    return {
      allowed: true,
      retryAfterSeconds: 0,
      remaining: MAX_REQUESTS - 1,
    };
  }

  // If within window
  if (record.count >= MAX_REQUESTS) {
    const retryAfterSeconds = Math.max(1, Math.ceil((record.resetTime - now) / 1000));
    return {
      allowed: false,
      retryAfterSeconds,
      remaining: 0,
    };
  }

  record.count += 1;
  return {
    allowed: true,
    retryAfterSeconds: 0,
    remaining: MAX_REQUESTS - record.count,
  };
}

/**
 * Periodically purge stale entries from rateLimitMap to prevent unbounded memory growth
 */
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [ip, record] of rateLimitMap.entries()) {
      if (now >= record.resetTime) {
        rateLimitMap.delete(ip);
      }
    }
  }, 2 * 60 * 1000);
}
