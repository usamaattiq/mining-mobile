import React from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText } from '@/shared/components/AppText';
import { initialsFromName } from '@/shared/utils/initialsFromName';
import { palette } from '@/theme';
import type { InitialsAvatarProps } from '@/shared/types/initialsAvatar.types';

const SIZE = { sm: 28, md: 52 } as const;
const FONT = { sm: 10, md: 15 } as const;

export function InitialsAvatar({ name, size = 'md' }: InitialsAvatarProps): React.ReactElement {
  const dimension = SIZE[size];
  return (
    <View style={[styles.avatar, { width: dimension, height: dimension, borderRadius: dimension / 2 }]}>
      <AppText weight="bold" style={[styles.text, { fontSize: FONT[size] }]}>
        {initialsFromName(name)}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    backgroundColor: palette.softGold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: palette.gold,
  },
});
