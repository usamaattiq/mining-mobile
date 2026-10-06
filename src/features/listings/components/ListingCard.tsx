import React from 'react';
import { Image as ExpoImage } from 'expo-image';
import { Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/shared/components/AppText';
import { useTranslation } from 'react-i18next';
import { i18n as appI18n } from '@/i18n';
import { palette, radius, spacing } from '@/theme';
import { cardBackShadow } from '@/theme/cardShadow';
import type { ListingCardBadge, ListingCardProps } from '@/features/listings/types/listingCard.types';

const LISTING_LIFETIME_MS = 24 * 60 * 60 * 1000;
const COUNTDOWN_TICK_MS = 1000;
const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;
const MINUTE_MS = 60 * 1000;
const IMAGE_SIZE = 128;
const BADGE_ROW_HEIGHT = 20;
const LINE_HEIGHT = 18;

function useRemainingTime(createdAt: number, expiresAt?: number): string {
  const [now, setNow] = React.useState(() => Date.now());

  React.useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), COUNTDOWN_TICK_MS);
    return () => clearInterval(timer);
  }, []);

  const end = expiresAt ?? createdAt + LISTING_LIFETIME_MS;
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
  return undefined;
}

function StatusBadge({ badge }: { badge: ListingCardBadge }): React.ReactElement {
  const variant = badge.variant ?? 'accent';
  return (
    <View style={[styles.statusBadge, statusBadgeStyle(variant)]}>
      {badge.icon ? (
        <Ionicons
          name={badge.icon}
          size={10}
          color={variant === 'muted' ? palette.muted : palette.pureWhite}
        />
      ) : null}
      <AppText
        weight="semibold"
        style={[styles.statusBadgeText, variant === 'muted' && styles.statusBadgeTextMuted]}
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
export function ListingCard({
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
  titleBelowStatus = false,
}: ListingCardProps): React.ReactElement {
  const { t } = useTranslation(undefined, { i18n: appI18n });
  const timeLeft = useRemainingTime(createdAt ?? 0, expiresAt);
  const windowWidth = useWindowDimensions().width;
  const thumbnailUri = thumbnail;
  const titleInlineWithStatus = !titleBelowStatus;

  React.useEffect(() => {
    if (thumbnailUri) void ExpoImage.prefetch(thumbnailUri);
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
      <Ionicons name="time-outline" size={10} color={palette.gold} />
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

  const bottomBadges = (
    <>
      {requestBadge && titleInlineWithStatus ? <SmallBadge badge={requestBadge} /> : null}
      {deliveryBadge ? <SmallBadge badge={deliveryBadge} /> : null}
      {(statusBadges ?? []).map((badge) => (
        <StatusBadge key={badge.key} badge={badge} />
      ))}
    </>
  );

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
            <ExpoImage
              source={thumbnail}
              style={styles.gridImage}
              contentFit="cover"
              cachePolicy="memory-disk"
            />
          ) : (
            <View style={[styles.gridImage, styles.imagePlaceholder]}>
              <Ionicons name={placeholderIcon} size={56} color={palette.goldDark} />
            </View>
          )}
          {requestBadge ? (
            <View style={styles.gridRequestOverlay}>
              <SmallBadge badge={requestBadge} />
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
                    <AppText style={styles.gridPriceUnit}>{line.unit}</AppText>
                  ) : null}
                </View>
              ))}
            </View>
          ) : null}

          <AppText weight="bold" style={styles.gridTitle} numberOfLines={2}>
            {title}
          </AppText>

          {subtitle ? (
            <AppText style={styles.gridMeta} numberOfLines={1}>
              {subtitle}
            </AppText>
          ) : null}

          {unitsLabel ? (
            <View style={styles.gridMetaRow}>
              <Ionicons name={unitsIcon} size={12} color={palette.gold} />
              <AppText style={styles.gridMeta} numberOfLines={1}>
                {unitsLabel}
              </AppText>
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
        <View style={styles.imageWrap}>
          {thumbnail ? (
            <ExpoImage source={thumbnail} style={styles.image} contentFit="cover" cachePolicy="memory-disk" />
          ) : (
            <View style={[styles.image, styles.imagePlaceholder]}>
              <Ionicons name={placeholderIcon} size={48} color={palette.goldDark} />
            </View>
          )}
        </View>

        <View style={styles.copy}>
          {titleInlineWithStatus ? (
            <View style={styles.topRow}>
              <AppText weight="bold" style={[styles.title, styles.titleInline]} numberOfLines={1}>
                {title}
              </AppText>
              {typeBadge ? <StatusBadge badge={typeBadge} /> : <View style={styles.badgeSlot} />}
            </View>
          ) : (
            <View style={styles.topRow}>
              <View style={styles.topLeft}>
                {requestBadge ? <SmallBadge badge={requestBadge} /> : null}
              </View>
              {typeBadge ? <StatusBadge badge={typeBadge} /> : <View style={styles.badgeSlot} />}
            </View>
          )}

          <View style={styles.body}>
            {titleInlineWithStatus ? null : (
              <AppText weight="bold" style={styles.title} numberOfLines={1}>
                {title}
              </AppText>
            )}

            {subtitle || subtitleIcon ? (
              <View style={styles.subtitleRow}>
                {subtitleIcon ? (
                  <Ionicons name={subtitleIcon} size={12} color={palette.gold} />
                ) : null}
                <AppText style={styles.subtitle} numberOfLines={1}>
                  {subtitle ?? ' '}
                </AppText>
              </View>
            ) : null}

            {unitsLabel ? (
              <View style={styles.subtitleRow}>
                <Ionicons name={unitsIcon} size={12} color={palette.gold} />
                <AppText style={styles.subtitle} numberOfLines={1}>
                  {unitsLabel}
                </AppText>
              </View>
            ) : null}

            <View style={styles.subtitleRow}>
              <Ionicons name="location-outline" size={12} color={palette.gold} />
              <AppText style={styles.subtitle} numberOfLines={1}>
                {city ?? ' '}
              </AppText>
            </View>

            {resolvedPriceLines.length > 0 ? (
              <View style={styles.prices}>
                {resolvedPriceLines.map((line, index) => (
                  <View key={`${line.text}-${line.unit ?? index}`} style={styles.priceRow}>
                    <AppText weight="bold" style={styles.price} numberOfLines={1}>
                      {line.text}
                    </AppText>
                    {line.unit ? <AppText style={styles.priceUnit}>{line.unit}</AppText> : null}
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.priceRow}>
                <AppText weight="bold" style={styles.price} numberOfLines={1}>
                  {' '}
                </AppText>
              </View>
            )}
          </View>

          <View style={styles.bottomRow}>
            <View style={styles.topLeft}>{bottomBadges}</View>
            <View style={styles.bottomRight}>
              {timer}
              {repostButton}
            </View>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: palette.warmWhite,
    borderRadius: radius.lg,
    padding: spacing.sm,
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
  },
  gridPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    flexWrap: 'wrap',
    gap: 2,
  },
  gridPrice: {
    fontSize: 16,
    lineHeight: 16,
    color: palette.charcoal,
  },
  gridPriceUnit: {
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
    alignItems: 'stretch',
    gap: spacing.sm,
    height: IMAGE_SIZE,
  },
  imageWrap: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    borderRadius: radius.md,
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
    height: IMAGE_SIZE,
    justifyContent: 'space-between',
    minWidth: 0,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.xs,
    minHeight: BADGE_ROW_HEIGHT,
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
    gap: 2,
    minWidth: 0,
    // marginTop: spacing.,
    // marginBottom: spacing.xs,
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
    fontSize: 15,
    lineHeight: LINE_HEIGHT,
    color: palette.charcoal,
  },
  titleInline: {
    flex: 1,
    minWidth: 0,
  },
  subtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    minHeight: 12,
  },
  subtitle: {
    flex: 1,
    fontSize: 12,
    lineHeight: 14,
    color: palette.muted,
  },
  prices: {
    alignItems: 'flex-end',
    gap: 2,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'baseline',
    flexWrap: 'wrap',
    gap: spacing.xs,
    minHeight: 20,
  },
  price: {
    fontSize: 18,
    lineHeight: 22,
    color: palette.charcoal,
    includeFontPadding: false,
  },
  priceUnit: {
    fontSize: 12,
    lineHeight: 16,
    color: palette.muted,
    includeFontPadding: false,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    gap: 3,
    backgroundColor: palette.gold,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
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
  statusBadgeText: {
    fontSize: 10,
    color: palette.pureWhite,
  },
  statusBadgeTextMuted: {
    color: palette.muted,
  },
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: palette.softGold,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
  },
  timerText: {
    fontSize: 12,
    color: palette.gold,
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
