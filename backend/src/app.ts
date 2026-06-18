import express from 'express';
import cors from 'cors';
import healthRoutes from './routes/health.routes';
import authRoutes from './routes/auth.routes';
import surveyRoutes from './routes/survey.routes';
import submissionRoutes from './routes/submission.routes';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.use('/api', healthRoutes);
  app.use('/api', authRoutes);
  app.use('/api', surveyRoutes);
  app.use('/api', submissionRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
