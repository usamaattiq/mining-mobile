import React from 'react';
import { listingsApi } from '@/features/listings/api/listingsApi';

export function useCatalogOptions(category: 'equipment' | 'services' | 'gold'): {
  value: string;
  label: string;
}[] {
  const [options, setOptions] = React.useState<{ value: string; label: string }[]>([]);

  React.useEffect(() => {
    let cancelled = false;
    void listingsApi.catalog(category).then((result) => {
      if (cancelled) return;
      setOptions(result.names.map((name) => ({ value: name, label: name })));
    });
    return () => {
      cancelled = true;
    };
  }, [category]);

  return options;
}
