import type { NextFunction, Request, Response } from 'express';
import { cacheContext, getCacheEvents } from '../utils/cache';

export const CACHE_EVENTS_HEADER = 'X-Cache-Events';

/**
 * Collects cache HIT/MISS/INVALIDATE events for the request
 * and exposes them to the frontend via the X-Cache-Events header.
 */
export function cacheEventsMiddleware(_req: Request, res: Response, next: NextFunction): void {
  const events = { events: [] as ReturnType<typeof getCacheEvents> };

  cacheContext.run(events, () => {
    const originalJson = res.json.bind(res);
    const originalSend = res.send.bind(res);
    const originalEnd = res.end.bind(res);

    const attachHeader = (): void => {
      const collected = getCacheEvents();
      if (collected.length === 0 || res.headersSent) return;
      res.setHeader(CACHE_EVENTS_HEADER, JSON.stringify(collected));
    };

    res.json = ((body?: unknown) => {
      attachHeader();
      return originalJson(body);
    }) as Response['json'];

    res.send = ((body?: unknown) => {
      attachHeader();
      return originalSend(body);
    }) as Response['send'];

    res.end = ((...args: Parameters<Response['end']>) => {
      attachHeader();
      return originalEnd(...args);
    }) as Response['end'];

    next();
  });
}
