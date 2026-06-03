import { env } from "@/config/env";

const WINDOW_MS = 60_000;
const WINDOW_SEC = 60;
const MAX_REQUESTS = 10;

type Bucket = {
  count: number;
  resetAt: number;
};

type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  retryAfterMs?: number;
};

const buckets = new Map<string, Bucket>();

function checkMemoryRateLimit(key: string, limit: number): RateLimitResult {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || now > bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, remaining: limit - 1 };
  }

  if (bucket.count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterMs: bucket.resetAt - now,
    };
  }

  bucket.count += 1;
  return { allowed: true, remaining: limit - bucket.count };
}

async function upstashFetch(path: string, init?: RequestInit) {
  const url = env.UPSTASH_REDIS_REST_URL!;
  const token = env.UPSTASH_REDIS_REST_TOKEN!;
  const response = await fetch(`${url}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      ...init?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`Upstash request failed: ${response.status}`);
  }

  return response.json() as Promise<{ result: number }>;
}

async function checkUpstashRateLimit(
  key: string,
  limit: number,
): Promise<RateLimitResult | null> {
  if (!env.UPSTASH_REDIS_REST_URL || !env.UPSTASH_REDIS_REST_TOKEN) {
    return null;
  }

  try {
    const redisKey = `rl:${key}`;
    const { result: count } = await upstashFetch(
      `/incr/${encodeURIComponent(redisKey)}`,
    );

    if (count === 1) {
      await upstashFetch(
        `/expire/${encodeURIComponent(redisKey)}/${WINDOW_SEC}`,
      );
    }

    if (count > limit) {
      const { result: ttl } = await upstashFetch(
        `/ttl/${encodeURIComponent(redisKey)}`,
      );
      return {
        allowed: false,
        remaining: 0,
        retryAfterMs: (ttl > 0 ? ttl : WINDOW_SEC) * 1000,
      };
    }

    return { allowed: true, remaining: Math.max(0, limit - count) };
  } catch {
    return null;
  }
}

/** Rate limit distribuído (Upstash) com fallback em memória por instância. */
export async function checkRateLimit(
  key: string,
  limit = MAX_REQUESTS,
): Promise<RateLimitResult> {
  const distributed = await checkUpstashRateLimit(key, limit);
  if (distributed) return distributed;
  return checkMemoryRateLimit(key, limit);
}
