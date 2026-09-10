import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { i18n as appI18n } from '@/i18n';
import { AppText } from '@/shared/components/AppText';
import { palette, radius, spacing } from '@/theme';

type DeliveryAvailableBannerProps = {
  /** e.g. "Free" or "Per KM · 5" — shown under the main label when provided. */
  subtitle?: string;
};

/** Static, non-interactive card shown on the listing detail/review screens when delivery is offered. */
export function DeliveryAvailableBanner({
  subtitle,
}: DeliveryAvailableBannerProps): React.ReactElement {
  const { t } = useTranslation(undefined, { i18n: appI18n });

  return (
    <View style={styles.root}>
      <View style={styles.iconWrap}>
        <Ionicons name="car-outline" size={22} color={palette.gold} />
      </View>
      <View style={styles.copy}>
        <AppText weight="semibold" style={styles.text}>
          {t('equipmentListing.deliveryAvailable')}
        </AppText>
        {subtitle ? <AppText style={styles.subtitle}>{subtitle}</AppText> : null}
      </View>
      <View style={styles.checkWrap}>
        <Ionicons name="checkmark-circle" size={20} color={palette.gold} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: palette.warmWhite,
    borderWidth: 1,
    borderColor: palette.softGold,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    backgroundColor: palette.softGold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    flex: 1,
    gap: 2,
  },
  text: {
    fontSize: 15,
    color: palette.charcoal,
  },
  subtitle: {
    fontSize: 13,
    color: palette.muted,
  },
  checkWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
