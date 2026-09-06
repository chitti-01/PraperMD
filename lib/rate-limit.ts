import { NextRequest } from 'next/server';

interface RateLimitStore {
  count: number;
  resetTime: number;
}

const trackerMap = new Map<string, RateLimitStore>();

/**
 * Lightweight production-compatible sliding window rate limiter.
 * Protects endpoints like /api/upload, /api/papers/report, and downloads against abuse.
 */
export function checkRateLimit(
  request: NextRequest,
  options: { maxRequests: number; windowMs: number } = { maxRequests: 10, windowMs: 60 * 1000 }
): { success: boolean; limit: number; remaining: number; reset: number } {
  // Extract client IP address from proxy headers or socket
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const ip = (forwardedFor ? forwardedFor.split(',')[0] : realIp) || '127.0.0.1';

  const route = request.nextUrl.pathname;
  const key = `${ip}:${route}`;
  const now = Date.now();

  const record = trackerMap.get(key);

  if (!record || now > record.resetTime) {
    const newRecord: RateLimitStore = {
      count: 1,
      resetTime: now + options.windowMs,
    };
    trackerMap.set(key, newRecord);

    // Periodically prune stale entries to prevent memory growth
    if (trackerMap.size > 2000) {
      for (const [k, v] of trackerMap.entries()) {
        if (now > v.resetTime) trackerMap.delete(k);
      }
    }

    return {
      success: true,
      limit: options.maxRequests,
      remaining: options.maxRequests - 1,
      reset: Math.ceil(options.windowMs / 1000),
    };
  }

  if (record.count >= options.maxRequests) {
    return {
      success: false,
      limit: options.maxRequests,
      remaining: 0,
      reset: Math.ceil((record.resetTime - now) / 1000),
    };
  }

  record.count += 1;
  return {
    success: true,
    limit: options.maxRequests,
    remaining: options.maxRequests - record.count,
    reset: Math.ceil((record.resetTime - now) / 1000),
  };
}
