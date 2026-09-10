import React from 'react';
import { StyleSheet, Switch, View } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { AppText } from '@/shared/components/AppText';
import { palette, radius, spacing } from '@/theme';
import type { BiometricToggleRowProps } from '@/shared/types/biometricToggleRow.types';

export function BiometricToggleRow({
  enabled,
  onToggle,
  title,
  subtitle,
  kind,
  available = true,
}: BiometricToggleRowProps): React.ReactElement {
  return (
    <View style={styles.row}>
      <View style={styles.iconWrap}>
        {kind === 'face' ? (
          <MaterialCommunityIcons name="face-recognition" size={20} color={palette.gold} />
        ) : kind === 'fingerprint' ? (
          <MaterialCommunityIcons name="fingerprint" size={20} color={palette.gold} />
        ) : (
          <Ionicons name="finger-print-outline" size={20} color={palette.gold} />
        )}
      </View>
      <View style={styles.copy}>
        <AppText weight="semibold" style={styles.title}>
          {title}
        </AppText>
        <AppText style={styles.subtitle}>{subtitle}</AppText>
      </View>
      <Switch
        value={enabled}
        onValueChange={onToggle}
        disabled={!available && !enabled}
        trackColor={{ true: palette.gold, false: palette.softGold }}
        thumbColor={palette.pureWhite}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    minHeight: 68,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: palette.softGold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 15,
    color: palette.charcoal,
  },
  subtitle: {
    fontSize: 12,
    lineHeight: 16,
    color: palette.muted,
  },
});
