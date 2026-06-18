import { Router } from 'express';
import mongoose from 'mongoose';

const router = Router();

router.get('/health', (_req, res) => {
  const dbConnected = mongoose.connection.readyState === 1;

  res.json({
    status: 'ok',
    db: dbConnected ? 'connected' : 'disconnected',
  });
});

export default router;