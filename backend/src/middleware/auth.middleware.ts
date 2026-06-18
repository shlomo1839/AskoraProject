import type { Request, Response, NextFunction } from 'express';
import { AppError } from './error.middleware';
import { verifyToken } from '../utils/jwt';
import type { AuthRequest } from '../types/auth-request';

export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    next(new AppError(401, 'נדרשת התחברות'));
    return;
  }

  const token = authHeader.slice(7);

  try {
    const payload = verifyToken(token);
    (req as AuthRequest).userId = payload.userId;
    next();
  } catch {
    next(new AppError(401, 'טוקן לא תקין או שפג תוקפו'));
  }
}
