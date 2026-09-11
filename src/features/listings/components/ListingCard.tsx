import React from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/shared/components/AppText';
import { palette, radius, spacing } from '@/theme';
import { cardBackShadow } from '@/theme/cardShadow';
import type { ListingCardProps } from '@/features/listings/types/listingCard.types';

const LISTING_LIFETIME_MS = 24 * 60 * 60 * 1000;
const COUNTDOWN_TICK_MS = 60 * 1000;
const IMAGE_SIZE = 112;

function useRemainingTime(createdAt: number): string {
  const [now, setNow] = React.useState(() => Date.now());

  React.useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), COUNTDOWN_TICK_MS);
    return () => clearInterval(timer);
  }, []);

  const remainingMs = Math.max(0, createdAt + LISTING_LIFETIME_MS - now);
  const hours = Math.floor(remainingMs / (60 * 60 * 1000));
  const minutes = Math.floor((remainingMs % (60 * 60 * 1000)) / (60 * 1000));
  return `${hours}h ${minutes}m`;
}

/**
 * Requests-tab list card, shared by every listing category (equipment, service, gold auction):
 * square photo, title/subtitle, badge rows, price, and an optional countdown timer.
 */
export function ListingCard({
  title,
  thumbnail,
  placeholderIcon,
  subtitle,
  subtitleIcon,
  primaryBadge,
  secondaryBadges,
  cornerBadge,
  priceText,
  createdAt,
  onPress,
}: ListingCardProps): React.ReactElement {
  const timeLeft = useRemainingTime(createdAt ?? 0);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={title}
      style={({ pressed }) => [styles.card, cardBackShadow, pressed && styles.pressed]}
    >
      {cornerBadge ? (
        <View style={styles.cornerBadge}>
          {cornerBadge.icon ? (
            <Ionicons name={cornerBadge.icon} size={12} color={palette.pureWhite} />
          ) : null}
          <AppText weight="semibold" style={styles.cornerBadgeText}>
            {cornerBadge.label}
          </AppText>
        </View>
      ) : null}

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
          <AppText weight="bold" style={styles.title} numberOfLines={1}>
            {title}
          </AppText>
          {subtitle ? (
            <View style={styles.subtitleRow}>
              {subtitleIcon ? (
                <Ionicons name={subtitleIcon} size={13} color={palette.gold} />
              ) : null}
              <AppText style={styles.subtitle} numberOfLines={1}>
                {subtitle}
              </AppText>
            </View>
          ) : null}

          {secondaryBadges && secondaryBadges.length > 0 ? (
            <View style={styles.badgeRow}>
              {secondaryBadges.map((badge) => (
                <View key={badge.key} style={styles.secondaryBadge}>
                  <AppText weight="semibold" style={styles.secondaryBadgeText}>
                    {badge.label}
                  </AppText>
                </View>
              ))}
            </View>
          ) : null}

          <View style={styles.bottomRow}>
            {primaryBadge ? (
              <View style={styles.primaryBadge}>
                {primaryBadge.icon ? (
                  <Ionicons name={primaryBadge.icon} size={11} color={palette.pureWhite} />
                ) : null}
                <AppText weight="semibold" style={styles.primaryBadgeText}>
                  {primaryBadge.label}
                </AppText>
              </View>
            ) : null}
            {priceText ? (
              <AppText weight="bold" style={styles.price} numberOfLines={1}>
                {priceText}
              </AppText>
            ) : null}
            {createdAt ? (
              <View style={styles.timerBadge}>
                <Ionicons name="time-outline" size={11} color={palette.gold} />
                <AppText weight="semibold" style={styles.timerText}>
                  {timeLeft}
                </AppText>
              </View>
            ) : null}
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
    gap: spacing.sm,
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
    justifyContent: 'center',
    gap: spacing.xs,
  },
  title: {
    fontSize: 15,
    color: palette.charcoal,
    paddingRight: 84,
  },
  subtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  subtitle: {
    fontSize: 13,
    color: palette.muted,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  secondaryBadge: {
    backgroundColor: palette.softGold,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  secondaryBadgeText: {
    fontSize: 11,
    color: palette.gold,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.xs,
  },
  primaryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: palette.gold,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  primaryBadgeText: {
    fontSize: 11,
    color: palette.pureWhite,
  },
  price: {
    fontSize: 13,
    color: palette.charcoal,
  },
  cornerBadge: {
    position: 'absolute',
    top: 6,
    right: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: radius.pill,
    backgroundColor: palette.gold,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    zIndex: 1,
  },
  cornerBadgeText: {
    fontSize: 11,
    color: palette.pureWhite,
  },
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: palette.softGold,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  timerText: {
    fontSize: 11,
    color: palette.gold,
  },
});
