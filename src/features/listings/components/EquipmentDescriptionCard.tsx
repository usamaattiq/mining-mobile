import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { i18n as appI18n } from '@/i18n';
import { AppText } from '@/shared/components/AppText';
import { palette, radius, spacing } from '@/theme';
import { cardBackShadow } from '@/theme/cardShadow';
import type { EquipmentDescriptionCardProps } from '@/features/listings/types/equipmentDescriptionCard.types';

const COLLAPSED_LINES = 2;

/** Standalone card for the listing description, collapsible via a chevron toggle. */
export function EquipmentDescriptionCard({
  description,
}: EquipmentDescriptionCardProps): React.ReactElement {
  const { t } = useTranslation(undefined, { i18n: appI18n });
  const [expanded, setExpanded] = React.useState(false);

  return (
    <View style={[styles.card, cardBackShadow]}>
      <Pressable
        onPress={() => setExpanded((prev) => !prev)}
        style={styles.header}
        accessibilityRole="button"
        accessibilityLabel={t('equipmentListing.description')}
      >
        <AppText weight="bold" style={styles.title}>
          {t('equipmentListing.description')}
        </AppText>
        <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={18} color={palette.muted} />
      </Pressable>
      <AppText style={styles.description} numberOfLines={expanded ? undefined : COLLAPSED_LINES}>
        {description}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: palette.warmWhite,
    borderWidth: 1,
    borderColor: palette.softGold,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 15,
    color: palette.charcoal,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    color: palette.muted,
  },
});
