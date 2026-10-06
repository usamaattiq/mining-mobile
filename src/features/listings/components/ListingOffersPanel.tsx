import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { i18n as appI18n } from '@/i18n';
import { AppText } from '@/shared/components/AppText';
import { Button } from '@/shared/components/Button';
import { EmptyState } from '@/shared/components/EmptyState';
import { PriceTimesUnitsSummary } from '@/features/listings/components/PriceTimesUnitsSummary';
import { formatAmountWithCommas, parsePositiveAmount } from '@/shared/utils/formatAmount';
import { openWhatsApp } from '@/shared/utils/openWhatsApp';
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
  /** Shown on the left when the offer has no photo. */
  placeholderIcon?: keyof typeof Ionicons.glyphMap;
  /** Gold auctions: trophy on the rank-1 bid. */
  showLeader?: boolean;
  /** Gold auctions: message every bidder, not only the selected one. */
  messageEveryOffer?: boolean;
  onAccept: (offerId: string) => void;
  onReject: (offerId: string) => void;
  onMessage?: (offer: ListingRfqOffer) => void;
  onPressResponder?: (offer: ListingRfqOffer) => void;
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
  placeholderIcon,
  showLeader = false,
  messageEveryOffer = false,
  onAccept,
  onReject,
  onMessage,
  onPressResponder,
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
        <EmptyState title={t('rfq.noOffers')} />
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
                {placeholderIcon ? (
                  <View style={styles.logo}>
                    <Ionicons name={placeholderIcon} size={22} color={palette.goldDark} />
                  </View>
                ) : null}
                <Pressable
                  disabled={!onPressResponder || !offer.responderId}
                  onPress={() => onPressResponder?.(offer)}
                  style={styles.namePress}
                >
                  <AppText weight="semibold" style={styles.name} numberOfLines={1}>
                    {offer.status === 'confirmed'
                      ? offer.responderName || t('messages.fallbackName')
                      : offer.responderName.trim().split(/\s+/)[0] || t('messages.fallbackName')}
                  </AppText>
                </Pressable>
                {isLeader ? (
                  <Ionicons name="trophy" size={16} color={palette.gold} />
                ) : null}
                <View style={styles.badges}>
                  {statusKey !== 'active' ? (
                    <View style={styles.statusBadge}>
                      <AppText weight="semibold" style={styles.statusBadgeText}>
                        {t(`rfq.offerStatus.${statusKey}`)}
                      </AppText>
                    </View>
                  ) : null}
                  {showUnits && offer.kind ? (
                    <View style={styles.kindBadge}>
                      <AppText weight="semibold" style={styles.kindBadgeText}>
                        {offer.kind === 'rent' ? t('equipmentListing.rent') : t('equipmentListing.sell')}
                      </AppText>
                    </View>
                  ) : null}
                  {offer.delivery ? (
                    <View style={styles.kindBadge}>
                      <AppText weight="semibold" style={styles.kindBadgeText}>
                        {offer.delivery === 'onsite'
                          ? t('serviceListing.onsite')
                          : t('serviceListing.online')}
                      </AppText>
                    </View>
                  ) : null}
                </View>
              </View>
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
              ) : null}
              {onMessage &&
              (messageEveryOffer ||
                offer.status === 'selected' ||
                offer.status === 'confirmed') ? (
                <View style={styles.actions}>
                  <Button
                    label={t('messages.message')}
                    icon="chatbubble-ellipses-outline"
                    onPress={() => onMessage(offer)}
                    style={styles.actionButton}
                  />
                  {offer.status === 'confirmed' && offer.responderPhone ? (
                    <Button
                      label={t('common.whatsapp')}
                      icon="logo-whatsapp"
                      variant="whatsapp"
                      onPress={() => openWhatsApp(offer.responderPhone!)}
                      style={styles.actionButton}
                    />
                  ) : null}
                </View>
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
    gap: spacing.sm,
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: palette.softGold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badges: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  namePress: { flex: 1 },
  name: {
    fontSize: 14,
    color: palette.charcoal,
  },
  kindBadge: {
    backgroundColor: palette.softGold,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  kindBadgeText: { fontSize: 11, color: palette.goldDark },
  statusBadge: {
    backgroundColor: palette.lightGold,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  statusBadgeText: { fontSize: 11, color: palette.charcoal },
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
});
