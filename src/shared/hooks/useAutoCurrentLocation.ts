import { useEffect, useRef } from 'react';

/**
 * Fills the current location once when a step becomes active and the field is still empty.
 * `load` should write the selection into state and resolve when finished.
 */
export function useAutoCurrentLocation(
  enabled: boolean,
  hasLocation: boolean,
  load: () => Promise<unknown>,
): void {
  const started = useRef(false);

  useEffect(() => {
    if (!enabled || started.current || hasLocation) return;
    started.current = true;
    void load();
  }, [enabled, hasLocation, load]);
}
