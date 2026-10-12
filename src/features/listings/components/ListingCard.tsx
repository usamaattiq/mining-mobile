import React from 'react';
import { Image } from 'expo-image';
import { RemoteImage } from '@/shared/components/RemoteImage';
import { Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { AppText } from '@/shared/components/AppText';
import { BlinkingDot } from '@/shared/components/BlinkingDot';
import { useTranslation } from 'react-i18next';
import { i18n as appI18n } from '@/i18n';
import { useSharedNow } from '@/shared/hooks/useSharedNow';
import { palette, radius, spacing } from '@/theme';
import { cardBackShadow } from '@/theme/cardShadow';
import type {
  ListingCardBadge,
  ListingCardProps,
} from '@/features/listings/types/listingCard.types';

const LISTING_LIFETIME_MS = 24 * 60 * 60 * 1000;
const COUNTDOWN_TICK_MS = 1000;
const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;
const MINUTE_MS = 60 * 1000;
const BADGE_ROW_HEIGHT = 20;

function useRemainingTime(createdAt: number, expiresAt?: number): string {
  const end = expiresAt ?? createdAt + LISTING_LIFETIME_MS;
  const ahead = Math.max(0, end - Date.now());
  const tickMs = ahead >= HOUR_MS ? 60_000 : ahead >= MINUTE_MS ? 15_000 : COUNTDOWN_TICK_MS;
  const now = useSharedNow(tickMs);
  const remainingMs = Math.max(0, end - now);

  if (remainingMs > DAY_MS) {
    return `${Math.floor(remainingMs / DAY_MS)}d`;
  }
  if (remainingMs >= HOUR_MS) {
    return `${Math.floor(remainingMs / HOUR_MS)}h`;
  }
  if (remainingMs >= MINUTE_MS) {
    return `${Math.floor(remainingMs / MINUTE_MS)}m`;
  }
  return `${Math.floor(remainingMs / 1000)}s`;
}

function SmallBadge({ badge }: { badge: ListingCardBadge }): React.ReactElement {
  return (
    <View style={styles.smallBadge}>
      {badge.icon ? <Ionicons name={badge.icon} size={10} color={palette.gold} /> : null}
      <AppText weight="semibold" style={styles.smallBadgeText}>
        {badge.label}
      </AppText>
    </View>
  );
}

function statusBadgeStyle(variant: ListingCardBadge['variant']) {
  if (variant === 'muted') return styles.statusBadge_muted;
  if (variant === 'warning') return styles.statusBadge_warning;
  if (variant === 'success') return styles.statusBadge_success;
  if (variant === 'rfq') return styles.statusBadge_rfq;
  if (variant === 'auction') return styles.statusBadge_auction;
  return undefined;
}

function StatusBadge({ badge }: { badge: ListingCardBadge }): React.ReactElement {
  const variant = badge.variant ?? 'accent';
  const onGold = variant === 'accent' || variant === 'muted';
  return (
    <View style={[styles.statusBadge, statusBadgeStyle(variant)]}>
      {badge.icon ? (
        <Ionicons
          name={badge.icon}
          size={10}
          color={variant === 'muted' ? palette.muted : onGold ? palette.goldDark : palette.pureWhite}
        />
      ) : variant === 'accent' ? (
        <View style={styles.liveDot} />
      ) : null}
      <AppText
        weight="semibold"
        style={[
          styles.statusBadgeText,
          variant === 'muted' && styles.statusBadgeTextMuted,
          !onGold && styles.statusBadgeTextOnFill,
        ]}
      >
        {badge.label}
      </AppText>
    </View>
  );
}

/**
 * Shared Requests-tab card for equipment, services, and gold.
 * Every category uses the same rows and spacing.
 */
function ListingCardComponent({
  title,
  thumbnail,
  placeholderIcon,
  subtitle,
  subtitleIcon,
  unitsLabel,
  unitsIcon = 'layers-outline',
  typeBadge,
  city,
  deliveryBadge,
  requestBadge,
  statusBadges,
  priceText,
  priceUnit,
  priceLines,
  createdAt,
  expiresAt,
  ended,
  onRepost,
  onPress,
  layout = 'row',
  hasNewOffer,
}: ListingCardProps): React.ReactElement {
  const { t } = useTranslation(undefined, { i18n: appI18n });
  const timeLeft = useRemainingTime(createdAt ?? 0, expiresAt);
  const windowWidth = useWindowDimensions().width;
  const thumbnailUri = thumbnail;
  const [imageSide, setImageSide] = React.useState(96);

  React.useEffect(() => {
    if (thumbnailUri) void Image.prefetch(thumbnailUri);
  }, [thumbnailUri]);
  const showRepost = Boolean(ended && onRepost);
  const showTimer = Boolean(createdAt) && !ended;
  const resolvedPriceLines =
    priceLines && priceLines.length > 0
      ? priceLines
      : priceText || priceUnit
        ? [{ text: priceText ?? ' ', unit: priceUnit }]
        : [];

  const timer = showTimer ? (
    <View style={styles.timerBadge}>
      <Ionicons name="time-outline" size={9} color={palette.pureWhite} />
      <AppText weight="semibold" style={styles.timerText}>
        {timeLeft}
      </AppText>
    </View>
  ) : null;

  const repostButton = showRepost ? (
    <Pressable
      onPress={onRepost}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={t('requests.repost')}
      style={({ pressed }) => [styles.repostButton, pressed && styles.pressed]}
    >
      <Ionicons name="refresh-outline" size={12} color={palette.pureWhite} />
      <AppText weight="semibold" style={styles.repostLabel}>
        {t('requests.repost')}
      </AppText>
    </Pressable>
  ) : null;

  if (layout === 'grid') {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={title}
        style={({ pressed }) => [styles.gridCard, cardBackShadow, pressed && styles.pressed]}
      >
        <View
          style={[
            styles.gridImageWrap,
            { height: Math.round((windowWidth - spacing.md * 2) * 0.32) },
          ]}
        >
          {thumbnail ? (
            <RemoteImage
              source={thumbnail}
              style={styles.gridImage}
              recyclingKey={thumbnail}
            />
          ) : (
            <View style={[styles.gridImage, styles.imagePlaceholder]}>
              <Ionicons name={placeholderIcon} size={56} color={palette.goldDark} />
            </View>
          )}
          {requestBadge ? (
            <View style={styles.gridRequestOverlay}>
              <StatusBadge badge={requestBadge} />
            </View>
          ) : null}
          {typeBadge ? (
            <View style={styles.gridRfqOverlay}>
              <StatusBadge badge={typeBadge} />
            </View>
          ) : null}
        </View>

        <View style={styles.gridBody}>
          {resolvedPriceLines.length > 0 ? (
            <View style={styles.gridPrices}>
              {resolvedPriceLines.map((line, index) => (
                <View key={`${line.text}-${line.unit ?? index}`} style={styles.gridPriceRow}>
                  <AppText weight="bold" style={styles.gridPrice} numberOfLines={1}>
                    {line.text}
                  </AppText>
                  {line.unit ? (
                    <AppText style={styles.gridPriceUnit} numberOfLines={1}>
                      {line.unit}
                    </AppText>
                  ) : null}
                </View>
              ))}
            </View>
          ) : null}

          <AppText weight="bold" style={styles.gridTitle} numberOfLines={2}>
            {title}
          </AppText>

          {subtitle || unitsLabel ? (
            <View style={styles.gridMetaRow}>
              {subtitleIcon ? (
                <Ionicons name={subtitleIcon} size={12} color={palette.gold} />
              ) : null}
              {subtitle ? (
                <AppText style={styles.gridMeta} numberOfLines={1}>
                  {subtitle}
                </AppText>
              ) : (
                <View style={styles.gridMetaSpacer} />
              )}
              {unitsLabel ? (
                <View style={styles.gridUnits}>
                  <Ionicons name={unitsIcon} size={12} color={palette.gold} />
                  <AppText style={styles.gridMeta} numberOfLines={1}>
                    {unitsLabel}
                  </AppText>
                </View>
              ) : null}
            </View>
          ) : null}

          {city ? (
            <View style={styles.gridMetaRow}>
              <Ionicons name="location-outline" size={12} color={palette.gold} />
              <AppText style={styles.gridMeta} numberOfLines={1}>
                {city}
              </AppText>
            </View>
          ) : null}

          <View style={styles.gridFooter}>
            <View style={styles.gridFooterLeft}>
              {hasNewOffer ? <BlinkingDot /> : null}
              {deliveryBadge ? <SmallBadge badge={deliveryBadge} /> : null}
              {(statusBadges ?? []).map((badge) => (
                <StatusBadge key={badge.key} badge={badge} />
              ))}
            </View>
            {timer}
            {repostButton}
          </View>
        </View>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={title}
      style={({ pressed }) => [styles.card, cardBackShadow, pressed && styles.pressed]}
    >
      <View style={styles.row}>
        <View
          style={[
            styles.imageWrap,
            { width: Math.max(imageSide - 12, 64), height: Math.max(imageSide - 20, 64) },
          ]}
        >
          {thumbnail ? (
            <RemoteImage source={thumbnail} style={styles.image} recyclingKey={thumbnail} />
          ) : (
            <View style={[styles.image, styles.imagePlaceholder]}>
              <Ionicons name={placeholderIcon} size={32} color={palette.goldDark} />
            </View>
          )}
        </View>

        <View
          style={styles.copy}
          onLayout={(event) => {
            const next = Math.round(event.nativeEvent.layout.height);
            if (next > 0 && next !== imageSide) setImageSide(next);
          }}
        >
          {typeBadge || showTimer || hasNewOffer ? (
            <View style={styles.badgeRow}>
              <View style={styles.badgeRowStart}>
                {hasNewOffer ? <BlinkingDot /> : null}
                {showTimer ? timer : null}
              </View>
              {typeBadge ? <StatusBadge badge={typeBadge} /> : null}
            </View>
          ) : null}
          <View style={styles.titleRow}>
            <AppText weight="bold" style={styles.title} numberOfLines={1}>
              {title}
            </AppText>
          </View>

          <View style={styles.locationRow}>
            <Feather name="map-pin" size={12} color={palette.gold} />
            <AppText style={styles.location} numberOfLines={1}>
              {city ?? ' '}
            </AppText>
            <Ionicons name="chevron-forward" size={18} color={palette.muted} />
          </View>

          {resolvedPriceLines.length > 0 ? (
            <>
              <View style={styles.divider} />
              <View style={styles.priceColumns}>
                {resolvedPriceLines.map((line, index) => (
                  <React.Fragment key={`${line.text}-${line.unit ?? index}`}>
                    {index > 0 ? <View style={styles.priceDivider} /> : null}
                    <View style={styles.priceColumn}>
                      {line.unit ? (
                        <View style={styles.priceLabelRow}>
                          {line.unit === t('serviceListing.onsite') ? (
                            <Feather name="map-pin" size={11} color={palette.gold} />
                          ) : line.unit === t('serviceListing.online') ? (
                            <Feather name="wifi" size={11} color={palette.gold} />
                          ) : line.unit.toLowerCase().includes('rent') ||
                            line.unit.includes('إيجار') ? (
                            <Feather name="key" size={11} color={palette.gold} />
                          ) : (
                            <Ionicons name="pricetag-outline" size={11} color={palette.gold} />
                          )}
                          <AppText style={styles.priceLabel} numberOfLines={1}>
                            {line.unit}
                          </AppText>
                        </View>
                      ) : null}
                      <AppText weight="bold" style={styles.price} numberOfLines={1}>
                        {line.text}
                      </AppText>
                    </View>
                  </React.Fragment>
                ))}
              </View>
            </>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

export const ListingCard = React.memo(ListingCardComponent);

const styles = StyleSheet.create({
  card: {
    backgroundColor: palette.warmWhite,
    borderRadius: 22,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  gridCard: {
    width: '48%',
    backgroundColor: palette.warmWhite,
    borderRadius: radius.lg,
  },
  gridImageWrap: {
    width: '100%',
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: palette.softGold,
  },
  gridImage: {
    width: '100%',
    height: '100%',
  },
  gridBody: {
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    gap: 4,
  },
  gridRequestOverlay: {
    position: 'absolute',
    top: spacing.xs + 2,
    left: spacing.xs + 2,
    zIndex: 1,
  },
  gridRfqOverlay: {
    position: 'absolute',
    top: spacing.xs + 2,
    right: spacing.xs + 2,
    zIndex: 1,
  },
  gridPrices: {
    gap: 2,
    minWidth: 0,
  },
  gridPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    flexWrap: 'nowrap',
    gap: 2,
    minWidth: 0,
  },
  gridPrice: {
    flexShrink: 1,
    fontSize: 16,
    lineHeight: 16,
    color: palette.charcoal,
  },
  gridPriceUnit: {
    flexShrink: 0,
    fontSize: 12,
    lineHeight: 16,
    color: palette.muted,
  },
  gridTitle: {
    fontSize: 13,
    lineHeight: 15,
    color: palette.charcoal,
  },
  gridMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  gridUnits: {
    marginLeft: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    flexShrink: 0,
  },
  gridMetaSpacer: {
    flex: 1,
  },
  gridMeta: {
    flexShrink: 1,
    fontSize: 11,
    lineHeight: 12,
    color: palette.muted,
  },
  gridFooter: {
    // marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.xs,
  },
  gridFooterLeft: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 4,
    minWidth: 0,
  },
  pressed: {
    opacity: 0.9,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  imageWrap: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    backgroundColor: palette.softGold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    flex: 1,
    minWidth: 0,
    justifyContent: 'center',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  badgeRowStart: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minWidth: 0,
    marginTop: 6,
  },
  location: {
    flex: 1,
    fontSize: 13,
    lineHeight: 16,
    color: palette.muted,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: palette.softGold,
    marginTop: 10,
    marginBottom: 10,
  },
  priceColumns: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 0,
  },
  priceColumn: {
    flex: 1,
    alignItems: 'flex-start',
    gap: 2,
    minWidth: 0,
  },
  priceLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    maxWidth: '100%',
  },
  priceLabel: {
    flexShrink: 1,
    fontSize: 10,
    lineHeight: 14,
    color: palette.muted,
  },
  priceDivider: {
    width: StyleSheet.hairlineWidth,
    alignSelf: 'stretch',
    backgroundColor: palette.softGold,
    marginHorizontal: spacing.sm,
  },
  modeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 4,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.xs,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.xs,
    minHeight: BADGE_ROW_HEIGHT,
    marginBottom: spacing.xs,
  },
  topRight: {
    flexShrink: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: spacing.xs,
  },
  topLeft: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing.xs,
    minWidth: 0,
  },
  badgeSlot: {
    height: BADGE_ROW_HEIGHT,
    width: 1,
  },
  body: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  prices: {
    flex: 1,
    minWidth: 0,
    alignItems: 'flex-end',
    gap: 2,
  },
  priceLine: {
    marginTop: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.xs,
    minWidth: 0,
    overflow: 'hidden',
  },
  timerSlot: {
    flexShrink: 0,
  },
  smallBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: palette.softGold,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
  },
  smallBadgeText: {
    fontSize: 10,
    color: palette.gold,
  },
  title: {
    flex: 1,
    minWidth: 0,
    fontSize: 18,
    lineHeight: 22,
    color: palette.charcoal,
  },
  subtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    minHeight: 14,
  },
  modeBadges: {
    position: 'absolute',
    right: 0,
    top: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
  },
  subtitle: {
    flex: 1,
    fontSize: 12,
    lineHeight: 14,
    color: palette.muted,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'baseline',
    flexWrap: 'nowrap',
    gap: spacing.xs,
    maxWidth: '100%',
    minWidth: 0,
    minHeight: 20,
  },
  price: {
    fontSize: 15,
    lineHeight: 18,
    color: palette.charcoal,
    includeFontPadding: false,
  },
  priceUnit: {
    flexShrink: 0,
    fontSize: 12,
    lineHeight: 16,
    color: palette.muted,
    includeFontPadding: false,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: spacing.xs,
    minHeight: BADGE_ROW_HEIGHT,
  },
  bottomRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: palette.softGold,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  statusBadge_muted: {
    backgroundColor: palette.softGold,
  },
  statusBadge_warning: {
    backgroundColor: palette.danger,
  },
  statusBadge_success: {
    backgroundColor: palette.goldDark,
  },
  statusBadge_rfq: {
    backgroundColor: '#2F6F8F',
  },
  statusBadge_auction: {
    backgroundColor: '#6B4C9A',
  },
  statusBadgeText: {
    fontSize: 11,
    color: palette.goldDark,
  },
  statusBadgeTextMuted: {
    color: palette.muted,
  },
  statusBadgeTextOnFill: {
    color: palette.pureWhite,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: palette.gold,
  },
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: palette.gold,
    borderRadius: radius.sm,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  timerText: {
    fontSize: 11,
    color: palette.pureWhite,
  },
  repostButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: palette.gold,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  repostLabel: {
    fontSize: 11,
    color: palette.pureWhite,
  },
});
