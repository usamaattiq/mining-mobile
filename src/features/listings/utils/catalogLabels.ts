import React from 'react';
import { listingsApi } from '@/features/listings/api/listingsApi';
import { useLanguage } from '@/i18n/hooks/useLanguage';
import type { SelectFieldOption } from '@/shared/types/selectField.types';

export type CatalogCategory = 'equipment' | 'services' | 'gold';

export type CatalogItem = {
  id: string;
  name: string;
  nameAr?: string | null;
  parentId: string | null;
};

const CATEGORY_ICON = {
  equipment: 'construct-outline',
  services: 'briefcase-outline',
  gold: 'diamond-outline',
} as const;

let cache: Record<CatalogCategory, CatalogItem[]> | null = null;
let loading: Promise<void> | null = null;
const listeners = new Set<() => void>();

function notify(): void {
  listeners.forEach((listener) => listener());
}

export function catalogDisplayName(item: { name: string; nameAr?: string | null }, language: string): string {
  const arabic = item.nameAr?.trim();
  return language.startsWith('ar') && arabic ? arabic : item.name;
}

async function ensureCatalog(): Promise<void> {
  if (cache) return;
  if (!loading) {
    loading = Promise.all(
      (['equipment', 'services', 'gold'] as CatalogCategory[]).map(async (category) => {
        const result = await listingsApi.catalog(category);
        const items =
          result.items ?? result.names.map((name) => ({ id: name, name, parentId: null }));
        return [category, items] as const;
      }),
    )
      .then((entries) => {
        cache = {
          equipment: [],
          services: [],
          gold: [],
          ...Object.fromEntries(entries),
        };
        notify();
      })
      .finally(() => {
        loading = null;
      });
  }
  await loading;
}

export function invalidateCatalogCache(): void {
  cache = null;
}

function useCatalogCache(): Record<CatalogCategory, CatalogItem[]> | null {
  const [, setTick] = React.useState(0);
  React.useEffect(() => {
    const listener = () => setTick((value) => value + 1);
    listeners.add(listener);
    void ensureCatalog();
    return () => {
      listeners.delete(listener);
    };
  }, []);
  return cache;
}

export function useCatalogOptions(category: CatalogCategory): SelectFieldOption[] {
  const { currentLanguage } = useLanguage();
  const catalog = useCatalogCache();
  const items = catalog?.[category] ?? [];
  const nameById = new Map(items.map((item) => [item.id, item.name]));
  return items.map((item) => ({
    value: item.name,
    label: catalogDisplayName(item, currentLanguage),
    icon: CATEGORY_ICON[category],
    parentValue: item.parentId ? (nameById.get(item.parentId) ?? null) : null,
  }));
}

export function useLocalizedCatalogLabel(): (category: CatalogCategory, storedName: string) => string {
  const { currentLanguage } = useLanguage();
  const catalog = useCatalogCache();
  return React.useCallback(
    (category: CatalogCategory, storedName: string) => {
      const match = catalog?.[category]?.find((item) => item.name === storedName);
      return match ? catalogDisplayName(match, currentLanguage) : storedName;
    },
    [catalog, currentLanguage],
  );
}
