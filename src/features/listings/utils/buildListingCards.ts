import type { TFunction } from 'i18next';
import type { ListingCategory } from '@/navigation/types';
import type { EquipmentListing } from '@/features/listings/types/equipmentListing.types';
import type { ServiceListing } from '@/features/listings/types/serviceListing.types';
import type { GoldListing } from '@/features/listings/types/goldListing.types';
import type { ListingCardProps } from '@/features/listings/types/listingCard.types';
import { cityFromLocationLabel } from '@/shared/utils/locationLabel';
import { formatAmountWithCommas } from '@/shared/utils/formatAmount';
import { rfqStatusBadge, isEndedRfqStatus } from '@/features/listings/utils/rfqStatus';
import { serviceTypeLabels } from '@/features/listings/utils/serviceType';

export type ListingCardItem = ListingCardProps & { id: string };

export type BuildListingCardsInput = {
  category: ListingCategory;
  equipmentListings: EquipmentListing[];
  serviceListings: ServiceListing[];
  goldListings: GoldListing[];
  t: TFunction;
  currencyCode: string;
  onOpen: (id: string, category: ListingCategory) => void;
  onRepost?: (id: string, category: ListingCategory) => void;
};

function listingHasEnded(input: {
  rfqStatus?: string;
  expiresAt?: number | null;
  auctionEndDate?: number | null;
  createdAt: number;
}): boolean {
  if (isEndedRfqStatus(input.rfqStatus)) return true;
  const end = input.expiresAt ?? input.auctionEndDate ?? input.createdAt + 24 * 60 * 60 * 1000;
  return Date.now() >= end;
}

function cityFromLocation(location: string | undefined): string | undefined {
  const city = cityFromLocationLabel(location ?? '');
  return city || undefined;
}

function priceText(currencyCode: string, amount: string): string | undefined {
  return amount ? `${currencyCode} ${formatAmountWithCommas(amount)}` : undefined;
}

function rentalPrice(
  listing: EquipmentListing,
  t: TFunction,
  currencyCode: string,
): { priceText: string | undefined; priceUnit: string | undefined } {
  if (listing.hourlyRental) {
    return {
      priceText: priceText(currencyCode, listing.hourlyRental),
      priceUnit: t('equipmentListing.hourlyUnit'),
    };
  }
  if (listing.weeklyRental) {
    return {
      priceText: priceText(currencyCode, listing.weeklyRental),
      priceUnit: t('equipmentListing.weeklyUnit'),
    };
  }
  if (listing.monthlyRental) {
    return {
      priceText: priceText(currencyCode, listing.monthlyRental),
      priceUnit: t('equipmentListing.monthlyUnit'),
    };
  }
  if (listing.yearlyRental) {
    return {
      priceText: priceText(currencyCode, listing.yearlyRental),
      priceUnit: t('equipmentListing.yearlyUnit'),
    };
  }
  return { priceText: undefined, priceUnit: undefined };
}

