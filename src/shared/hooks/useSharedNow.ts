import { useSyncExternalStore } from 'react';

type Clock = {
  now: number;
  listeners: Set<() => void>;
  timer: ReturnType<typeof setInterval> | null;
};

const clocks = new Map<number, Clock>();

function clockFor(tickMs: number): Clock {
  const existing = clocks.get(tickMs);
  if (existing) return existing;
  const created: Clock = { now: Date.now(), listeners: new Set(), timer: null };
  clocks.set(tickMs, created);
  return created;
}

function subscribe(tickMs: number, onStoreChange: () => void): () => void {
  const clock = clockFor(tickMs);
  clock.listeners.add(onStoreChange);
  if (!clock.timer) {
    clock.timer = setInterval(() => {
      clock.now = Date.now();
      clock.listeners.forEach((listener) => listener());
    }, tickMs);
  }
  return () => {
    clock.listeners.delete(onStoreChange);
    if (clock.listeners.size === 0 && clock.timer) {
      clearInterval(clock.timer);
      clock.timer = null;
    }
  };
}

/** One interval per tick rate, shared by every countdown on screen. */
export function useSharedNow(tickMs: number): number {
  return useSyncExternalStore(
    (onStoreChange) => subscribe(tickMs, onStoreChange),
    () => clockFor(tickMs).now,
  );
}
