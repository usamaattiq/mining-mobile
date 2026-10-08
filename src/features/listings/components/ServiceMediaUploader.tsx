import React from 'react';
import { ActivityIndicator, Image, Pressable, StyleSheet, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { i18n as appI18n } from '@/i18n';
import { AppBottomSheet } from '@/shared/components/AppBottomSheet';
import { AppText } from '@/shared/components/AppText';
import { EquipmentImageViewerModal } from '@/features/listings/components/EquipmentImageViewerModal';
import { palette, radius, spacing } from '@/theme';
import { uploadDocument } from '@/shared/services/media';
import type {
  ServiceMediaAsset,
  ServiceMediaUploaderProps,
} from '@/features/listings/types/serviceMedia.types';

const MAX_PHOTOS = 3;
const SHEET_HEIGHT_RATIO = 0.28;

function newId(): string {
  return `media_${Math.random().toString(16).slice(2, 10)}`;
}

/** Service listing media picker — up to 3 photos plus PDF documents (brochures, certificates, etc). */
export function ServiceMediaUploader({
  media,
  onChange,
  required = true,
}: ServiceMediaUploaderProps): React.ReactElement {
  const { t } = useTranslation(undefined, { i18n: appI18n });
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [viewerIndex, setViewerIndex] = React.useState<number | null>(null);
  const [uploadingDocument, setUploadingDocument] = React.useState(false);
  const [uploadError, setUploadError] = React.useState<string | null>(null);

  const photos = media.filter((item) => item.kind === 'photo');
  const documents = media.filter((item) => item.kind === 'document');
  const remainingPhotoSlots = Math.max(MAX_PHOTOS - photos.length, 0);

  const addAssets = (assets: ServiceMediaAsset[]) => onChange([...media, ...assets]);
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

  const pickDocument = async () => {
    setSheetOpen(false);
    setUploadError(null);
    const result = await DocumentPicker.getDocumentAsync({
      type: 'application/pdf',
      multiple: false,
      copyToCacheDirectory: true,
    });
    if (result.canceled || !result.assets[0]) return;
    const asset = result.assets[0];

    setUploadingDocument(true);
    try {
      const { key, url } = await uploadDocument({ uri: asset.uri, contentType: 'application/pdf' });
      addAssets([{ id: newId(), uri: url, kind: 'document', name: asset.name, key }]);
    } catch (error) {
      console.error('[ServiceMediaUploader] document upload failed:', error);
      setUploadError(t('serviceListing.documentUploadError'));
    } finally {
      setUploadingDocument(false);
    }
  };

  const photoSlots = Array.from({ length: MAX_PHOTOS }, (_, index) => photos[index] ?? null);

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <AppText weight="bold" style={styles.title}>
          {t('serviceListing.mediaTitle')}
          {required ? <AppText style={styles.required}> *</AppText> : null}
        </AppText>
        <AppText style={styles.subtitle}>
          {t('serviceListing.mediaSubtitle', { photos: MAX_PHOTOS })}
        </AppText>
      </View>

      <View style={styles.grid}>
        {photoSlots.map((item, index) => (
          <View key={item?.id ?? `photo_slot_${index}`} style={styles.slot}>
            {item ? (
              <>
                <Pressable
                  style={styles.slotImage}
                  onPress={() => setViewerIndex(photos.findIndex((entry) => entry.id === item.id))}
                  accessibilityRole="imagebutton"
                  accessibilityLabel={t('serviceListing.addPhoto')}
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
                accessibilityLabel={t('serviceListing.addPhoto')}
              >
                <Ionicons name="camera-outline" size={22} color={palette.muted} />
              </Pressable>
            )}
          </View>
        ))}
      </View>

      <View style={styles.documentSection}>
        {documents.map((item) => (
          <View key={item.id} style={styles.documentRow}>
            <Ionicons name="document-text-outline" size={20} color={palette.gold} />
            <AppText style={styles.documentName} numberOfLines={1}>
              {item.name ?? t('serviceListing.document')}
            </AppText>
            <Pressable onPress={() => remove(item.id)} hitSlop={8}>
              <Ionicons name="close-circle" size={18} color={palette.muted} />
            </Pressable>
          </View>
        ))}

        <Pressable
          onPress={() => void pickDocument()}
          disabled={uploadingDocument}
          style={({ pressed }) => [
            styles.addDocument,
            pressed && styles.pressed,
            uploadingDocument && styles.addDocumentDisabled,
          ]}
          accessibilityRole="button"
          accessibilityLabel={t('serviceListing.addDocument')}
        >
          {uploadingDocument ? (
            <ActivityIndicator size="small" color={palette.gold} />
          ) : (
            <Ionicons name="add-circle-outline" size={18} color={palette.gold} />
          )}
          <AppText weight="semibold" style={styles.addDocumentLabel}>
            {uploadingDocument
              ? t('serviceListing.uploadingDocument')
              : t('serviceListing.addDocument')}
          </AppText>
        </Pressable>

        {uploadError ? <AppText style={styles.uploadError}>{uploadError}</AppText> : null}
      </View>

      <AppBottomSheet
        visible={sheetOpen}
        onClose={() => setSheetOpen(false)}
        heightRatio={SHEET_HEIGHT_RATIO}
        fitContent
      >
        <AppText weight="bold" style={styles.sheetTitle}>
          {t('serviceListing.addPhoto')}
        </AppText>

        <Pressable
          onPress={() => void capturePhoto()}
          style={({ pressed }) => [styles.sheetOption, pressed && styles.pressed]}
        >
          <Ionicons name="camera-outline" size={20} color={palette.gold} />
          <AppText weight="medium" style={styles.sheetOptionLabel}>
            {t('serviceListing.takePhoto')}
          </AppText>
        </Pressable>
        <Pressable
          onPress={() => void pickPhotosFromGallery()}
          style={({ pressed }) => [styles.sheetOption, pressed && styles.pressed]}
        >
          <Ionicons name="images-outline" size={20} color={palette.gold} />
          <AppText weight="medium" style={styles.sheetOptionLabel}>
            {t('serviceListing.chooseFromGallery')}
          </AppText>
        </Pressable>
      </AppBottomSheet>

      <EquipmentImageViewerModal
        visible={viewerIndex !== null}
        media={photos.map((item) => ({ id: item.id, uri: item.uri, kind: 'photo' as const }))}
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
  documentSection: {
    gap: spacing.xs,
  },
  documentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: palette.softGold,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  documentName: {
    flex: 1,
    fontSize: 13,
    color: palette.charcoal,
  },
  addDocument: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: palette.softGold,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    alignSelf: 'flex-start',
  },
  addDocumentDisabled: {
    opacity: 0.6,
  },
  addDocumentLabel: {
    fontSize: 13,
    color: palette.gold,
  },
  uploadError: {
    fontSize: 12,
    color: palette.danger,
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
