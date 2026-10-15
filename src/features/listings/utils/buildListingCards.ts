import type { TFunction } from 'i18next';
import type { ListingCategory } from '@/navigation/types';
import type { EquipmentListing } from '@/features/listings/types/equipmentListing.types';
import type { ServiceListing } from '@/features/listings/types/serviceListing.types';
import type { GoldListing } from '@/features/listings/types/goldListing.types';
import type {
  ListingCardProps,
  ListingCardBadge,
} from '@/features/listings/types/listingCard.types';
import { cityFromLocationLabel } from '@/shared/utils/locationLabel';
import { formatAmountWithCommas } from '@/shared/utils/formatAmount';
import { rfqStatusBadge, isEndedRfqStatus } from '@/features/listings/utils/rfqStatus';
import { serviceTypeLabels, resolveServicePrices } from '@/features/listings/utils/serviceType';

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
  catalogLabel?: (category: ListingCategory, storedName: string) => string;
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

function activityBadge(
  t: TFunction,
  rfq: Parameters<typeof rfqStatusBadge>[1],
  ended: boolean,
): ListingCardBadge {
  return (
    rfqStatusBadge(t, rfq) ?? {
      key: 'activity',
      label: ended ? t('rfq.status.expired') : t('rfq.status.live'),
      variant: ended ? 'muted' : 'accent',
    }
  );
}

function cityFromLocation(location: string | undefined): string | undefined {
  const city = cityFromLocationLabel(location ?? '');
  return city || undefined;
}

