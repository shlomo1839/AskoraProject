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

// Returns the user id when a valid token is present, otherwise null.
// Used on public routes that behave differently for the resource owner.
export function getOptionalUserId(req: Request): string | null {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }

  try {
    return verifyToken(authHeader.slice(7)).userId;
  } catch {
    return null;
  }
}
