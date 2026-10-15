export const LISTING_LINK_ORIGIN = 'https://api.dahabi-sudan.com';

export type ListingShareCategory = 'equipment' | 'services' | 'gold';

/** HTTPS link for chats. Tapping it opens this listing in the app. */
export function listingShareUrl(category: ListingShareCategory, id: string): string {
  return `${LISTING_LINK_ORIGIN}/open/listing/${category}/${encodeURIComponent(id)}`;
}

export function listingAppUrl(category: string, id: string): string {
  return `miningmobile://listing/${category}/${encodeURIComponent(id)}`;
}
