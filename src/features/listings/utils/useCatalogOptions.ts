import React from 'react';
import { listingsApi } from '@/features/listings/api/listingsApi';
import type { SelectFieldOption } from '@/shared/types/selectField.types';

export function useCatalogOptions(category: 'equipment' | 'services' | 'gold'): SelectFieldOption[] {
  const [options, setOptions] = React.useState<SelectFieldOption[]>([]);

  React.useEffect(() => {
    let cancelled = false;
    void listingsApi.catalog(category).then((result) => {
      if (cancelled) return;
      const items = result.items ?? result.names.map((name) => ({ id: name, name, parentId: null }));
      const nameById = new Map(items.map((item) => [item.id, item.name]));
      setOptions(
        items.map((item) => ({
          value: item.name,
          label: item.name,
          parentValue: item.parentId ? nameById.get(item.parentId) ?? null : null,
        })),
      );
    });
    return () => {
      cancelled = true;
    };
  }, [category]);

  return options;
}
