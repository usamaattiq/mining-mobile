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
import { listingShareUrl, type ListingShareCategory } from '@/shared/utils/listingShareUrl';
import { openWhatsApp } from '@/shared/utils/openWhatsApp';
import { palette, radius, spacing } from '@/theme';
import { cardBackShadow } from '@/theme/cardShadow';
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
  /** When false, bidder names stay visible. Owner name masking is handled by the caller. */
  maskNames?: boolean;
  /** Shorter auction tiles: price on the name line, trophy in the corner. Bidder leaderboard only. */
  compact?: boolean;
  /** Replaces the default "Offers" heading. */
  title?: string;
  onAccept: (offerId: string) => void;
  onReject: (offerId: string) => void;
  /** Gold auction: one button on this bid instead of a control under the list. */
  confirmationOfferId?: string;
  onMessage?: (offer: ListingRfqOffer) => void;
  /** When set, contact buttons only appear on this person's accepted offer. */
  contactResponderId?: string;
  /** Phone for that person's accepted offer. Falls back to the responder phone. */
  contactPhone?: string;
  /** Name shown in the prefilled WhatsApp message when contacting the listing owner. */
  contactName?: string;
  senderName?: string;
  listingId?: string;
  listingCategory?: ListingShareCategory;
  listingTitle?: string;
  listingReference?: string;
  /** When true, Message shows as soon as the offer is sent. Otherwise only after it is confirmed. */
  messageOnSend?: boolean;
  onPressResponder?: (offer: ListingRfqOffer) => void;
};

