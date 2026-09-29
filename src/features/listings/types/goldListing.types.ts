import type { ListingCategory } from '@/navigation/types';
import type { ServiceMediaAsset } from '@/features/listings/types/serviceMedia.types';
import type { ListingOwner } from '@/features/listings/types/listingOwner.types';
import type { ListingRfq } from '@/features/listings/types/listingRfq.types';

export type GoldListing = {
  id: string;
  category: ListingCategory;
  title: string;
  reference?: string;
  description: string;
  weight: string;
  purityLabel: string;
  price: string;
  /** Epoch ms bidding opens. Sent on create; the auction service owns the schedule after that. */
  auctionStartDate?: number | null;
  /** Epoch ms the auction closes, or null if not set. */
  auctionEndDate: number | null;
  location: string;
  media: ServiceMediaAsset[];
  postedAs: 'buyer' | 'supplier';
  ownerId?: string;
  owner?: ListingOwner;
  rfq?: ListingRfq;
  createdAt: number;
};
