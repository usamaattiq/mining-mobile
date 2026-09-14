import type { TFunction } from 'i18next';
import type { ListingCategory } from '@/navigation/types';
import type { EquipmentListing } from '@/features/listings/types/equipmentListing.types';
import type { ServiceListing } from '@/features/listings/types/serviceListing.types';
import type { GoldListing } from '@/features/listings/types/goldListing.types';
import type { ListingCardProps } from '@/features/listings/types/listingCard.types';
import { cityFromLocationLabel } from '@/shared/utils/locationLabel';
import { formatAmountWithCommas } from '@/shared/utils/formatAmount';

export type ListingCardItem = ListingCardProps & { id: string };

export type BuildListingCardsInput = {
  category: ListingCategory;
  equipmentListings: EquipmentListing[];
  serviceListings: ServiceListing[];
  goldListings: GoldListing[];
  t: TFunction;
  currencyCode: string;
  locale: string;
  onOpen: (id: string, category: ListingCategory) => void;
};

function formatDateTime(locale: string, epoch: number | null | undefined): string | undefined {
  if (!epoch) return undefined;
  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(epoch));
}

function cityFromLocation(location: string | undefined): string | undefined {
  const city = cityFromLocationLabel(location ?? '');
  return city || undefined;
}

function priceText(currencyCode: string, amount: string): string | undefined {
  return amount ? `${currencyCode} ${formatAmountWithCommas(amount)}` : undefined;
}

function equipmentPrice(
  listing: EquipmentListing,
  t: TFunction,
  currencyCode: string,
): { priceText: string | undefined; priceUnit: string | undefined } {
  if (listing.mode === 'sell') {
    return { priceText: priceText(currencyCode, listing.salePrice), priceUnit: undefined };
  }
  if (listing.hourlyRental) {
    return {
      priceText: priceText(currencyCode, listing.hourlyRental),
      priceUnit: t('equipmentListing.cardHourlyUnit'),
    };
  }
  if (listing.weeklyRental) {
    return {
      priceText: priceText(currencyCode, listing.weeklyRental),
      priceUnit: t('equipmentListing.cardWeeklyUnit'),
    };
  }
  if (listing.monthlyRental) {
    return {
      priceText: priceText(currencyCode, listing.monthlyRental),
      priceUnit: t('equipmentListing.cardMonthlyUnit'),
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
  locale,
  onOpen,
}: BuildListingCardsInput): ListingCardItem[] {
  if (category === 'equipment') {
    return equipmentListings.map((listing) => {
      const isRent = listing.mode === 'rent';
      const { priceText: amount, priceUnit } = equipmentPrice(listing, t, currencyCode);
      const durationBadges = isRent
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
          ].filter((badge): badge is { key: string; label: string } => Boolean(badge))
        : [];

      return {
        id: listing.id,
        title: listing.title,
        thumbnail: listing.media.find((item) => item.kind === 'photo')?.uri,
        placeholderIcon: 'construct-outline',
        subtitle: `${listing.equipmentTypeLabel} · ${t('equipmentListing.unitsCount', { count: listing.units })}`,
        subtitleIcon: 'construct-outline',
        city: cityFromLocation(listing.location),
        durationBadges,
        topDateText: durationBadges.length === 0 ? formatDateTime(locale, listing.createdAt) : undefined,
        deliveryBadge: listing.deliveryAvailable
          ? {
              key: 'delivery',
              label: t('equipmentListing.deliveryBadge'),
              icon: 'car-outline',
            }
          : undefined,
        statusBadges: [
          {
            key: 'mode',
            label: t(isRent ? 'equipmentListing.rent' : 'equipmentListing.sell'),
          },
        ],
        priceText: amount,
        priceUnit,
        createdAt: listing.createdAt,
        onPress: () => onOpen(listing.id, 'equipment'),
      };
    });
  }

  if (category === 'services') {
    return serviceListings.map((listing) => ({
      id: listing.id,
      title: listing.title,
      thumbnail: listing.media.find((item) => item.kind === 'photo')?.uri,
      placeholderIcon: 'briefcase-outline',
      subtitle: listing.serviceCategoryLabel,
      subtitleIcon: 'briefcase-outline',
      city: cityFromLocation(listing.location),
      topDateText: formatDateTime(locale, listing.serviceDate ?? listing.createdAt),
      statusBadges: [
        {
          key: 'serviceType',
          label: t(
            listing.serviceType === 'onsite' ? 'serviceListing.onsite' : 'serviceListing.online',
          ),
        },
      ],
      priceText: priceText(currencyCode, listing.price),
      createdAt: listing.createdAt,
      onPress: () => onOpen(listing.id, 'services'),
    }));
  }

  return goldListings.map((listing) => ({
    id: listing.id,
    title: listing.title,
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
    topDateText: formatDateTime(locale, listing.auctionEndDate ?? listing.createdAt),
    priceText: priceText(currencyCode, listing.price),
    createdAt: listing.createdAt,
    onPress: () => onOpen(listing.id, 'gold'),
  }));
}
