import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { i18n as appI18n } from '@/i18n';
import type { RootStackParamList } from '@/navigation/types';
import { AppText } from '@/shared/components/AppText';
import { LanguageSwitcher } from '@/shared/components/language-switcher';
import { LegalDocumentSheet } from '@/shared/components/LegalDocumentSheet';
import type { LegalDocumentKind } from '@/shared/constants/legalContent';
import { palette, spacing } from '@/shared/theme/tokens';
import { getFontFamily } from '@/shared/theme/typography';

// The "Dahabi" brand wordmark stays in the Latin (Outfit) face
// regardless of active language, like other brand names.
const BRAND_FONT_BOLD = getFontFamily('en', 'bold');

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

const mainHomeImage = require('@/assets/images/main-home.png');
const mainHomeImageSize = Image.resolveAssetSource(mainHomeImage);
const mainHomeAspectRatio =
  mainHomeImageSize.width && mainHomeImageSize.height
    ? mainHomeImageSize.width / mainHomeImageSize.height
    : 1;

// Screen-local shades not part of the shared palette (background tint, muted
// text, icon tile) — the gold/charcoal accents below all come from `palette`
// so this screen stays visually in sync with the rest of the app.
const colors = {
  bg: '#FFFFFF',
  charcoal: palette.charcoal,
  gold: palette.gold,
  goldDark: palette.goldDark,
  muted: '#8E877C',
  iconTile: '#F0E0BE',
};

export function OnboardingScreen({ navigation }: Props): React.ReactElement {
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const mainHomeImageHeight = screenWidth / mainHomeAspectRatio;
  const { t } = useTranslation(undefined, { i18n: appI18n });
  const [legalDoc, setLegalDoc] = React.useState<LegalDocumentKind | null>(null);

  return (
    <View style={styles.root}>
      <View style={[styles.imageClip, { height: mainHomeImageHeight }]}>
        <Image
          source={mainHomeImage}
          style={[styles.image, { height: mainHomeImageHeight }]}
          resizeMode="contain"
        />
        <LinearGradient
          colors={['rgba(0, 0, 0, 0.65)', 'rgba(0, 0, 0, 0.25)', 'transparent']}
          locations={[0, 0.45, 1]}
          style={styles.imageOverlay}
        />
        <LinearGradient
          colors={['transparent', 'rgba(0, 0, 0, 0.35)', 'rgba(0, 0, 0, 0.72)']}
          locations={[0, 0.5, 1]}
          style={styles.bottomOverlay}
        />
      </View>

      <View style={[styles.content, { paddingTop: Math.max(insets.top, spacing.md) }]}>
        <View style={styles.topBar}>
          <View style={styles.logoRow}>
            <View style={styles.logoMark}>
              <MaterialCommunityIcons name="triangle-outline" size={22} color={colors.gold} />
            </View>
            <Text style={styles.brand}>
              <Text style={styles.brandMine}>Da</Text>
              <Text style={styles.brandMarket}>habi</Text>
            </Text>
          </View>
          <LanguageSwitcher />
        </View>
      </View>

      <View style={[styles.actions, { bottom: Math.max(insets.bottom, spacing.sm) + 40 }]}>
        <View style={styles.headline}>
          <AppText weight="bold" style={styles.headlineText}>
            {t('onboarding.headlineLine1')}
            {'\n'}
            {t('onboarding.headlineLine2')}
            {'\n'}
            <AppText weight="bold" style={styles.headlineAccent}>
              {t('onboarding.headlineAccent')}
            </AppText>
          </AppText>
          <AppText style={styles.subtext}>{t('onboarding.subtitle')}</AppText>
        </View>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => navigation.navigate('SignUpFlow')}
          style={[styles.signUpButtonWrap, styles.actionButton]}
        >
          <AppText weight="bold" style={styles.signUpLabel}>
            {t('onboarding.signUp')}
          </AppText>
          <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => navigation.navigate('Login')}
          style={[styles.actionButton, styles.loginButton]}
        >
          <AppText weight="bold" style={styles.loginLabel}>
            {t('onboarding.logIn')}
          </AppText>
          <Ionicons name="arrow-forward" size={18} color={colors.gold} />
        </TouchableOpacity>
      </View>

      <View style={[styles.legalRow, { bottom: Math.max(insets.bottom, spacing.sm) }]}>
        <TouchableOpacity onPress={() => setLegalDoc('privacy')} hitSlop={8}>
          <AppText style={styles.legalLink}>{t('onboarding.privacyPolicy')}</AppText>
        </TouchableOpacity>
        <AppText style={styles.legalDivider}>|</AppText>
        <TouchableOpacity onPress={() => setLegalDoc('terms')} hitSlop={8}>
          <AppText style={styles.legalLink}>{t('onboarding.terms')}</AppText>
        </TouchableOpacity>
      </View>

      <LegalDocumentSheet
        visible={legalDoc !== null}
        doc={legalDoc}
        onClose={() => setLegalDoc(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  imageClip: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    overflow: 'hidden',
  },
  image: {
    position: 'absolute',
    right: 0,
    top: 0,
    width: '100%',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFill,
  },
  bottomOverlay: {
    ...StyleSheet.absoluteFill,
  },
  content: {
    paddingHorizontal: spacing.lg,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: spacing.md,
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
    fontSize: 20,
    lineHeight: 30,
  },
  brandMine: {
    fontFamily: BRAND_FONT_BOLD,
    color: 'rgba(255, 255, 255, 0.82)',
  },
  brandMarket: {
    fontFamily: BRAND_FONT_BOLD,
    color: colors.gold,
  },

  headline: {
    marginBottom: 44,
    gap: spacing.sm,
  },
  headlineText: {
    fontSize: 30,
    lineHeight: 36,
    color: 'rgba(255, 255, 255, 0.82)',
  },
  headlineAccent: {
    color: colors.gold,
  },
  subtext: {
    fontSize: 13,
    lineHeight: 19,
    color: 'rgba(255, 255, 255, 0.82)',
    maxWidth: '92%',
  },
  actions: {
    position: 'absolute',
    left: 0,
    right: 0,
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  signUpButtonWrap: {
    backgroundColor: colors.gold,
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
    color: '#FFFFFF',
  },
  loginButton: {
    marginTop: spacing.sm,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.gold,
  },
  loginLabel: {
    fontSize: 16,
    color: colors.gold,
  },
  legalRow: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  legalLink: {
    fontSize: 12,
    color: colors.gold,
  },
  legalDivider: {
    fontSize: 12,
    color: colors.muted,
  },
});
