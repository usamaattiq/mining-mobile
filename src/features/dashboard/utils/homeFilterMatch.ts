import type { EquipmentListing } from '@/features/listings/types/equipmentListing.types';
import type { GoldListing } from '@/features/listings/types/goldListing.types';
import type { ServiceListing } from '@/features/listings/types/serviceListing.types';

export function parseFilterNumber(value: string | null | undefined): number | null {
  if (!value?.trim()) return null;
  const parsed = Number(value.replace(/,/g, '').trim());
  return Number.isFinite(parsed) ? parsed : null;
}

export function inNumericRange(
  value: number | null,
  min: number | null,
  max: number | null,
): boolean {
  if (min == null && max == null) return true;
  if (value == null) return false;
  if (min != null && value < min) return false;
  if (max != null && value > max) return false;
  return true;
}

function firstAmount(...values: string[]): number | null {
  for (const value of values) {
    const parsed = parseFilterNumber(value);
    if (parsed != null) return parsed;
  }
  return null;
}

export function equipmentListingAmount(listing: EquipmentListing): number | null {
  if (listing.mode === 'sell') return parseFilterNumber(listing.salePrice);
  return firstAmount(listing.hourlyRental, listing.weeklyRental, listing.monthlyRental);
}

export function serviceListingAmount(listing: ServiceListing): number | null {
  return parseFilterNumber(listing.price);
}

export function goldListingAmount(listing: GoldListing): number | null {
  return parseFilterNumber(listing.price);
}

export function goldListingWeight(listing: GoldListing): number | null {
  return parseFilterNumber(listing.weight);
}

export function matchesGoldKarat(purityLabel: string, karatKey: string): boolean {
  if (karatKey === 'all') return true;
  const karat = karatKey.replace(/k$/i, '');
  const match = purityLabel.match(/(\d{1,2})/);
  return match?.[1] === karat;
}
