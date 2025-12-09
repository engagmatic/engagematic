/**
 * Simple rate limiting for anonymous users
 * In production, use Redis or a proper rate limiting service
 */

// In-memory store for rate limiting (reset on server restart)
// In production, use Redis or MongoDB
const rateLimitStore = new Map();

/**
 * Check if anonymous user can perform action
 * @param {string} key - Rate limit key (e.g., IP address)
 * @param {number} maxRequests - Maximum requests allowed
 * @param {number} windowMs - Time window in milliseconds
 * @returns {Promise<{allowed: boolean, remaining: number, resetAt: Date}>}
 */
export async function checkAnonymousRateLimit(key, maxRequests = 1, windowMs = 24 * 60 * 60 * 1000) {
  const now = Date.now();
  const record = rateLimitStore.get(key);

  if (!record) {
    // First request
    rateLimitStore.set(key, {
      count: 1,
      resetAt: new Date(now + windowMs),
    });
    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetAt: new Date(now + windowMs),
    };
  }

  // Check if window has expired
  if (now > record.resetAt.getTime()) {
    // Reset window
    rateLimitStore.set(key, {
      count: 1,
      resetAt: new Date(now + windowMs),
    });
    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetAt: new Date(now + windowMs),
    };
  }

  // Check if limit exceeded
  if (record.count >= maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: record.resetAt,
    };
  }

  // Increment count
  record.count += 1;
  rateLimitStore.set(key, record);

  return {
    allowed: true,
    remaining: maxRequests - record.count,
    resetAt: record.resetAt,
  };
}

/**
 * Record anonymous usage
 * @param {string} key - Rate limit key
 */
export async function recordAnonymousUsage(key) {
  const record = rateLimitStore.get(key);
  if (record) {
    record.count += 1;
    rateLimitStore.set(key, record);
  }
}

/**
 * Clean up expired rate limit records (run periodically)
 */
export function cleanupExpiredRecords() {
  const now = Date.now();
  for (const [key, record] of rateLimitStore.entries()) {
    if (now > record.resetAt.getTime()) {
      rateLimitStore.delete(key);
    }
  }
}

// Clean up expired records every hour
setInterval(cleanupExpiredRecords, 60 * 60 * 1000);

