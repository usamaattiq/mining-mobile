import React from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { i18n as appI18n } from '@/i18n';
import { AppText } from '@/shared/components/AppText';
import { palette, radius, spacing } from '@/theme';
import { cardBackShadow } from '@/theme/cardShadow';
import type { EquipmentListingCardProps } from '@/features/listings/types/equipmentListingCard.types';

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

/** Requests-tab list card: square photo on the left with title/type/units beside it, badges + timer row below. */
export function EquipmentListingCard({
  listing,
  onPress,
}: EquipmentListingCardProps): React.ReactElement {
  const { t } = useTranslation(undefined, { i18n: appI18n });
  const thumbnail = listing.media[0]?.uri;
  const timeLeft = useRemainingTime(listing.createdAt);

  const modeBadgeLabel = t(
    listing.mode === 'rent' ? 'equipmentListing.rent' : 'equipmentListing.sell',
  );

  const durationBadges =
    listing.mode === 'rent'
      ? [
          listing.hourlyRental ? t('equipmentListing.hourlyBadge') : null,
          listing.weeklyRental ? t('equipmentListing.weeklyBadge') : null,
          listing.monthlyRental ? t('equipmentListing.monthlyBadge') : null,
        ].filter((label): label is string => Boolean(label))
      : [t('equipmentListing.saleBadge')];

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={listing.title}
      style={({ pressed }) => [styles.card, cardBackShadow, pressed && styles.pressed]}
    >
      {listing.deliveryAvailable ? (
        <View style={styles.deliveryBadge}>
          <Ionicons name="car-outline" size={12} color={palette.pureWhite} />
          <AppText weight="semibold" style={styles.deliveryBadgeText}>
            {t('equipmentListing.deliveryBadge')}
          </AppText>
        </View>
      ) : null}

      <View style={styles.row}>
        <View style={styles.imageWrap}>
          {thumbnail ? (
            <Image source={{ uri: thumbnail }} style={styles.image} />
          ) : (
            <View style={[styles.image, styles.imagePlaceholder]}>
              <Ionicons name="image-outline" size={24} color={palette.muted} />
            </View>
          )}
        </View>

        <View style={styles.copy}>
          <AppText weight="bold" style={styles.title} numberOfLines={1}>
            {listing.title}
          </AppText>
          <View style={styles.typeRow}>
            <Ionicons name="construct-outline" size={13} color={palette.gold} />
            <AppText style={styles.type} numberOfLines={1}>
              {listing.equipmentTypeLabel}
            </AppText>
          </View>
          <View style={styles.unitsRow}>
            <Ionicons name="cube-outline" size={12} color={palette.muted} />
            <AppText style={styles.units}>
              {t('equipmentListing.unitsCount', { count: listing.units })}
            </AppText>
          </View>

          <View style={styles.badgeRow}>
            {durationBadges.map((label) => (
              <View key={label} style={styles.durationBadge}>
                <AppText weight="semibold" style={styles.durationBadgeText}>
                  {label}
                </AppText>
              </View>
            ))}
          </View>
          <View style={styles.modeBadgeRow}>
            <View style={styles.modeBadge}>
              <AppText weight="semibold" style={styles.modeBadgeText}>
                {modeBadgeLabel}
              </AppText>
            </View>
            <View style={styles.timerBadge}>
              <Ionicons name="time-outline" size={11} color={palette.gold} />
              <AppText weight="semibold" style={styles.timerText}>
                {timeLeft}
              </AppText>
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
  typeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  type: {
    fontSize: 13,
    color: palette.muted,
  },
  unitsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  units: {
    fontSize: 12,
    color: palette.muted,
  },
  modeBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.xs,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  modeBadge: {
    backgroundColor: palette.gold,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  modeBadgeText: {
    fontSize: 11,
    color: palette.pureWhite,
  },
  durationBadge: {
    backgroundColor: palette.softGold,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  durationBadgeText: {
    fontSize: 11,
    color: palette.gold,
  },
  deliveryBadge: {
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
  deliveryBadgeText: {
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
