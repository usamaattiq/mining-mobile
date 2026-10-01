import React from 'react';
import { StyleSheet, Switch, View } from 'react-native';
import { AppText } from '@/shared/components/AppText';
import { palette, radius, spacing } from '@/theme';
import type { ToggleRowProps } from '@/shared/types/toggleRow.types';

/** Generic label(+subtitle)/switch row — e.g. "Delivery available" on a listing form. */
export function ToggleRow({
  title,
  subtitle,
  enabled,
  onToggle,
  disabled,
}: ToggleRowProps): React.ReactElement {
  return (
    <View style={styles.row}>
      <View style={styles.copy}>
        <AppText weight="semibold" style={styles.title}>
          {title}
        </AppText>
        {subtitle ? <AppText style={styles.subtitle}>{subtitle}</AppText> : null}
      </View>
      <Switch
        value={enabled}
        onValueChange={onToggle}
        disabled={disabled}
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
    borderWidth: 1,
    borderColor: palette.softGold,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
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