function displayOfferName(name: string, status: string, fallback: string, mask: boolean): string {
  const trimmed = name.trim();
  if (!mask || status === 'confirmed' || status === 'returned') {
    return trimmed || fallback;
  }
  if (!trimmed) return fallback;
  return `${trimmed.slice(0, 2)}******`;
}

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
  maskNames = true,
  compact = false,
  title,
  onAccept,
  onReject,
  confirmationOfferId,
  onMessage,
  contactResponderId,
  contactPhone,
  contactName,
  senderName,
  listingId,
  listingCategory,
  listingTitle,
  listingReference,
  messageOnSend = true,
  onPressResponder,
}: ListingOffersPanelProps): React.ReactElement {
  const { t } = useTranslation(undefined, { i18n: appI18n });
  const orderedOffers = [...offers].sort((left, right) => {
    if (left.rank != null && right.rank != null) return left.rank - right.rank;
    const rank = (status: string) => (status === 'selected' ? 0 : 1);
    return rank(left.status) - rank(right.status);
  });
  const requestIsLive = (rfqStatus ?? 'live') === 'live';
  const currentOfferId =
    orderedOffers.find((offer) => offer.status === 'selected')?.id ??
    orderedOffers.find((offer) => offer.status === 'confirmed')?.id ??
    orderedOffers.find(
      (offer) =>
        offer.rank === 1 &&
        offer.status !== 'declined' &&
        offer.status !== 'timed_out' &&
        offer.status !== 'withdrawn',
    )?.id;

  return (
    <View style={[styles.root, compact && styles.rootCompact]}>
      <AppText weight="bold" style={styles.title}>
        {title ?? t('rfq.offersTitle')}
      </AppText>
      {offers.length === 0 ? (
        <EmptyState title={t('rfq.noOffers')} />
      ) : (
        orderedOffers.map((offer) => {
          const statusKey = OFFER_STATUS_KEY[offer.status] ?? 'active';
          const canDecide = requestIsLive && canDecideOffers && offer.status === 'active';
          const busy = actingOfferId === offer.id;
          const isLeader = showLeader && offer.id === currentOfferId;
          const totalAmount = parsePositiveAmount(offer.price);
          const units = offer.quantity != null && offer.quantity > 0 ? offer.quantity : null;
          const unitAmount =
            totalAmount != null && units ? Math.round((totalAmount / units) * 100) / 100 : null;
          const priceLabel = offer.price
            ? `${currencyCode} ${formatAmountWithCommas(offer.price)}`
            : null;
          return (
            <View
              key={offer.id}
              style={[
                styles.card,
                cardBackShadow,
                compact && styles.cardCompact,
                compact && isLeader && styles.cardLeader,
              ]}
            >
              <View style={styles.row}>
                {placeholderIcon ? (
                  <View style={[styles.logo, compact && styles.logoCompact]}>
                    <Ionicons
                      name={placeholderIcon}
                      size={compact ? 18 : 22}
                      color={palette.goldDark}
                    />
                  </View>
                ) : null}
                <Pressable
                  disabled={!onPressResponder || !offer.responderId}
                  onPress={() => onPressResponder?.(offer)}
                  style={styles.namePress}
                >
                  <AppText weight="semibold" style={styles.name} numberOfLines={compact ? 2 : 1}>
                    {displayOfferName(
                      offer.responderId === contactResponderId && senderName
                        ? offer.responderName.trim() || senderName
                        : offer.responderName,
                      offer.status,
                      t('messages.fallbackName'),
                      maskNames && offer.responderId !== contactResponderId,
                    )}
                  </AppText>
                </Pressable>
                {!compact && isLeader ? (
                  <Ionicons name="trophy" size={16} color={palette.gold} />
                ) : null}
                {compact && priceLabel ? (
                  <AppText weight="bold" style={styles.priceInline} numberOfLines={1}>
                    {priceLabel}
                  </AppText>
                ) : null}
                {compact && isLeader ? (
                  <Ionicons name="trophy" size={18} color={palette.gold} />
                ) : null}
                {compact ? null : (
                  <View style={styles.badges}>
                    {showUnits && offer.handover === 'delivery' ? (
                      <View style={styles.kindBadge}>
                        <AppText weight="semibold" style={styles.kindBadgeText}>
                          {t('equipmentListing.deliveryBadge')}
                        </AppText>
                      </View>
                    ) : null}
                    {showUnits && offer.kind ? (
                      <View style={styles.kindBadge}>
                        <AppText weight="semibold" style={styles.kindBadgeText}>
                          {offer.kind === 'rent'
                            ? t('equipmentListing.rent')
                            : t('equipmentListing.sell')}
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
                    {statusKey !== 'active' ? (
                      <View style={styles.statusBadge}>
                        <AppText weight="semibold" style={styles.statusBadgeText}>
                          {t(`rfq.offerStatus.${statusKey}`)}
                        </AppText>
                      </View>
                    ) : null}
                  </View>
                )}
              </View>
              {!compact && offer.createdAt ? (
                <AppText style={styles.sentAt} numberOfLines={1}>
                  {new Intl.DateTimeFormat(appI18n.language, {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  }).format(new Date(offer.createdAt))}
                </AppText>
              ) : null}
              {compact ? null : showUnits && unitAmount != null && units ? (
                <PriceTimesUnitsSummary
                  currencyCode={currencyCode}
                  unitAmount={unitAmount}
                  units={units}
                  compact
                />
              ) : priceLabel ? (
                <AppText weight="bold" style={styles.price}>
                  {priceLabel}
                </AppText>
              ) : null}
              {offer.description ? (
                <AppText style={styles.description}>{offer.description}</AppText>
              ) : null}
              {confirmationOfferId && offer.id === confirmationOfferId ? (
                <View style={styles.actions}>
                  <Button
                    label={t('goldListing.sendConfirmation')}
                    loading={busy}
                    disabled={Boolean(actingOfferId)}
                    onPress={() => onAccept(offer.id)}
                    style={styles.actionButton}
                  />
                </View>
              ) : canDecide ? (
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
              (messageOnSend
                ? ['active', 'selected', 'confirmed']
                : ['confirmed']
              ).includes(offer.status) &&
              (!contactResponderId || offer.responderId === contactResponderId) ? (
                <View style={[styles.actions, styles.messageActions]}>
                  <Button
                    label={t('messages.message')}
                    icon="chatbubble-ellipses-outline"
                    onPress={() => onMessage(offer)}
                    style={styles.actionButton}
                  />
                  {(
                    contactResponderId && offer.responderId === contactResponderId
                      ? contactPhone
                      : offer.responderPhone
                  ) ? (
                    <Button
                      label={t('common.whatsapp')}
                      icon="logo-whatsapp"
                      variant="whatsapp"
                      onPress={() => {
                        const contactingOwner = Boolean(
                          contactResponderId && offer.responderId === contactResponderId,
                        );
                        const phone = contactingOwner ? contactPhone : offer.responderPhone;
                        if (!phone) return;
                        const recipient = (
                          contactingOwner ? contactName : offer.responderName
                        )?.trim();
                        const link =
                          listingId && listingCategory
                            ? listingShareUrl(listingCategory, listingId)
                            : '';
                        openWhatsApp(
                          phone,
                          recipient && senderName && listingTitle && link
                            ? t('common.whatsappListingMessage', {
                                recipient,
                                sender: senderName,
                                listing: listingTitle,
                                reference: listingReference ?? '',
                                link,
                              })
                            : undefined,
                        );
                      }}
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
    gap: spacing.md,
  },
  rootCompact: {
    gap: spacing.md,
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
    gap: spacing.xs,
  },
  cardCompact: {
    position: 'relative',
    paddingVertical: 10,
    paddingHorizontal: 12,
    gap: 4,
  },
  cardLeader: {
    paddingTop: 12,
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
  logoCompact: {
    width: 34,
    height: 34,
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
  sentAt: {
    fontSize: 12,
    color: palette.muted,
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
  description: {
    fontSize: 13,
    lineHeight: 18,
    color: palette.muted,
  },
  price: {
    fontSize: 18,
    color: palette.charcoal,
  },
  priceInline: {
    fontSize: 15,
    color: palette.charcoal,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  messageActions: {
    marginTop: spacing.sm,
  },
  actionButton: {
    flex: 1,
    minHeight: 36,
    paddingVertical: 6,
    paddingHorizontal: spacing.md,
  },
});
