// ──────────────────────────────────────────────
// RUVA House — In-Memory Rate Limiter
// ──────────────────────────────────────────────

interface RateLimitEntry {
  timestamps: number[];
}

// Sliding window configuration
const WINDOW_MS = 15 * 60 * 1000;  // 15 minutes
const MAX_REQUESTS = 5;            // Max requests per window

// In-memory store (resets on cold start — acceptable for serverless)
const store = new Map<string, RateLimitEntry>();

/**
 * Clean up expired entries from the store.
 * Called periodically to prevent memory leaks.
 */
function cleanupExpired(): void {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    entry.timestamps = entry.timestamps.filter(t => now - t < WINDOW_MS);
    if (entry.timestamps.length === 0) {
      store.delete(key);
    }
  }
}

/**
 * Check if a request from the given IP is allowed.
 * Uses a sliding window approach.
 *
 * @param ip - The client's IP address
 * @returns Object with `allowed` boolean and optional `retryAfter` (seconds)
 */
export function checkRateLimit(ip: string): {
  allowed: boolean;
  remaining: number;
  retryAfter?: number;
} {
  const now = Date.now();

  // Periodic cleanup (every 100th check)
  if (Math.random() < 0.01) {
    cleanupExpired();
  }

  const entry = store.get(ip);

  if (!entry) {
    // First request from this IP
    store.set(ip, { timestamps: [now] });
    return { allowed: true, remaining: MAX_REQUESTS - 1 };
  }

  // Remove timestamps outside the current window
  entry.timestamps = entry.timestamps.filter(t => now - t < WINDOW_MS);

  if (entry.timestamps.length >= MAX_REQUESTS) {
    // Rate limit exceeded
    const oldestInWindow = entry.timestamps[0];
    const retryAfter = Math.ceil((oldestInWindow + WINDOW_MS - now) / 1000);
    return {
      allowed: false,
      remaining: 0,
      retryAfter,
    };
  }

  // Allow the request
  entry.timestamps.push(now);
  return {
    allowed: true,
    remaining: MAX_REQUESTS - entry.timestamps.length,
  };
}
