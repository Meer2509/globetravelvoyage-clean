import { headers } from "next/headers";

export type RateLimitBucket = "ai" | "form" | "upload";

interface BucketConfig {
  limit: number;
  windowSec: number;
}

const BUCKET_CONFIG: Record<RateLimitBucket, BucketConfig> = {
  ai: { limit: 20, windowSec: 60 },
  form: { limit: 10, windowSec: 60 },
  upload: { limit: 30, windowSec: 60 },
};

type MemoryEntry = { count: number; resetAt: number };

const memoryStore = new Map<string, MemoryEntry>();

function memoryRateLimit(
  bucket: RateLimitBucket,
  key: string
): { ok: true } | { ok: false; retryAfterSec: number } {
  const config = BUCKET_CONFIG[bucket];
  const storeKey = `${bucket}:${key}`;
  const now = Date.now();

  let entry = memoryStore.get(storeKey);
  if (!entry || entry.resetAt <= now) {
    entry = { count: 0, resetAt: now + config.windowSec * 1000 };
    memoryStore.set(storeKey, entry);
  }

  entry.count += 1;

  if (entry.count > config.limit) {
    const retryAfterSec = Math.max(1, Math.ceil((entry.resetAt - now) / 1000));
    return { ok: false, retryAfterSec };
  }

  return { ok: true };
}

async function upstashRateLimit(
  bucket: RateLimitBucket,
  key: string
): Promise<{ ok: true } | { ok: false; retryAfterSec: number }> {
  const url = process.env.UPSTASH_REDIS_REST_URL?.trim();
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();
  if (!url || !token) {
    return memoryRateLimit(bucket, key);
  }

  const config = BUCKET_CONFIG[bucket];
  const redisKey = `rl:${bucket}:${key}`;

  try {
    const res = await fetch(`${url}/pipeline`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify([
        ["INCR", redisKey],
        ["TTL", redisKey],
      ]),
      cache: "no-store",
    });

    if (!res.ok) {
      return memoryRateLimit(bucket, key);
    }

    const results = (await res.json()) as { result: number | null }[];
    const count = Number(results[0]?.result ?? 0);
    const ttl = Number(results[1]?.result ?? -1);

    if (count === 1 || ttl === -1) {
      await fetch(`${url}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(["EXPIRE", redisKey, config.windowSec]),
        cache: "no-store",
      });
    }

    if (count > config.limit) {
      const retryAfterSec = ttl > 0 ? ttl : config.windowSec;
      return { ok: false, retryAfterSec };
    }

    return { ok: true };
  } catch {
    return memoryRateLimit(bucket, key);
  }
}

export function getClientIpFromRequest(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }
  return request.headers.get("x-real-ip")?.trim() || "unknown";
}

export async function getRateLimitKey(userId?: string | null): Promise<string> {
  if (userId) return `user:${userId}`;

  const h = await headers();
  const forwarded = h.get("x-forwarded-for");
  if (forwarded) {
    return `ip:${forwarded.split(",")[0]?.trim() || "unknown"}`;
  }
  return `ip:${h.get("x-real-ip")?.trim() || "unknown"}`;
}

export async function checkRateLimit(
  bucket: RateLimitBucket,
  key: string
): Promise<{ ok: true } | { ok: false; retryAfterSec: number }> {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    return upstashRateLimit(bucket, key);
  }
  return memoryRateLimit(bucket, key);
}

export async function enforceRateLimit(
  bucket: RateLimitBucket,
  userId?: string | null
): Promise<{ ok: true } | { ok: false; error: string; retryAfterSec: number }> {
  const key = await getRateLimitKey(userId);
  const result = await checkRateLimit(bucket, key);
  if (!result.ok) {
    return {
      ok: false,
      error: "Too many requests. Please wait a moment and try again.",
      retryAfterSec: result.retryAfterSec,
    };
  }
  return { ok: true };
}

export function rateLimitHeaders(retryAfterSec: number): Record<string, string> {
  return { "Retry-After": String(retryAfterSec) };
}
