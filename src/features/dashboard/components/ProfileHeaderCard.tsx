import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '@/shared/components/AppText';
import { palette, spacing } from '@/theme';
import type { ProfileHeaderCardProps } from '@/features/dashboard/types/profileHeaderCard.types';

/** Gold identity header used atop the dashboard Profile screen — avatar, name, and contact meta. */
export function ProfileHeaderCard({
  initial,
  name,
  email,
  phone,
}: ProfileHeaderCardProps): React.ReactElement {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.card, { paddingTop: insets.top + spacing.md }]}>
      <View style={styles.inner}>
        <View style={styles.avatarRing}>
          <AppText weight="bold" style={styles.avatarInitial}>
            {initial}
          </AppText>
        </View>

        <View style={styles.copy}>
          <AppText weight="bold" style={styles.name} numberOfLines={1}>
            {name}
          </AppText>
          {email ? (
            <View style={styles.metaRow}>
              <Ionicons name="mail" size={13} color={palette.pureWhite} />
              <AppText style={styles.metaText} numberOfLines={1}>
                {email}
              </AppText>
            </View>
          ) : null}
          {phone ? (
            <View style={styles.metaRow}>
              <Ionicons name="call" size={13} color={palette.pureWhite} />
              <AppText style={styles.metaText} numberOfLines={1}>
                {phone}
              </AppText>
            </View>
          ) : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: palette.gold,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  avatarRing: {
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 2,
    borderColor: palette.pureWhite,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontSize: 32,
    color: palette.pureWhite,
  },
  copy: {
    flex: 1,
    gap: 6,
    paddingTop: 4,
  },
  name: {
    fontSize: 20,
    lineHeight: 26,
    color: palette.pureWhite,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    flex: 1,
    fontSize: 13,
    color: 'rgba(255,255,255,0.92)',
  },
});
