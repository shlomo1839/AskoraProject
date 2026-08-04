import { Router } from 'express';
import mongoose from 'mongoose';
import { redisClient } from '../config/redis';

const router = Router();

router.get('/health', async (_req, res) => {
  const dbConnected = mongoose.connection.readyState === 1;

  let redisConnected = false;
  try {
    const pong = await redisClient.ping();
    redisConnected = pong === 'PONG';
  } catch {
    redisConnected = false;
  }

  res.json({
    status: dbConnected && redisConnected ? 'ok' : 'degraded',
    db: dbConnected ? 'connected' : 'disconnected',
    redis: redisConnected ? 'connected' : 'disconnected',
  });
});

export default router;