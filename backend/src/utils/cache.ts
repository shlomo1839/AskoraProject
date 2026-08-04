import { redisClient } from '../config/redis';

/**
 * Retrieves a cached value by key. Returns null on miss or if Redis is down.
 */
export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    const raw = await redisClient.get(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
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
  } catch {
    // Silently fail
  }
}
