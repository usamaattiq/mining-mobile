import React from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { i18n as appI18n } from '@/i18n';
import { AppBottomSheet } from '@/shared/components/AppBottomSheet';
import { AppText } from '@/shared/components/AppText';
import { palette, radius, spacing } from '@/theme';
import type {
  EquipmentMediaAsset,
  EquipmentMediaUploaderProps,
} from '@/features/listings/types/equipmentMedia.types';

const MAX_PHOTOS = 3;
const PHOTO_SHEET_HEIGHT_RATIO = 0.32;

function newId(): string {
  return `media_${Math.random().toString(16).slice(2, 10)}`;
}

/** Equipment listing photo picker — up to 3 photos. (Video is hidden for now.) */
export function EquipmentMediaUploader({
  media,
  onChange,
}: EquipmentMediaUploaderProps): React.ReactElement {
  const { t } = useTranslation(undefined, { i18n: appI18n });
  const [sheetOpen, setSheetOpen] = React.useState(false);

  const photos = media.filter((item) => item.kind === 'photo');
  const remainingPhotoSlots = Math.max(MAX_PHOTOS - photos.length, 0);

  const addAssets = (assets: EquipmentMediaAsset[]) => onChange([...media, ...assets]);
  const remove = (id: string) => onChange(media.filter((item) => item.id !== id));

  const openPhotoSheet = () => {
    if (remainingPhotoSlots <= 0) return;
    setSheetOpen(true);
  };

  const pickPhotosFromGallery = async () => {
    setSheetOpen(false);
    if (remainingPhotoSlots <= 0) return;
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: remainingPhotoSlots,
      quality: 0.7,
    });
    if (result.canceled || !result.assets.length) return;

    addAssets(
      result.assets
        .slice(0, remainingPhotoSlots)
        .map((asset) => ({ id: newId(), uri: asset.uri, kind: 'photo' as const })),
    );
  };

  const capturePhoto = async () => {
    setSheetOpen(false);
    if (remainingPhotoSlots <= 0) return;
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) return;

    const result = await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.7 });
    if (result.canceled || !result.assets[0]) return;
    addAssets([{ id: newId(), uri: result.assets[0].uri, kind: 'photo' }]);
  };

  const photoSlots = Array.from({ length: MAX_PHOTOS }, (_, index) => photos[index] ?? null);

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <AppText weight="bold" style={styles.title}>
          {t('equipmentListing.mediaTitle')}
          <AppText style={styles.required}> *</AppText>
        </AppText>
        <AppText style={styles.subtitle}>
          {t('equipmentListing.mediaSubtitlePhotosOnly', { photos: MAX_PHOTOS })}
        </AppText>
      </View>

      <View style={styles.grid}>
        {photoSlots.map((item, index) => (
          <View key={item?.id ?? `photo_slot_${index}`} style={styles.slot}>
            {item ? (
              <>
                <Image source={{ uri: item.uri }} style={styles.slotImage} />
                <Pressable
                  style={styles.remove}
                  onPress={() => remove(item.id)}
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityLabel={t('common.cancel')}
                >
                  <Ionicons name="close" size={12} color={palette.pureWhite} />
                </Pressable>
              </>
            ) : (
              <Pressable
                onPress={openPhotoSheet}
                style={({ pressed }) => [styles.slotEmpty, pressed && styles.pressed]}
                accessibilityRole="button"
                accessibilityLabel={t('equipmentListing.addPhoto')}
              >
                <Ionicons name="camera-outline" size={22} color={palette.muted} />
              </Pressable>
            )}
          </View>
        ))}
      </View>

      <AppBottomSheet
        visible={sheetOpen}
        onClose={() => setSheetOpen(false)}
        heightRatio={PHOTO_SHEET_HEIGHT_RATIO}
      >
        <AppText weight="bold" style={styles.sheetTitle}>
          {t('equipmentListing.addPhoto')}
        </AppText>

        <Pressable
          onPress={() => void capturePhoto()}
          style={({ pressed }) => [styles.sheetOption, pressed && styles.pressed]}
        >
          <Ionicons name="camera-outline" size={20} color={palette.gold} />
          <AppText weight="medium" style={styles.sheetOptionLabel}>
            {t('equipmentListing.takePhoto')}
          </AppText>
        </Pressable>
        <Pressable
          onPress={() => void pickPhotosFromGallery()}
          style={({ pressed }) => [styles.sheetOption, pressed && styles.pressed]}
        >
          <Ionicons name="images-outline" size={20} color={palette.gold} />
          <AppText weight="medium" style={styles.sheetOptionLabel}>
            {t('equipmentListing.chooseFromGallery')}
          </AppText>
        </Pressable>
      </AppBottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: spacing.sm,
  },
  header: {
    gap: spacing.xs,
  },
  title: {
    fontSize: 16,
    color: palette.charcoal,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 18,
    color: palette.muted,
  },
  required: {
    fontSize: 16,
    color: palette.danger,
  },
  grid: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  slot: {
    flex: 1,
    aspectRatio: 0.9,
    position: 'relative',
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  slotEmpty: {
    flex: 1,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: palette.softGold,
    backgroundColor: palette.warmWhite,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotImage: {
    ...StyleSheet.absoluteFill,
    backgroundColor: palette.softGold,
  },
  remove: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(0,0,0,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.88,
  },
  sheetTitle: {
    fontSize: 16,
    color: palette.charcoal,
    textAlign: 'center',
    marginBottom: spacing.sm,
    paddingVertical: spacing.sm,
  },
  sheetOption: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
  },
  sheetOptionLabel: {
    fontSize: 15,
    color: palette.charcoal,
  },
});
