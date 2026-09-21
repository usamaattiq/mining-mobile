import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { i18n as appI18n } from '@/i18n';
import { AppText } from '@/shared/components/AppText';
import { Button } from '@/shared/components/Button';
import { formatAmountWithCommas } from '@/shared/utils/formatAmount';
import { palette, radius, spacing } from '@/theme';
import type { ListingRfqOffer } from '@/features/listings/types/listingRfq.types';

export type ListingOffersPanelProps = {
  offers: ListingRfqOffer[];
  currencyCode: string;
  actingOfferId: string | null;
  canDecideOffers?: boolean;
  onAccept: (offerId: string) => void;
  onReject: (offerId: string) => void;
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
  onAccept,
  onReject,
}: ListingOffersPanelProps): React.ReactElement {
  const { t } = useTranslation(undefined, { i18n: appI18n });

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
        offers.map((offer) => {
          const statusKey = OFFER_STATUS_KEY[offer.status] ?? 'active';
          const canDecide = canDecideOffers && offer.status === 'active';
          const busy = actingOfferId === offer.id;
          return (
            <View key={offer.id} style={styles.card}>
              <View style={styles.row}>
                <AppText weight="semibold" style={styles.name} numberOfLines={1}>
                  {offer.responderName || t('messages.fallbackName')}
                </AppText>
                <View style={styles.tag}>
                  <AppText weight="semibold" style={styles.tagText}>
                    {t(`rfq.offerStatus.${statusKey}`)}
                  </AppText>
                </View>
              </View>
              {offer.price ? (
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
