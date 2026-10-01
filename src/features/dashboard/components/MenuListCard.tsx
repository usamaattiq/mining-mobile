import React from 'react';
import { StyleSheet, View } from 'react-native';
import { MenuRow } from '@/features/dashboard/components/MenuRow';
import { palette, radius } from '@/theme';
import type { MenuListCardProps } from '@/features/dashboard/types/menuListCard.types';

/** Off-white rounded card of stacked MenuRow items with dividers between them. */
export function MenuListCard({ items }: MenuListCardProps): React.ReactElement {
  return (
    <View style={styles.card}>
      {items.map((item, index) => (
        <MenuRow key={item.label + index} {...item} showBorder={index < items.length - 1} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: palette.warmWhite,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
});
