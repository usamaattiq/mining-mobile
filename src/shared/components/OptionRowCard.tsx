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
function LeadingIcon({
  icon,
  iconImage,
  compact,
}: {
  icon: OptionRowCardProps['icon'];
  iconImage?: OptionRowCardProps['iconImage'];
  compact: boolean;
}): React.ReactElement {
  if (iconImage) {
    return (
      <View style={[styles.iconWrap, styles.iconImageWrap, compact && styles.iconWrapCompact]}>
        <Image
          source={iconImage}
          style={compact ? styles.iconImageCompact : styles.iconImage}
          contentFit="contain"
        />
      </View>
    );
  }

  return (
    <LinearGradient
      colors={[palette.lightGold, palette.gold, palette.goldDark]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.iconWrap, compact && styles.iconWrapCompact]}
    >
      <Ionicons name={icon} size={compact ? 22 : 30} color={palette.pureWhite} />
    </LinearGradient>
  );
}

export function OptionRowCard({
  icon,
  iconImage,
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
        compact ? styles.cardCompact : null,
        selected ? styles.cardSelected : null,
        cardBackShadow,
        image && !compact ? styles.cardWithImage : null,
        pressed ? styles.cardPressed : null,
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
              end={{
                x: 0.9,

                y: 0.5,
              }}
              style={styles.sideFade}
            />
          </View>
          <View style={[styles.heading, styles.headingBesideImage]}>
            <LeadingIcon icon={icon} iconImage={iconImage} compact={false} />
            <View style={styles.copy}>
              <AppText weight="bold" style={styles.title}>
                {title}
              </AppText>
              {subtitle ? <AppText style={styles.subtitle}>{subtitle}</AppText> : null}
            </View>
          </View>
        </View>
      ) : (
        <View style={[styles.heading, compact && styles.headingCompact]}>
          <LeadingIcon icon={icon} iconImage={iconImage} compact={compact} />

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

      {compact && subtitle ? (
        <AppText style={styles.subtitleCompact} numberOfLines={3}>
          {subtitle}
        </AppText>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.md,
    backgroundColor: palette.warmWhite,
    borderRadius: radius.lg + 4,
    paddingHorizontal: spacing.md,
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
    width: '50%',
    overflow: 'hidden',
  },
  sideImage: {
    width: '100%',
    height: '100%',
  },
  sideTint: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
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
    alignSelf: 'stretch',
    width: '100%',
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
  iconImageWrap: {
    // backgroundColor: palette.softGold,
  },
  iconImage: {
    width: 76,
    height: 76,
  },
  iconImageCompact: {
    width: 24,
    height: 24,
  },
  copy: {
    flex: 1,
    minWidth: 0,
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
    flexShrink: 1,
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