/** Maps store listings into ListingCard rows for Requests and Home. */
export function buildListingCards({
  category,
  equipmentListings,
  serviceListings,
  goldListings,
  t,
  currencyCode,
  onOpen,
  onRepost,
}: BuildListingCardsInput): ListingCardItem[] {
  if (category === 'equipment') {
    return equipmentListings.map((listing) => {
      const offersRent = listing.mode === 'rent' || listing.mode === 'both';
      const offersSell = listing.mode === 'sell' || listing.mode === 'both';
      const rental = rentalPrice(listing, t, currencyCode);
      const price = rental.priceText
        ? rental
        : { priceText: priceText(currencyCode, listing.salePrice), priceUnit: undefined };
      const durationBadges = offersRent
        ? [
            listing.hourlyRental
              ? { key: 'hourly', label: t('equipmentListing.hourlyBadge') }
              : null,
            listing.weeklyRental
              ? { key: 'weekly', label: t('equipmentListing.weeklyBadge') }
              : null,
            listing.monthlyRental
              ? { key: 'monthly', label: t('equipmentListing.monthlyBadge') }
              : null,
            listing.yearlyRental
              ? { key: 'yearly', label: t('equipmentListing.yearlyBadge') }
              : null,
          ].filter((badge): badge is { key: string; label: string } => Boolean(badge))
        : [];

      return {
        id: listing.id,
        title: listing.title,
        reference: listing.reference,
        thumbnail: listing.media.find((item) => item.kind === 'photo')?.uri,
        placeholderIcon: 'construct-outline',
        subtitle: `${listing.equipmentTypeLabel} · ${t('equipmentListing.unitsCount', { count: listing.postedAs === 'supplier' ? (listing.availableUnits ?? listing.units) : listing.units })}`,
        subtitleIcon: 'construct-outline',
        typeBadge: rfqStatusBadge(t, listing.rfq) ?? undefined,
        requestBadge:
          listing.postedAs === 'buyer'
            ? {
                key: 'request-mode',
                label:
                  listing.requestMode === 'auction'
                    ? t('equipmentListing.requestAuction')
                    : t('equipmentListing.requestRfq'),
              }
            : undefined,
        city: cityFromLocation(listing.location),
        durationBadges,
        deliveryBadge: listing.postedAs !== 'buyer' && listing.deliveryAvailable
          ? {
              key: 'delivery',
              label: t('equipmentListing.deliveryBadge'),
              icon: 'car-outline',
            }
          : undefined,
        statusBadges:
          listing.postedAs === 'buyer'
            ? []
            : [
                offersRent ? { key: 'rent', label: t('equipmentListing.rent') } : null,
                offersSell ? { key: 'sell', label: t('equipmentListing.sell') } : null,
              ].filter((badge): badge is { key: string; label: string } => Boolean(badge)),
        priceText: listing.postedAs === 'buyer' ? undefined : price.priceText,
        priceUnit: price.priceUnit,
        createdAt: listing.postedAs === 'supplier' ? undefined : listing.createdAt,
        expiresAt: listing.postedAs === 'supplier' ? undefined : listing.rfq?.expiresAt ?? undefined,
        ended:
          listing.postedAs === 'supplier'
            ? Date.now() >= listing.createdAt + 365 * 24 * 60 * 60 * 1000
            : listingHasEnded({
                rfqStatus: listing.rfq?.status,
                expiresAt: listing.rfq?.expiresAt,
                createdAt: listing.createdAt,
              }),
        onRepost: onRepost ? () => onRepost(listing.id, 'equipment') : undefined,
        onPress: () => onOpen(listing.id, 'equipment'),
      };
    });
  }

  if (category === 'services') {
    return serviceListings.map((listing) => ({
      id: listing.id,
      title: listing.title,
      reference: listing.reference,
      thumbnail: listing.media.find((item) => item.kind === 'photo')?.uri,
      placeholderIcon: 'briefcase-outline',
      subtitle: listing.serviceCategoryLabel,
      subtitleIcon: 'briefcase-outline',
      typeBadge: rfqStatusBadge(t, listing.rfq) ?? undefined,
      city: cityFromLocation(listing.location),
      statusBadges: [
        ...serviceTypeLabels(t, listing.serviceType).map((label) => ({
          key: label,
          label,
        })),
      ],
      priceText: listing.postedAs === 'buyer' ? undefined : priceText(currencyCode, listing.price),
      createdAt: listing.createdAt,
      expiresAt: listing.rfq?.expiresAt ?? undefined,
      ended: listingHasEnded({
        rfqStatus: listing.rfq?.status,
        expiresAt: listing.rfq?.expiresAt,
        createdAt: listing.createdAt,
      }),
      onRepost: onRepost ? () => onRepost(listing.id, 'services') : undefined,
      onPress: () => onOpen(listing.id, 'services'),
    }));
  }

  return goldListings.map((listing) => ({
    id: listing.id,
    title: listing.title,
    reference: listing.reference,
    thumbnail: listing.media.find((item) => item.kind === 'photo')?.uri,
    placeholderIcon: 'diamond-outline',
    subtitleIcon: 'diamond-outline',
    subtitle:
      [
        listing.weight ? t('goldListing.weightValue', { weight: listing.weight }) : null,
        listing.purityLabel,
      ]
        .filter((part): part is string => Boolean(part))
        .join(' · ') || undefined,
    city: cityFromLocation(listing.location),
    typeBadge: rfqStatusBadge(t, listing.rfq) ?? undefined,
    priceText: listing.postedAs === 'buyer' ? undefined : priceText(currencyCode, listing.price),
    createdAt: listing.createdAt,
    expiresAt: listing.rfq?.expiresAt ?? listing.auctionEndDate ?? undefined,
    ended: listingHasEnded({
      rfqStatus: listing.rfq?.status,
      expiresAt: listing.rfq?.expiresAt,
      auctionEndDate: listing.auctionEndDate,
      createdAt: listing.createdAt,
    }),
    onRepost: onRepost ? () => onRepost(listing.id, 'gold') : undefined,
    onPress: () => onOpen(listing.id, 'gold'),
  }));
}