/** Long owner statuses that need the title on its own row under the badge. */
function titleBelowStatus(status: string | undefined): boolean {
  return (
    status === 'awaiting-your-confirmation' ||
    status === 'awaiting-confirmation' ||
    status === 'awaiting-action'
  );
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
  catalogLabel,
}: BuildListingCardsInput): ListingCardItem[] {
  const labelOf = (kind: ListingCategory, stored: string) => catalogLabel?.(kind, stored) ?? stored;
  if (category === 'equipment') {
    return equipmentListings.map((listing) => {
      const offersRent = listing.mode === 'rent' || listing.mode === 'both';
      const offersSell = listing.mode === 'sell' || listing.mode === 'both';
      const rental = rentalPrice(listing, t, currencyCode);
      const saleAmount = priceText(currencyCode, listing.salePrice);
      const priceLines =
        listing.postedAs === 'buyer'
          ? undefined
          : [
              offersSell && saleAmount
                ? {
                    text: saleAmount,
                    unit: t('equipmentListing.salePrice'),
                  }
                : null,
              offersRent && rental.priceText
                ? {
                    text: rental.priceText,
                    unit: rental.priceUnit
                      ? `${t('equipmentListing.rent')} (per ${rental.priceUnit.replace(/^\/\s*/, '').trim()})`
                      : t('equipmentListing.rent'),
                  }
                : null,
            ].filter((line): line is { text: string; unit: string } => Boolean(line));
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
        subtitle: labelOf('equipment', listing.equipmentTypeLabel),
        subtitleIcon: 'construct-outline',
        unitsLabel: t('equipmentListing.unitsCount', {
          count:
            listing.postedAs === 'supplier'
              ? (listing.availableUnits ?? listing.units)
              : listing.units,
        }),
        unitsIcon: 'layers-outline',
        typeBadge: activityBadge(
          t,
          listing.rfq,
          listing.postedAs === 'supplier'
            ? Date.now() >= listing.createdAt + 365 * 24 * 60 * 60 * 1000
            : listingHasEnded({
                rfqStatus: listing.rfq?.status,
                expiresAt: listing.rfq?.expiresAt,
                auctionEndDate: listing.auctionEndDate,
                createdAt: listing.createdAt,
              }),
        ),
        titleBelowStatus: titleBelowStatus(listing.rfq?.status),
        requestBadge:
          listing.postedAs === 'buyer'
            ? {
                key: 'request-mode',
                label:
                  listing.requestMode === 'auction'
                    ? t('equipmentListing.requestAuction')
                    : t('equipmentListing.requestRfq'),
                variant: listing.requestMode === 'auction' ? 'auction' : 'rfq',
              }
            : undefined,
        city: cityFromLocation(listing.location),
        durationBadges,
        deliveryBadge: listing.deliveryAvailable
          ? {
              key: 'delivery',
              label: t('equipmentListing.deliveryBadge'),
              icon: 'car-outline',
            }
          : undefined,
        statusBadges:
          listing.postedAs === 'buyer'
            ? [
                {
                  key: 'request-mode',
                  label:
                    listing.requestMode === 'auction'
                      ? t('equipmentListing.requestAuction')
                      : t('equipmentListing.requestRfq'),
                  variant: listing.requestMode === 'auction' ? 'auction' : 'rfq',
                },
              ]
            : [
                offersRent ? { key: 'rent', label: t('equipmentListing.rent') } : null,
                offersSell ? { key: 'sell', label: t('equipmentListing.sell') } : null,
              ].filter((badge): badge is { key: string; label: string } => Boolean(badge)),
        priceLines,
        createdAt: listing.postedAs === 'supplier' ? undefined : listing.createdAt,
        expiresAt:
          listing.postedAs === 'supplier'
            ? undefined
            : (listing.rfq?.expiresAt ?? listing.auctionEndDate ?? undefined),
        ended:
          listing.postedAs === 'supplier'
            ? Date.now() >= listing.createdAt + 365 * 24 * 60 * 60 * 1000
            : listingHasEnded({
                rfqStatus: listing.rfq?.status,
                expiresAt: listing.rfq?.expiresAt,
                auctionEndDate: listing.auctionEndDate,
                createdAt: listing.createdAt,
              }),
        onRepost: onRepost ? () => onRepost(listing.id, 'equipment') : undefined,
        onPress: () => onOpen(listing.id, 'equipment'),
      };
    });
  }

  if (category === 'services') {
    return serviceListings.map((listing) => {
      const prices = resolveServicePrices(listing);
      const priceLines =
        listing.postedAs === 'buyer'
          ? undefined
          : [
              prices.onsitePrice
                ? {
                    text: `${currencyCode} ${formatAmountWithCommas(prices.onsitePrice)}`,
                    unit: t('serviceListing.onsite'),
                  }
                : null,
              prices.onlinePrice
                ? {
                    text: `${currencyCode} ${formatAmountWithCommas(prices.onlinePrice)}`,
                    unit: t('serviceListing.online'),
                  }
                : null,
            ].filter((line): line is { text: string; unit: string } => Boolean(line));
      return {
        id: listing.id,
        title: listing.title,
        reference: listing.reference,
        thumbnail: listing.media.find((item) => item.kind === 'photo')?.uri,
        placeholderIcon: 'briefcase-outline',
        subtitle: labelOf('services', listing.serviceCategoryLabel),
        subtitleIcon: 'briefcase-outline',
        typeBadge: activityBadge(
          t,
          listing.rfq,
          listingHasEnded({
            rfqStatus: listing.rfq?.status,
            expiresAt: listing.rfq?.expiresAt,
            createdAt: listing.createdAt,
          }),
        ),
        titleBelowStatus: titleBelowStatus(listing.rfq?.status),
        city: cityFromLocation(listing.location),
        statusBadges: [
          ...serviceTypeLabels(t, listing.serviceType).map((label) => ({
            key: label,
            label,
          })),
        ],
        priceLines,
        createdAt: listing.createdAt,
        expiresAt: listing.rfq?.expiresAt ?? undefined,
        ended: listingHasEnded({
          rfqStatus: listing.rfq?.status,
          expiresAt: listing.rfq?.expiresAt,
          createdAt: listing.createdAt,
        }),
        onRepost: onRepost ? () => onRepost(listing.id, 'services') : undefined,
        onPress: () => onOpen(listing.id, 'services'),
      };
    });
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
        labelOf('gold', listing.purityLabel),
      ]
        .filter((part): part is string => Boolean(part))
        .join(' · ') || undefined,
    city: cityFromLocation(listing.location),
    typeBadge: activityBadge(
      t,
      listing.rfq,
      listingHasEnded({
        rfqStatus: listing.rfq?.status,
        expiresAt: listing.rfq?.expiresAt,
        auctionEndDate: listing.auctionEndDate,
        createdAt: listing.createdAt,
      }),
    ),
    titleBelowStatus: titleBelowStatus(listing.rfq?.status),
    priceLines:
      listing.postedAs === 'buyer' || !listing.price
        ? undefined
        : [
            {
              text: priceText(currencyCode, listing.price) ?? '',
              unit: t('goldListing.startingPrice'),
            },
          ],
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
