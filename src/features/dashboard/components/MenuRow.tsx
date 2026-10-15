import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/shared/components/AppText';
import { palette, radius, spacing } from '@/theme';
import type { MenuRowProps } from '@/features/dashboard/types/menuRow.types';

export function MenuRow({
  icon,
  label,
  subtitle,
  onPress,
  disabled,
  variant = 'default',
  showBorder,
  accessibilityLabel,
}: MenuRowProps): React.ReactElement {
  const isGold = variant === 'gold';

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      style={({ pressed }) => [
        styles.row,
        isGold && styles.rowGold,
        !isGold && showBorder && styles.rowBorder,
        disabled && styles.rowDisabled,
        pressed && styles.pressed,
      ]}
    >
      <View style={[styles.iconWrap, isGold ? styles.iconWrapGold : styles.iconWrapDefault]}>
        <Ionicons
          name={icon}
          size={isGold ? 22 : 20}
          color={isGold ? palette.pureWhite : palette.gold}
        />
      </View>
      <View style={styles.copy}>
        <AppText
          weight={isGold ? 'bold' : 'semibold'}
          style={[styles.label, isGold && styles.labelGold]}
        >
          {label}
        </AppText>
        {subtitle ? (
          <AppText style={[styles.subtitle, isGold && styles.subtitleGold]}>{subtitle}</AppText>
        ) : null}
      </View>
      <Ionicons
        name="chevron-forward"
        size={18}
        color={isGold ? 'rgba(255,255,255,0.7)' : palette.muted}
      />
    </Pressable>
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
  rowGold: {
    backgroundColor: palette.gold,
    borderRadius: radius.lg,
    minHeight: 72,
    shadowColor: '#000000',
    shadowOpacity: 0.18,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 14,
    elevation: 6,
  },
  rowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: palette.softGold,
  },
  rowDisabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.88,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapDefault: {
    backgroundColor: palette.softGold,
  },
  iconWrapGold: {
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
  },
  copy: {
    flex: 1,
    gap: 2,
  },
  label: {
    fontSize: 15,
    color: palette.charcoal,
  },
  labelGold: {
    color: palette.pureWhite,
  },
  subtitle: {
    fontSize: 12,
    lineHeight: 16,
    color: palette.muted,
  },
  subtitleGold: {
    color: 'rgba(255,255,255,0.8)',
  },
});
