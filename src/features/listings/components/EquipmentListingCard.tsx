import React from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { i18n as appI18n } from '@/i18n';
import { AppText } from '@/shared/components/AppText';
import { palette, radius, spacing } from '@/theme';
import { cardBackShadow } from '@/theme/cardShadow';
import type { EquipmentListingCardProps } from '@/features/listings/types/equipmentListingCard.types';

/** Requests-tab list card: first photo on the left, title/type/price on the right. */
export function EquipmentListingCard({
  listing,
  onPress,
}: EquipmentListingCardProps): React.ReactElement {
  const { t } = useTranslation(undefined, { i18n: appI18n });
  const thumbnail = listing.media[0]?.uri;

  const priceText =
    listing.mode === 'sell'
      ? listing.salePrice
      : listing.hourlyRental || listing.monthlyRental || listing.yearlyRental;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={listing.title}
      style={({ pressed }) => [styles.card, cardBackShadow, pressed && styles.pressed]}
    >
      <View style={styles.thumbWrap}>
        {thumbnail ? (
          <Image source={{ uri: thumbnail }} style={styles.thumb} />
        ) : (
          <View style={[styles.thumb, styles.thumbPlaceholder]}>
            <Ionicons name="image-outline" size={24} color={palette.muted} />
          </View>
        )}
      </View>

      <View style={styles.copy}>
        <AppText weight="bold" style={styles.title} numberOfLines={1}>
          {listing.title}
        </AppText>
        <AppText style={styles.type} numberOfLines={1}>
          {listing.equipmentTypeLabel}
        </AppText>
        <View style={styles.metaRow}>
          <View style={styles.modeBadge}>
            <AppText weight="semibold" style={styles.modeBadgeText}>
              {t(listing.mode === 'rent' ? 'equipmentListing.rent' : 'equipmentListing.sell')}
            </AppText>
          </View>
          {priceText ? (
            <AppText style={styles.price} numberOfLines={1}>
              {priceText}
            </AppText>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    gap: spacing.md,
    backgroundColor: palette.pureWhite,
    borderRadius: radius.lg,
    padding: spacing.sm,
  },
  pressed: {
    opacity: 0.9,
  },
  thumbWrap: {
    width: 72,
    height: 72,
  },
  thumb: {
    width: 72,
    height: 72,
    borderRadius: radius.md,
  },
  thumbPlaceholder: {
    backgroundColor: palette.softGold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    flex: 1,
    justifyContent: 'center',
    gap: 4,
  },
  title: {
    fontSize: 15,
    color: palette.charcoal,
  },
  type: {
    fontSize: 13,
    color: palette.muted,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: 2,
  },
  modeBadge: {
    backgroundColor: palette.softGold,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  modeBadgeText: {
    fontSize: 11,
    color: palette.gold,
  },
  price: {
    fontSize: 13,
    color: palette.charcoal,
  },
});
