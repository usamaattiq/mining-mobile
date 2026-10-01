import React from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '@/shared/components/AppText';
import { palette, spacing } from '@/theme';
import type { ProfileHeaderCardProps } from '@/features/dashboard/types/profileHeaderCard.types';

/** Gold identity header used atop the dashboard Profile screen — avatar, name, and contact meta. */
export function ProfileHeaderCard({
  initial,
  avatarUrl,
  name,
  phone,
  companyName,
  onPressAvatar,
  logoutLabel,
  onLogout,
  logoutDisabled,
}: ProfileHeaderCardProps): React.ReactElement {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.card, { paddingTop: insets.top + spacing.sm }]}>
      <View style={styles.inner}>
        <Pressable
          style={styles.avatarRing}
          onPress={onPressAvatar}
          disabled={!onPressAvatar}
          accessibilityRole={onPressAvatar ? 'button' : undefined}
        >
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
          ) : (
            <AppText weight="bold" style={styles.avatarInitial}>
              {initial}
            </AppText>
          )}
        </Pressable>

        <View style={styles.copy}>
          <AppText weight="bold" style={styles.name} numberOfLines={1}>
            {name}
          </AppText>
          {phone ? (
            <View style={styles.metaRow}>
              <Ionicons name="call" size={13} color={palette.pureWhite} />
              <AppText style={styles.metaText} numberOfLines={1}>
                {phone}
              </AppText>
            </View>
          ) : null}
          {companyName ? (
            <View style={styles.metaRow}>
              <Ionicons name="business" size={13} color={palette.pureWhite} />
              <AppText style={styles.metaText} numberOfLines={1}>
                {companyName}
              </AppText>
            </View>
          ) : null}
        </View>

        {onLogout && logoutLabel ? (
          <Pressable
            onPress={onLogout}
            disabled={logoutDisabled}
            accessibilityRole="button"
            accessibilityLabel={logoutLabel}
            hitSlop={10}
            style={({ pressed }) => [
              styles.logoutButton,
              pressed && styles.logoutPressed,
              logoutDisabled && styles.logoutDisabled,
            ]}
          >
            <FontAwesome name="sign-out" size={22} color={palette.pureWhite} />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: palette.gold,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xxl,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  avatarRing: {
    width: 78,
    height: 78,
    borderRadius: 39,
    borderWidth: 2,
    borderColor: palette.pureWhite,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarInitial: {
    fontSize: 32,
    color: palette.pureWhite,
  },
  copy: {
    flex: 1,
    minWidth: 0,
    gap: 6,
  },
  name: {
    fontSize: 24,
    lineHeight: 30,
    color: palette.pureWhite,
  },
  logoutButton: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutPressed: {
    opacity: 0.75,
  },
  logoutDisabled: {
    opacity: 0.55,
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
