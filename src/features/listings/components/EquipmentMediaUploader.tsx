import React from 'react';
import { ActivityIndicator, Image, Pressable, StyleSheet, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { i18n as appI18n } from '@/i18n';
import { AppBottomSheet } from '@/shared/components/AppBottomSheet';
import { AppText } from '@/shared/components/AppText';
import { showAppAlert } from '@/shared/services/appAlert';
import { persistListingMedia } from '@/features/listings/utils/persistListingMedia';
import { EquipmentImageViewerModal } from '@/features/listings/components/EquipmentImageViewerModal';
import { ListingVideoThumb } from '@/features/listings/components/ListingVideoThumb';
import { palette, radius, spacing } from '@/theme';
import type {
  EquipmentMediaAsset,
  EquipmentMediaUploaderProps,
} from '@/features/listings/types/equipmentMedia.types';

const MAX_PHOTOS = 3;
const MAX_VIDEOS = 1;
const MAX_VIDEO_MB = 20;
const MAX_VIDEO_BYTES = MAX_VIDEO_MB * 1024 * 1024;
const SHEET_HEIGHT_RATIO = 0.28;

function newId(): string {
  return `media_${Math.random().toString(16).slice(2, 10)}`;
}

async function videoByteSize(asset: ImagePicker.ImagePickerAsset): Promise<number | null> {
  if (typeof asset.fileSize === 'number' && asset.fileSize > 0) return asset.fileSize;
  const info = await FileSystem.getInfoAsync(asset.uri);
  if (info.exists && 'size' in info && typeof info.size === 'number') return info.size;
  return null;
}

/** Equipment listing media picker — up to 3 photos and 1 video. */
export function EquipmentMediaUploader({
  media,
  onChange,
  onBusyChange,
  required = true,
  isRequest = false,
}: EquipmentMediaUploaderProps): React.ReactElement {
  const { t } = useTranslation(undefined, { i18n: appI18n });
  const [sheetKind, setSheetKind] = React.useState<'photo' | 'video' | null>(null);
  const [viewerIndex, setViewerIndex] = React.useState<number | null>(null);
  const [uploadingVideo, setUploadingVideo] = React.useState(false);
  const mediaRef = React.useRef(media);
  mediaRef.current = media;

  const photos = media.filter((item) => item.kind === 'photo');
  const video = media.find((item) => item.kind === 'video') ?? null;
  const previewMedia = [...photos, ...(video ? [video] : [])];
  const remainingPhotoSlots = Math.max(MAX_PHOTOS - photos.length, 0);
  const remainingVideoSlots = Math.max(MAX_VIDEOS - (video ? 1 : 0), 0);

  const addAssets = (assets: EquipmentMediaAsset[]) => onChange([...media, ...assets]);
  const remove = (id: string) => onChange(media.filter((item) => item.id !== id));

  const openPhotoSheet = () => {
    if (remainingPhotoSlots <= 0) return;
    setSheetKind('photo');
  };

  const openVideoSheet = () => {
    if (remainingVideoSlots <= 0) return;
    setSheetKind('video');
  };

  const pickPhotosFromGallery = async () => {
    setSheetKind(null);
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
    setSheetKind(null);
    if (remainingPhotoSlots <= 0) return;
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) return;

    const result = await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.7 });
    if (result.canceled || !result.assets[0]) return;
    addAssets([{ id: newId(), uri: result.assets[0].uri, kind: 'photo' }]);
  };

  const pickVideoFromGallery = async () => {
    setSheetKind(null);
    if (remainingVideoSlots <= 0) return;
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['videos'],
      allowsMultipleSelection: false,
      videoMaxDuration: 60,
      quality: 0.7,
    });
    if (result.canceled || !result.assets[0]) return;
    await addVideoIfAllowed(result.assets[0]);
  };

  const recordVideo = async () => {
    setSheetKind(null);
    if (remainingVideoSlots <= 0) return;
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) return;

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['videos'],
      videoMaxDuration: 60,
      quality: 0.7,
    });
    if (result.canceled || !result.assets[0]) return;
    await addVideoIfAllowed(result.assets[0]);
  };

  const addVideoIfAllowed = async (asset: ImagePicker.ImagePickerAsset) => {
    const size = await videoByteSize(asset);
    if (size !== null && size > MAX_VIDEO_BYTES) {
      showAppAlert(t('common.error'), t('equipmentListing.videoTooLarge', { mb: MAX_VIDEO_MB }));
      return;
    }

    setUploadingVideo(true);
    onBusyChange?.(true);
    const pending: EquipmentMediaAsset = { id: newId(), uri: asset.uri, kind: 'video' };
    addAssets([pending]);
    try {
      const uploaded = (await persistListingMedia([pending]))[0];
      if (!uploaded) throw new Error('Video upload failed');
      onChange(mediaRef.current.map((item) => (item.id === pending.id ? uploaded : item)));
    } catch (error) {
      console.error('[EquipmentMediaUploader] video upload failed:', error);
      onChange(mediaRef.current.filter((item) => item.id !== pending.id));
      showAppAlert(t('common.error'), t('equipmentListing.videoUploadError'));
    } finally {
      setUploadingVideo(false);
      onBusyChange?.(false);
    }
  };

  const photoSlots = Array.from({ length: MAX_PHOTOS }, (_, index) => photos[index] ?? null);

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <AppText weight="semibold" style={styles.title}>
          {t(isRequest ? 'equipmentListing.mediaTitleRequest' : 'equipmentListing.mediaTitle')}
          {required ? <AppText style={styles.required}> *</AppText> : null}
        </AppText>
        <AppText style={styles.subtitle}>
          {t(isRequest ? 'equipmentListing.mediaSubtitleRequest' : 'equipmentListing.mediaSubtitle', {
            photos: MAX_PHOTOS,
            videos: MAX_VIDEOS,
            mb: MAX_VIDEO_MB,
          })}
        </AppText>
      </View>

      <View style={styles.grid}>
        {photoSlots.map((item, index) => (
          <View key={item?.id ?? `photo_slot_${index}`} style={styles.slot}>
            {item ? (
              <>
                <Pressable
                  style={styles.slotImage}
                  onPress={() => setViewerIndex(previewMedia.findIndex((entry) => entry.id === item.id))}
                  accessibilityRole="imagebutton"
                  accessibilityLabel={t('equipmentListing.addPhoto')}
                >
                  <Image source={{ uri: item.uri }} style={styles.slotImage} />
                </Pressable>
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

        <View key={video?.id ?? 'video_slot'} style={styles.slot}>
          {video ? (
            <>
              <Pressable
                style={styles.slotImage}
                onPress={() =>
                  setViewerIndex(previewMedia.findIndex((entry) => entry.id === video.id))
                }
                disabled={uploadingVideo}
                accessibilityRole="imagebutton"
                accessibilityLabel={t('equipmentListing.addVideo')}
              >
                <ListingVideoThumb uri={video.uri} style={styles.slotImage} />
              </Pressable>
              {uploadingVideo ? (
                <View style={styles.loaderOverlay}>
                  <ActivityIndicator color={palette.pureWhite} />
                </View>
              ) : (
                <Pressable
                  style={styles.remove}
                  onPress={() => remove(video.id)}
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityLabel={t('common.cancel')}
                >
                  <Ionicons name="close" size={12} color={palette.pureWhite} />
                </Pressable>
              )}
            </>
          ) : (
            <Pressable
              onPress={openVideoSheet}
              disabled={uploadingVideo}
              style={({ pressed }) => [styles.slotEmpty, pressed && styles.pressed]}
              accessibilityRole="button"
              accessibilityLabel={t('equipmentListing.addVideo')}
            >
              {uploadingVideo ? (
                <ActivityIndicator color={palette.gold} />
              ) : (
                <Ionicons name="videocam-outline" size={22} color={palette.muted} />
              )}
            </Pressable>
          )}
        </View>
      </View>

      <AppBottomSheet
        visible={sheetKind !== null}
        onClose={() => setSheetKind(null)}
        heightRatio={SHEET_HEIGHT_RATIO}
        fitContent
      >
        <AppText weight="bold" style={styles.sheetTitle}>
          {sheetKind === 'video' ? t('equipmentListing.addVideo') : t('equipmentListing.addPhoto')}
        </AppText>

        {sheetKind === 'video' ? (
          <>
            <Pressable
              onPress={() => void recordVideo()}
              style={({ pressed }) => [styles.sheetOption, pressed && styles.pressed]}
            >
              <Ionicons name="videocam-outline" size={20} color={palette.gold} />
              <AppText weight="medium" style={styles.sheetOptionLabel}>
                {t('equipmentListing.recordVideo')}
              </AppText>
            </Pressable>
            <Pressable
              onPress={() => void pickVideoFromGallery()}
              style={({ pressed }) => [styles.sheetOption, pressed && styles.pressed]}
            >
              <Ionicons name="images-outline" size={20} color={palette.gold} />
              <AppText weight="medium" style={styles.sheetOptionLabel}>
                {t('equipmentListing.chooseFromGallery')}
              </AppText>
            </Pressable>
          </>
        ) : (
          <>
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
          </>
        )}
      </AppBottomSheet>

      <EquipmentImageViewerModal
        visible={viewerIndex !== null}
        media={previewMedia}
        initialIndex={viewerIndex ?? 0}
        onClose={() => setViewerIndex(null)}
      />
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
    fontSize: 13,
    color: palette.charcoal,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 18,
    color: palette.muted,
  },
  required: {
    fontSize: 13,
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
  loaderOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
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
