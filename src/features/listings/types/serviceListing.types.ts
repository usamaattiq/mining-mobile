import type { ListingCategory, ServiceType } from '@/navigation/types';
import type { ServiceMediaAsset } from '@/features/listings/types/serviceMedia.types';
import type { ListingOwner } from '@/features/listings/types/listingOwner.types';
import type { ListingRfq } from '@/features/listings/types/listingRfq.types';

export type ServiceListing = {
  id: string;
  category: ListingCategory;
  serviceType: ServiceType;
  serviceCategoryLabel: string;
  title: string;
  description: string;
  yearsOfExperience: string;
  price: string;
  /** Epoch ms of the requested service date/time, or null if not set. */
  serviceDate: number | null;
  location: string;
  media: ServiceMediaAsset[];
  postedAs: 'buyer' | 'supplier';
  ownerId?: string;
  owner?: ListingOwner;
  rfq?: ListingRfq;
  createdAt: number;
};
