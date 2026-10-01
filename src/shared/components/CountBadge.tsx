import React from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText } from '@/shared/components/AppText';
import { palette } from '@/theme';
import type { CountBadgeProps } from '@/shared/types/countBadge.types';

export function CountBadge({ count }: CountBadgeProps): React.ReactElement | null {
  if (count <= 0) return null;
  return (
    <View style={styles.badge}>
      <AppText weight="semibold" style={styles.text}>
        {count}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    paddingHorizontal: 6,
    backgroundColor: palette.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 11,
    color: palette.pureWhite,
  },
});
