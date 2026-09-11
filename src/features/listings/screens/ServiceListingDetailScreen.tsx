import React from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { i18n as appI18n } from '@/i18n';
import { useLanguage } from '@/i18n/hooks/useLanguage';
import type { RootStackParamList } from '@/navigation/types';
import { AppText } from '@/shared/components/AppText';
import { EquipmentImageCarousel } from '@/features/listings/components/EquipmentImageCarousel';
import { EquipmentImageViewerModal } from '@/features/listings/components/EquipmentImageViewerModal';
import { EquipmentDescriptionCard } from '@/features/listings/components/EquipmentDescriptionCard';
import { AttachmentsSection } from '@/features/listings/components/AttachmentsSection';
import { useServiceListingsStore } from '@/store/serviceListingsStore';
import { useCurrency } from '@/shared/hooks/useCurrency';
import { formatAmountWithCommas } from '@/shared/utils/formatAmount';
import { palette, radius, spacing } from '@/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'ServiceListingDetail'>;

export function ServiceListingDetailScreen({ navigation, route }: Props): React.ReactElement {
  const { t } = useTranslation(undefined, { i18n: appI18n });
  const { currentLanguage } = useLanguage();
  const insets = useSafeAreaInsets();
  const currency = useCurrency();
  const listing = useServiceListingsStore((state) =>
    state.listings.find((item) => item.id === route.params.id),
  );
  const [viewerIndex, setViewerIndex] = React.useState<number | null>(null);

  const backButton = (
    <Pressable
      onPress={navigation.goBack}
      hitSlop={12}
      style={[styles.backButton, { top: insets.top + spacing.sm }]}
      accessibilityRole="button"
      accessibilityLabel={t('common.back')}
    >
      <Ionicons name="chevron-back" size={20} color={palette.pureWhite} />
    </Pressable>
  );

  if (!listing) {
    return (
      <View style={styles.root}>
        <StatusBar style="dark" />
        {backButton}
        <View style={styles.notFoundWrap}>
          <AppText style={styles.notFound}>{t('requests.notFound')}</AppText>
        </View>
      </View>
    );
  }

  const photoMedia = listing.media
    .filter((item) => item.kind === 'photo')
    .map((item) => ({ id: item.id, uri: item.uri, kind: 'photo' as const }));
  const documents = listing.media.filter((item) => item.kind === 'document');
  const descriptionText = (listing.description ?? '').trim();
  const locationLabel = listing.location ?? '';

  const handleOpenLocation = () => {
    if (!locationLabel.trim()) return;
    const query = encodeURIComponent(locationLabel);
    void Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${query}`);
  };

  return (
    <View style={styles.root}>
      <StatusBar style="light" />

      <ScrollView showsVerticalScrollIndicator={false}>
        <EquipmentImageCarousel
          media={photoMedia}
          onPressImage={setViewerIndex}
          style={styles.carousel}
        />

        <View style={styles.content}>
          <View style={styles.headerBlock}>
            {listing.price ? (
              <AppText weight="bold" style={styles.priceAmount}>
                {currency.code} {formatAmountWithCommas(listing.price)}
              </AppText>
            ) : null}

            <View style={styles.titleBlock}>
              <AppText weight="bold" style={styles.title}>
                {listing.title}
              </AppText>

              <View style={styles.modeBadge}>
                <Ionicons
                  name={listing.serviceType === 'onsite' ? 'location-outline' : 'globe-outline'}
                  size={13}
                  color={palette.pureWhite}
                />
                <AppText weight="semibold" style={styles.modeBadgeText}>
                  {t(
                    listing.serviceType === 'onsite'
                      ? 'serviceListing.onsite'
                      : 'serviceListing.online',
                  )}
                </AppText>
              </View>

              {locationLabel.trim() ? (
                <Pressable
                  onPress={handleOpenLocation}
                  style={({ pressed }) => [
                    styles.locationRow,
                    pressed && styles.locationRowPressed,
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel={locationLabel}
                >
                  <Ionicons name="location-outline" size={16} color={palette.gold} />
                  <AppText style={styles.locationText} numberOfLines={1}>
                    {locationLabel}
                  </AppText>
                  <Ionicons name="open-outline" size={14} color={palette.muted} />
                </Pressable>
              ) : null}

              {listing.serviceDate ? (
                <View style={styles.dateRow}>
                  <Ionicons name="calendar-outline" size={16} color={palette.gold} />
                  <AppText style={styles.dateText}>
                    {new Intl.DateTimeFormat(currentLanguage, {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    }).format(listing.serviceDate)}
                  </AppText>
                </View>
              ) : null}
            </View>
          </View>

          {listing.serviceCategoryLabel ? (
            <View style={styles.categoryBadge}>
              <AppText weight="semibold" style={styles.categoryBadgeText}>
                {listing.serviceCategoryLabel}
              </AppText>
            </View>
          ) : null}

          {descriptionText ? <EquipmentDescriptionCard description={descriptionText} /> : null}

          <AttachmentsSection documents={documents} />
        </View>
      </ScrollView>

      {backButton}

      <EquipmentImageViewerModal
        visible={viewerIndex !== null}
        media={photoMedia}
        initialIndex={viewerIndex ?? 0}
        onClose={() => setViewerIndex(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: palette.pureWhite,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  headerBlock: {
    gap: spacing.xs,
  },
  carousel: {
    borderRadius: 0,
  },
  backButton: {
    position: 'absolute',
    left: spacing.md,
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  priceAmount: {
    fontSize: 28,
    color: palette.charcoal,
  },
  titleBlock: {
    gap: spacing.xs,
  },
  title: {
    fontSize: 18,
    color: palette.charcoal,
  },
  modeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    backgroundColor: palette.gold,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  modeBadgeText: {
    fontSize: 11,
    color: palette.pureWhite,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    alignSelf: 'flex-start',
  },
  locationRowPressed: {
    opacity: 0.7,
  },
  locationText: {
    fontSize: 14,
    color: palette.gold,
    textDecorationLine: 'underline',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  dateText: {
    fontSize: 14,
    color: palette.charcoal,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: palette.softGold,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  categoryBadgeText: {
    fontSize: 12,
    color: palette.gold,
  },
  notFoundWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  notFound: {
    fontSize: 14,
    color: palette.muted,
    textAlign: 'center',
  },
});
