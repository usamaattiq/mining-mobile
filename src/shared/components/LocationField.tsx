import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { i18n as appI18n } from '@/i18n';
import { AppText } from '@/shared/components/AppText';
import { palette, radius, spacing } from '@/theme';
import { splitLocationLabel } from '@/shared/utils/locationLabel';
import type { LocationFieldProps } from '@/shared/types/locationField.types';

/** Location field with "use current location" / "select on map" actions — shared by sign-up and listing forms. */
export function LocationField({
  label,
  value,
  required = false,
  loading = false,
  onUseCurrentLocation,
  onSelectOnMap,
}: LocationFieldProps): React.ReactElement {
  const { t } = useTranslation(undefined, { i18n: appI18n });
  const hasValue = Boolean(value?.trim());
  const { addressLine, city, country } = splitLocationLabel(value?.trim() ?? '');
  const cityCountry = [city, country].filter(Boolean).join(', ');
  const displayLine = addressLine || value?.trim() || '';

  return (
    <View style={styles.wrap}>
      <AppText weight="semibold" style={styles.label}>
        {label}
        {required ? <AppText style={styles.required}> *</AppText> : null}
      </AppText>

      {hasValue ? (
        <View style={styles.valueBox}>
          <Ionicons name="location" size={16} color={palette.gold} style={styles.valueIcon} />
          <View style={styles.valueTextAnchor}>
            <AppText style={styles.valueText}>{displayLine}</AppText>
            {cityCountry ? (
              <AppText style={styles.cityCountry} numberOfLines={1}>
                {cityCountry}
              </AppText>
            ) : null}
          </View>
        </View>
      ) : (
        <AppText style={styles.placeholder}>{t('location.locationPlaceholder')}</AppText>
      )}

      <View style={styles.actionsRow}>
        <Pressable
          style={({ pressed }) => [styles.actionButton, pressed && styles.actionButtonPressed]}
          onPress={onUseCurrentLocation}
          disabled={loading}
          accessibilityRole="button"
        >
          {loading ? (
            <ActivityIndicator size="small" color={palette.gold} />
          ) : (
            <Ionicons name="navigate-outline" size={14} color={palette.gold} />
          )}
          <AppText weight="semibold" style={styles.actionText} numberOfLines={1}>
            {t('location.useCurrentLocation')}
          </AppText>
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.actionButton, pressed && styles.actionButtonPressed]}
          onPress={onSelectOnMap}
          accessibilityRole="button"
        >
          <Ionicons name="map-outline" size={14} color={palette.gold} />
          <AppText weight="semibold" style={styles.actionText} numberOfLines={1}>
            {t('location.selectOnMap')}
          </AppText>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.xs,
  },
  label: {
    fontSize: 13,
    color: palette.charcoal,
  },
  required: {
    fontSize: 13,
    color: palette.danger,
  },
  valueBox: {
    minHeight: 50,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: palette.softGold,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: palette.pureWhite,
  },
  valueIcon: {
    marginTop: 3,
  },
  valueTextAnchor: {
    flex: 1,
  },
  valueText: {
    fontSize: 14,
    lineHeight: 20,
    color: palette.charcoal,
  },
  cityCountry: {
    marginTop: 2,
    fontSize: 11,
    color: palette.muted,
  },
  placeholder: {
    fontSize: 13,
    color: palette.muted,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
    minHeight: 38,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: palette.softGold,
    backgroundColor: palette.softGold,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  actionButtonPressed: {
    backgroundColor: palette.lightGold,
    borderColor: palette.gold,
  },
  actionText: {
    color: palette.gold,
    fontSize: 12,
  },
});
