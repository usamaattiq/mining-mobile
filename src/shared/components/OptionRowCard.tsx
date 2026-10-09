import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/shared/components/AppText';
import { palette, radius, spacing } from '@/theme';
import { cardBackShadow } from '@/theme/cardShadow';
import type { OptionRowCardProps } from '@/shared/types/optionRowCard.types';

/** Bold, gradient-icon full-width row card used for a small set of tappable choices (e.g. Rent/Sell, Onsite/Online, quick-create). */
export function OptionRowCard({
  icon,
  title,
  subtitle,
  onPress,
  selected = false,
  compact = false,
  image,
}: OptionRowCardProps): React.ReactElement {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={title}
      style={({ pressed }) => [
        styles.card,
        compact && styles.cardCompact,
        selected && styles.cardSelected,
        cardBackShadow,
        image && !compact && styles.cardWithImage,
        pressed && styles.cardPressed,
      ]}
    >
      {image && !compact ? (
        <View style={styles.imageRow}>
          <View style={styles.sideImageWrap} pointerEvents="none">
            <Image
              source={image}
              style={styles.sideImage}
              contentFit="cover"
              contentPosition="right center"
            />
            <View style={styles.sideTint} />
            <LinearGradient
              colors={[palette.warmWhite, 'rgba(252, 249, 240, 0)']}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 0.9
                
                
                , y: 0.5 }}
              style={styles.sideFade}
            />
          </View>
          <View style={[styles.heading, styles.headingBesideImage]}>
            <LinearGradient
              colors={[palette.lightGold, palette.gold, palette.goldDark]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.iconWrap}
            >
              <Ionicons name={icon} size={30} color={palette.pureWhite} />
            </LinearGradient>
            <View style={styles.copy}>
              <AppText weight="bold" style={styles.title}>
                {title}
              </AppText>
              {subtitle ? <AppText style={styles.subtitle}>{subtitle}</AppText> : null}
            </View>
          </View>
        </View>
      ) : (
      <View
        style={[
          styles.heading,
          compact && styles.headingCompact,
        ]}
      >
        <LinearGradient
          colors={[palette.lightGold, palette.gold, palette.goldDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.iconWrap, compact && styles.iconWrapCompact]}
        >
          <Ionicons name={icon} size={compact ? 22 : 30} color={palette.pureWhite} />
        </LinearGradient>

        <View style={styles.copy}>
          <AppText weight="bold" style={[styles.title, compact && styles.titleCompact]}>
            {title}
          </AppText>
          {compact || !subtitle ? null : <AppText style={styles.subtitle}>{subtitle}</AppText>}
        </View>

        {compact ? (
          selected ? (
            <Ionicons name="checkmark-circle" size={20} color={palette.gold} />
          ) : (
            <View style={styles.radio} />
          )
        ) : image ? null : (
          <View style={styles.chevronWrap}>
            <Ionicons
              name={selected ? 'checkmark' : 'chevron-forward'}
              size={20}
              color={palette.gold}
            />
          </View>
        )}
      </View>
      )}

      {compact && subtitle ? <AppText style={styles.subtitleCompact}>{subtitle}</AppText> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.md,
    backgroundColor: palette.warmWhite,
    borderRadius: radius.lg + 4,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderWidth: 2,
    borderColor: 'transparent',
    overflow: 'hidden',
  },
  cardWithImage: {
    height: 148,
    paddingVertical: 0,
    paddingRight: 0,
    justifyContent: 'center',
  },
  imageRow: {
    height: 148,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  sideImageWrap: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: '40%',
    overflow: 'hidden',
  },
  sideImage: {
    width: '100%',
    height: '100%',
  },
  sideTint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(252, 249, 240, 0.28)',
  },
  sideFade: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: '100%',
  },
  cardCompact: {
    flex: 1,
    minWidth: 0,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    borderRadius: radius.lg,
    gap: spacing.sm,
  },
  heading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    zIndex: 1,
  },
  headingBesideImage: {
    zIndex: 1,
    paddingRight: '40%',
    paddingVertical: spacing.md,
  },
  headingCompact: {
    gap: spacing.sm,
    alignItems: 'center',
  },
  cardSelected: {
    borderColor: palette.gold,
    backgroundColor: palette.softGold,
  },
  cardPressed: {
    borderColor: palette.gold,
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapCompact: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
  },
  copy: {
    flex: 1,
    gap: 3,
  },
  title: {
    fontSize: 18,
    color: palette.charcoal,
  },
  titleCompact: {
    fontSize: 15,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 18,
    color: palette.muted,
  },
  subtitleCompact: {
    fontSize: 11,
    lineHeight: 15,
    color: palette.muted,
  },
  chevronWrap: {
    width: 32,
    height: 32,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.softGold,
  },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: palette.softGold,
  },
});
