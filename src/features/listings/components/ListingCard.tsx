import React from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/shared/components/AppText';
import { palette, radius, spacing } from '@/theme';
import { cardBackShadow } from '@/theme/cardShadow';
import type { ListingCardBadge, ListingCardProps } from '@/features/listings/types/listingCard.types';

const LISTING_LIFETIME_MS = 24 * 60 * 60 * 1000;
const COUNTDOWN_TICK_MS = 1000;
const HOUR_MS = 60 * 60 * 1000;
const MINUTE_MS = 60 * 1000;
const IMAGE_SIZE = 112;
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
  typeBadge,
  city,
  dateText,
  durationBadges,
  deliveryBadge,
  statusBadges,
  priceText,
  priceUnit,
  createdAt,
  expiresAt,
  onPress,
}: ListingCardProps): React.ReactElement {
  const timeLeft = useRemainingTime(createdAt ?? 0, expiresAt);

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
            <Image source={{ uri: thumbnail }} style={styles.image} />
          ) : (
            <View style={[styles.image, styles.imagePlaceholder]}>
              <Ionicons name={placeholderIcon} size={24} color={palette.muted} />
            </View>
          )}
        </View>

        <View style={styles.copy}>
          <View style={styles.topRow}>
            <View style={styles.topLeft}>
              {durationBadges && durationBadges.length > 0
                ? durationBadges.map((badge) => <SmallBadge key={badge.key} badge={badge} />)
                : null}
            </View>
            {typeBadge ? <StatusBadge badge={typeBadge} /> : <View style={styles.badgeSlot} />}
          </View>

          <View style={styles.body}>
            <AppText weight="bold" style={styles.title} numberOfLines={1}>
              {title}
            </AppText>

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

            <View style={styles.subtitleRow}>
              <Ionicons name="location-outline" size={12} color={palette.gold} />
              <AppText style={styles.subtitle} numberOfLines={1}>
                {city ?? ' '}
              </AppText>
            </View>

            {dateText ? (
              <View style={styles.subtitleRow}>
                <Ionicons name="calendar-outline" size={12} color={palette.gold} />
                <AppText style={styles.subtitle} numberOfLines={1}>
                  {dateText}
                </AppText>
              </View>
            ) : null}

            <View style={styles.priceRow}>
              <AppText weight="bold" style={styles.price} numberOfLines={1}>
                {priceText ?? ' '}
              </AppText>
              {priceUnit ? (
                <AppText weight="bold" style={styles.priceUnit} numberOfLines={1}>
                  {priceUnit}
                </AppText>
              ) : null}
            </View>
          </View>

          <View style={styles.bottomRow}>
            <View style={styles.topLeft}>
              {(statusBadges ?? []).map((badge) => (
                <StatusBadge key={badge.key} badge={badge} />
              ))}
            </View>
            <View style={styles.bottomRight}>
              {deliveryBadge ? <SmallBadge badge={deliveryBadge} /> : null}
              {createdAt ? (
                <View style={styles.timerBadge}>
                  <Ionicons name="time-outline" size={10} color={palette.gold} />
                  <AppText weight="semibold" style={styles.timerText}>
                    {timeLeft}
                  </AppText>
                </View>
              ) : null}
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
  pressed: {
    opacity: 0.9,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
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
    minHeight: IMAGE_SIZE,
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
    lineHeight: LINE_HEIGHT + 4,
    color: palette.charcoal,
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
    lineHeight: 12,
    color: palette.muted,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 2,
    minHeight: 26,
  },
  price: {
    fontSize: 19,
    lineHeight: 26,
    color: palette.charcoal,
    includeFontPadding: false,
  },
  priceUnit: {
    fontSize: 19,
    lineHeight: 26,
    color: palette.charcoal,
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
});
