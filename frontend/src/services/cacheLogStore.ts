export type CacheLogKind = 'HIT' | 'MISS' | 'INVALIDATE';

export interface CacheLogEvent {
  kind: CacheLogKind;
  key: string;
  message: string;
  at: number;
}

type Listener = (events: CacheLogEvent[]) => void;

const MAX_EVENTS = 40;
let events: CacheLogEvent[] = [];
const listeners = new Set<Listener>();

function notify(): void {
  const snapshot = [...events];
  listeners.forEach((listener) => listener(snapshot));
}

export const cacheLogStore = {
  getEvents(): CacheLogEvent[] {
    return [...events];
  },

  push(incoming: Omit<CacheLogEvent, 'at'>[]): void {
    if (incoming.length === 0) return;
    const stamped = incoming.map((event) => ({ ...event, at: Date.now() }));
    events = [...stamped, ...events].slice(0, MAX_EVENTS);
    notify();
  },

  clear(): void {
    events = [];
    notify();
  },

  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    listener([...events]);
    return () => listeners.delete(listener);
  },
};
