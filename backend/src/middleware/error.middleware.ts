import type { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  statusCode: number;
  code?: string;

  constructor(statusCode: number, message: string, code?: string) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
  }
}

export function notFoundHandler(req: Request, _res: Response, next: NextFunction): void {
  next(new AppError(404, `הנתיב לא נמצא: ${req.method} ${req.path}`));
}

export function errorHandler(
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const statusCode = err instanceof AppError ? err.statusCode : 500;
  const code = err instanceof AppError ? err.code : undefined;
  const message = err.message || 'שגיאה בשרת';

  if (statusCode === 500) {
    console.error(err);
  }

  res.status(statusCode).json({ message, ...(code ? { code } : {}) });
}
