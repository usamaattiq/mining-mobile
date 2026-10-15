import type { ListingCategory, RootStackParamList } from '@/navigation/types';

type PendingListing = { id: string; category: ListingCategory };

let pending: PendingListing | null = null;

export function rememberListingLink(category: string, id: string): void {
  if (category !== 'equipment' && category !== 'services' && category !== 'gold') return;
  if (!id) return;
  pending = { category, id: decodeURIComponent(id) };
}

export function takePendingListing(): PendingListing | null {
  const next = pending;
  pending = null;
  return next;
}

export function routesAfterAuth(): {
  index: number;
  routes: Array<
    | { name: 'Dashboard' }
    | { name: 'CompleteListingDetail'; params: { id: string; category: ListingCategory } }
  >;
} {
  const listing = takePendingListing();
  if (!listing) {
    return { index: 0, routes: [{ name: 'Dashboard' }] };
  }
  return {
    index: 1,
    routes: [{ name: 'Dashboard' }, { name: 'CompleteListingDetail', params: listing }],
  };
}

export function welcomeAfterSignUp(): RootStackParamList['Welcome'] {
  const listing = takePendingListing();
  if (!listing) return undefined;
  return { next: 'listings', category: listing.category, listingId: listing.id };
}
