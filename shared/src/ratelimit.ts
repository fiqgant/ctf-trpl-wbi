import type { RateLimitResult } from './types.js';

const buckets = new Map<string, { count: number; resetAt: number }>();

function nowMs(): number {
  return Date.now();
}

export function getClientIdentifier(request: Request): string {
  const ip = request.headers.get('cf-connecting-ip');
  if (ip) {
    return ip;
  }

  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0]!.trim();
  }

  return 'anonymous-client';
}

export function consumeRateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const current = nowMs();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= current) {
    buckets.set(key, { count: 1, resetAt: current + windowMs });
    return {
      allowed: true,
      remaining: Math.max(0, limit - 1),
      retryAfterSeconds: Math.ceil(windowMs / 1000),
      limit
    };
  }

  if (bucket.count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.max(1, Math.ceil((bucket.resetAt - current) / 1000)),
      limit
    };
  }

  bucket.count += 1;

  return {
    allowed: true,
    remaining: Math.max(0, limit - bucket.count),
    retryAfterSeconds: Math.max(1, Math.ceil((bucket.resetAt - current) / 1000)),
    limit
  };
}

export function rateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    'X-RateLimit-Limit': String(result.limit),
    'X-RateLimit-Remaining': String(result.remaining),
    'Retry-After': String(result.retryAfterSeconds)
  };
}
