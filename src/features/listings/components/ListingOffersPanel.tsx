import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { i18n as appI18n } from '@/i18n';
import { AppText } from '@/shared/components/AppText';
import { Button } from '@/shared/components/Button';
import { PriceTimesUnitsSummary } from '@/features/listings/components/PriceTimesUnitsSummary';
import { formatAmountWithCommas, parsePositiveAmount } from '@/shared/utils/formatAmount';
import { palette, radius, spacing } from '@/theme';
import type { ListingRfqOffer } from '@/features/listings/types/listingRfq.types';

export type ListingOffersPanelProps = {
  offers: ListingRfqOffer[];
  currencyCode: string;
  actingOfferId: string | null;
  canDecideOffers?: boolean;
  /** Accept and reject stay hidden unless the request is still live. */
  rfqStatus?: string;
  showUnits?: boolean;
  /** Gold auctions: trophy on the rank-1 bid. */
  showLeader?: boolean;
  /** Gold auctions: message every bidder, not only the selected one. */
  messageEveryOffer?: boolean;
  onAccept: (offerId: string) => void;
  onReject: (offerId: string) => void;
  onMessage?: (offer: ListingRfqOffer) => void;
};

const OFFER_STATUS_KEY: Record<string, string> = {
  active: 'active',
  selected: 'selected',
  confirmed: 'confirmed',
  withdrawn: 'withdrawn',
  declined: 'declined',
  timed_out: 'timedOut',
  lapsed: 'lapsed',
};

export function ListingOffersPanel({
  offers,
  currencyCode,
  actingOfferId,
  canDecideOffers = true,
  rfqStatus,
  showUnits = false,
  showLeader = false,
  messageEveryOffer = false,
  onAccept,
  onReject,
  onMessage,
}: ListingOffersPanelProps): React.ReactElement {
  const { t } = useTranslation(undefined, { i18n: appI18n });
  const orderedOffers = [...offers].sort((left, right) => {
    if (left.rank != null && right.rank != null) return left.rank - right.rank;
    const rank = (status: string) => (status === 'selected' ? 0 : 1);
    return rank(left.status) - rank(right.status);
  });
  const requestIsLive = (rfqStatus ?? 'live') === 'live';

  return (
    <View style={styles.root}>
      <AppText weight="bold" style={styles.title}>
        {t('rfq.offersTitle')}
      </AppText>
      {offers.length === 0 ? (
        <View style={styles.empty}>
          <AppText style={styles.emptyText}>{t('rfq.noOffers')}</AppText>
        </View>
      ) : (
        orderedOffers.map((offer) => {
          const statusKey = OFFER_STATUS_KEY[offer.status] ?? 'active';
          const canDecide = requestIsLive && canDecideOffers && offer.status === 'active';
          const busy = actingOfferId === offer.id;
          const isLeader = showLeader && offer.rank === 1;
          const totalAmount = parsePositiveAmount(offer.price);
          const units = offer.quantity != null && offer.quantity > 0 ? offer.quantity : null;
          const unitAmount =
            totalAmount != null && units
              ? Math.round((totalAmount / units) * 100) / 100
              : null;
          return (
            <View key={offer.id} style={styles.card}>
              <View style={styles.row}>
                <AppText weight="semibold" style={styles.name} numberOfLines={1}>
                  {offer.status === 'confirmed'
                    ? offer.responderName || t('messages.fallbackName')
                    : offer.responderName.trim().split(/\s+/)[0] || t('messages.fallbackName')}
                </AppText>
                {isLeader ? (
                  <Ionicons name="trophy" size={16} color={palette.gold} />
                ) : null}
                {statusKey !== 'active' ? (
                  <View style={styles.tag}>
                    <AppText weight="semibold" style={styles.tagText}>
                      {t(`rfq.offerStatus.${statusKey}`)}
                    </AppText>
                  </View>
                ) : null}
              </View>
              {showUnits && offer.kind ? (
                <AppText style={styles.kind}>
                  {offer.kind === 'rent' ? t('equipmentListing.rent') : t('equipmentListing.sell')}
                </AppText>
              ) : null}
              {showUnits && unitAmount != null && units ? (
                <PriceTimesUnitsSummary
                  currencyCode={currencyCode}
                  unitAmount={unitAmount}
                  units={units}
                  compact
                />
              ) : offer.price ? (
                <AppText weight="bold" style={styles.price}>
                  {currencyCode} {formatAmountWithCommas(offer.price)}
                </AppText>
              ) : null}
              {canDecide ? (
                <View style={styles.actions}>
                  <Button
                    label={t('rfq.reject')}
                    variant="outline"
                    disabled={busy}
                    onPress={() => onReject(offer.id)}
                    style={styles.actionButton}
                  />
                  <Button
                    label={t('rfq.accept')}
                    loading={busy}
                    disabled={Boolean(actingOfferId)}
                    onPress={() => onAccept(offer.id)}
                    style={styles.actionButton}
                  />
                </View>
              ) : offer.status === 'selected' ? (
                <AppText style={styles.waiting}>
                  {t('rfq.waitingForConfirmation')}
                </AppText>
              ) : null}
              {onMessage &&
              (messageEveryOffer ||
                offer.status === 'selected' ||
                offer.status === 'confirmed') ? (
                <Button
                  label={t('messages.message')}
                  icon="chatbubble-ellipses-outline"
                  onPress={() => onMessage(offer)}
                />
              ) : null}
            </View>
          );
        })
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: spacing.sm,
  },
  title: {
    fontSize: 15,
    color: palette.charcoal,
  },
  empty: {
    backgroundColor: palette.warmWhite,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: palette.softGold,
    padding: spacing.md,
  },
  emptyText: {
    fontSize: 13,
    color: palette.muted,
  },
  card: {
    backgroundColor: palette.warmWhite,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: palette.softGold,
    padding: spacing.md,
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  name: {
    flex: 1,
    fontSize: 14,
    color: palette.charcoal,
  },
  tag: {
    backgroundColor: palette.softGold,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  tagText: {
    fontSize: 11,
    color: palette.gold,
  },
  kind: {
    fontSize: 12,
    color: palette.muted,
  },
  price: {
    fontSize: 18,
    color: palette.charcoal,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
  },
  waiting: {
    fontSize: 13,
    color: palette.muted,
  },
});
