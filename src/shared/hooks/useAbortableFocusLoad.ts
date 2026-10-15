import React from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { isAbortError } from '@/shared/utils/isAbortError';

type Loader = (signal: AbortSignal) => Promise<void>;

/**
 * Runs `loader` on focus (and on pull-to-refresh / retry), aborting the prior
 * in-flight call when the screen blurs or deps change so a stale response
 * cannot overwrite fresher state.
 */
export function useAbortableFocusLoad(
  loader: Loader,
  deps: React.DependencyList,
  options?: { minIntervalMs?: number },
): {
  loadError: boolean;
  refreshing: boolean;
  onRefresh: () => void;
  retry: () => void;
} {
  const [loadError, setLoadError] = React.useState(false);
  const [refreshing, setRefreshing] = React.useState(false);
  const loaderRef = React.useRef(loader);
  loaderRef.current = loader;
  const optionsRef = React.useRef(options);
  optionsRef.current = options;
  const lastSuccessAt = React.useRef(0);
  const lastDeps = React.useRef<React.DependencyList | null>(null);
  const pullAbortRef = React.useRef<AbortController | null>(null);

  const run = React.useCallback(async (signal: AbortSignal, asPull = false) => {
    if (asPull) setRefreshing(true);
    try {
      await loaderRef.current(signal);
      if (!signal.aborted) {
        lastSuccessAt.current = Date.now();
        setLoadError(false);
      }
    } catch (error) {
      if (isAbortError(error) || signal.aborted) return;
      setLoadError(true);
    } finally {
      if (asPull && !signal.aborted) setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      const depsChanged =
        lastDeps.current == null ||
        lastDeps.current.length !== deps.length ||
        lastDeps.current.some((value, index) => value !== deps[index]);
      lastDeps.current = deps;
      const minIntervalMs = optionsRef.current?.minIntervalMs ?? 0;
      if (
        !depsChanged &&
        minIntervalMs > 0 &&
        Date.now() - lastSuccessAt.current < minIntervalMs
      ) {
        return undefined;
      }
      const ac = new AbortController();
      void run(ac.signal);
      return () => {
        ac.abort();
      };
      // Intentionally tied to caller-provided deps (role, etc.).
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps),
  );

  const onRefresh = React.useCallback(() => {
    pullAbortRef.current?.abort();
    const ac = new AbortController();
    pullAbortRef.current = ac;
    void run(ac.signal, true);
  }, [run]);

  const retry = React.useCallback(() => {
    pullAbortRef.current?.abort();
    const ac = new AbortController();
    pullAbortRef.current = ac;
    void run(ac.signal);
  }, [run]);

  return { loadError, refreshing, onRefresh, retry };
}
