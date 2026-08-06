import { AsyncLocalStorage } from 'node:async_hooks';
import { redisClient } from '../config/redis';

const ANSI = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
} as const;

export type CacheLogKind = 'HIT' | 'MISS' | 'INVALIDATE';

export interface CacheLogEvent {
  kind: CacheLogKind;
  key: string;
  message: string;
}

interface CacheStore {
  events: CacheLogEvent[];
}

export const cacheContext = new AsyncLocalStorage<CacheStore>();

const CACHE_LOG_STYLES: Record<
  CacheLogKind,
  { emoji: string; color: string; message: string }
> = {
  HIT: {
    emoji: '🟢',
    color: ANSI.green,
    message: 'Data retrieved from Redis',
  },
  MISS: {
    emoji: '🔴',
    color: ANSI.red,
    message: 'Fetching from Database...',
  },
  INVALIDATE: {
    emoji: '🟡',
    color: ANSI.yellow,
    message: 'Cache cleared/updated',
  },
};

function logCache(kind: CacheLogKind, key: string): void {
  const { emoji, color, message } = CACHE_LOG_STYLES[kind];
  const event: CacheLogEvent = { kind, key, message };

  cacheContext.getStore()?.events.push(event);

  console.log(
    `${color}${ANSI.bold}${emoji} [CACHE ${kind}] Key: ${key} - ${message}${ANSI.reset}`,
  );
}

export function getCacheEvents(): CacheLogEvent[] {
  return cacheContext.getStore()?.events ?? [];
}

/**
 * Retrieves a cached value by key. Returns null on miss or if Redis is down.
 */
export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    const raw = await redisClient.get(key);
    if (!raw) {
      logCache('MISS', key);
      return null;
    }
    logCache('HIT', key);
    return JSON.parse(raw) as T;
  } catch {
    logCache('MISS', key);
    return null;
  }
}

/**
 * Stores a value in Redis with a TTL (in seconds).
 */
export async function cacheSet(key: string, data: unknown, ttlSeconds: number): Promise<void> {
  try {
    await redisClient.set(key, JSON.stringify(data), { EX: ttlSeconds });
  } catch {
    // Silently fail – the app should work without cache
  }
}

/**
 * Deletes a single cache key.
 */
export async function cacheDelete(key: string): Promise<void> {
  try {
    await redisClient.del(key);
    logCache('INVALIDATE', key);
  } catch {
    // Silently fail
  }
}

/**
 * Deletes all keys matching a glob pattern (e.g. "versions:abc-*").
 * Uses SCAN to avoid blocking Redis.
 */
export async function cacheDeletePattern(pattern: string): Promise<void> {
  try {
    for await (const key of redisClient.scanIterator({ MATCH: pattern, COUNT: 100 })) {
      await redisClient.del(key);
    }
    logCache('INVALIDATE', pattern);
  } catch {
    // Silently fail
  }
}
