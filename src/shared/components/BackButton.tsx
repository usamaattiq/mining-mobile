import React from 'react';
import { StyleSheet, TouchableOpacity, type TouchableOpacityProps } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { palette, radius } from '@/shared/theme/tokens';

export function BackButton(props: TouchableOpacityProps): React.ReactElement {
  return (
    <TouchableOpacity style={styles.button} hitSlop={8} activeOpacity={0.7} {...props}>
      <Ionicons name="chevron-back" size={22} color={palette.charcoal} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    backgroundColor: palette.softGold,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
