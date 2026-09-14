import type { ListingCategory } from '@/navigation/types';
import type { ServiceMediaAsset } from '@/features/listings/types/serviceMedia.types';

export type GoldListing = {
  id: string;
  category: ListingCategory;
  title: string;
  description: string;
  weight: string;
  purityLabel: string;
  price: string;
  /** Epoch ms the auction closes, or null if not set. */
  auctionEndDate: number | null;
  location: string;
  media: ServiceMediaAsset[];
  postedAs: 'buyer' | 'supplier';
  createdAt: number;
};
