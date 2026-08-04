import { createClient } from 'redis';
import { env } from './env';

export const redisClient = createClient({ url: env.redisUrl });

redisClient.on('error', (err) => {
  console.error('Redis client error:', err);
});

export async function connectRedis(): Promise<void> {
  await redisClient.connect();
  console.log('Redis connected');
}

export async function disconnectRedis(): Promise<void> {
  await redisClient.disconnect();
  console.log('Redis disconnected');
}
