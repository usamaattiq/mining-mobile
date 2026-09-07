import React from 'react';
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { RootStackParamList } from '@/navigation/types';
import { spacing } from '@/shared/theme/tokens';

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

const mainHomeImage = require('@/assets/images/main-home.png');
const mainHomeImageSize = Image.resolveAssetSource(mainHomeImage);
const mainHomeAspectRatio =
  mainHomeImageSize.width && mainHomeImageSize.height
    ? mainHomeImageSize.width / mainHomeImageSize.height
    : 1;
const screenWidth = Dimensions.get('window').width;
const mainHomeImageHeight = screenWidth / mainHomeAspectRatio;

const colors = {
  bg: '#F8EFDD',
  charcoal: '#26221D',
  gold: '#D69A2D',
  goldDark: '#B9822A',
  muted: '#8E877C',
  iconTile: '#F0E0BE',
};

export function OnboardingScreen({ navigation }: Props): React.ReactElement {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root}>
      <View style={styles.imageClip}>
        <Image
          source={mainHomeImage}
          style={[styles.image, { height: mainHomeImageHeight }]}
          resizeMode="contain"
        />
      </View>

      <LinearGradient
        colors={[colors.bg, colors.bg, `${colors.bg}E6`, `${colors.bg}66`, 'transparent']}
        locations={[0, 0.42, 0.58, 0.72, 0.85]}
        style={styles.topFade}
      />

      <LinearGradient
        colors={['transparent', 'rgba(18,14,9,0.4)', 'rgba(12,9,6,0.88)']}
        locations={[0, 0.55, 1]}
        style={styles.bottomFade}
      />

      <View style={[styles.content, { paddingTop: Math.max(insets.top, spacing.md) }]}>
        <View style={styles.topBar}>
          <View style={styles.logoRow}>
            <View style={styles.logoMark}>
              <MaterialCommunityIcons name="triangle-outline" size={22} color={colors.gold} />
            </View>
            <View>
              <Text style={styles.brand}>
                <Text style={styles.brandMine}>Mine</Text>
                <Text style={styles.brandMarket}>Market</Text>
              </Text>
              <Text style={styles.tagline}>EQUIP · SOURCE · BUILD TOGETHER</Text>
            </View>
          </View>
          <TouchableOpacity onPress={() => navigation.replace('Login')} hitSlop={8}>
            <Text style={styles.skip}>Skip</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.headline}>
          <Text style={styles.headlineText}>
            Powering{'\n'}a Stronger{'\n'}
            <Text style={styles.headlineAccent}>Mining Tomorrow</Text>
          </Text>
          <Text style={styles.subtext}>
            Your all-in-one marketplace for equipment, services, products and gold.
          </Text>
        </View>
      </View>

      <View style={[styles.actions, { paddingBottom: Math.max(insets.bottom, spacing.lg) }]}>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => navigation.replace('SignUp')}
          style={styles.signUpButtonWrap}
        >
          <LinearGradient
            colors={[colors.gold, colors.goldDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.actionButton}
          >
            <Text style={styles.signUpLabel}>Sign Up</Text>
            <Ionicons name="arrow-forward" size={18} color={colors.charcoal} />
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => navigation.replace('Login')}
          style={[styles.actionButton, styles.loginButton]}
        >
          <Text style={styles.loginLabel}>Log In</Text>
          <Ionicons name="arrow-forward" size={18} color={colors.gold} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  imageClip: {
    ...StyleSheet.absoluteFill,
    overflow: 'hidden',
  },
  image: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: '100%',
  },
  topFade: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '60%',
  },
  bottomFade: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '38%',
  },
  content: {
    paddingHorizontal: spacing.lg,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  logoMark: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brand: {
    fontSize: 18,
  },
  brandMine: {
    fontWeight: '800',
    color: colors.charcoal,
  },
  brandMarket: {
    fontWeight: '800',
    color: colors.gold,
  },
  tagline: {
    fontSize: 9,
    letterSpacing: 1.2,
    color: colors.muted,
    marginTop: 1,
  },
  skip: {
    fontSize: 14,
    color: colors.muted,
    marginTop: 6,
  },
  headline: {
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  headlineText: {
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '800',
    color: colors.charcoal,
  },
  headlineAccent: {
    color: colors.gold,
  },
  subtext: {
    fontSize: 13,
    lineHeight: 19,
    color: colors.muted,
    maxWidth: '92%',
  },
  actions: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  signUpButtonWrap: {
    borderRadius: 28,
    shadowColor: colors.goldDark,
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    height: 56,
    borderRadius: 28,
  },
  signUpLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.charcoal,
  },
  loginButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.gold,
  },
  loginLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.charcoal,
  },
});
