import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { i18n as appI18n } from '@/i18n';
import { AppText } from '@/shared/components/AppText';
import { palette, radius, spacing } from '@/theme';
import type { AttachmentsSectionProps } from '@/features/listings/types/attachmentsSection.types';

/** "Attachments" section on a listing detail screen — tap a document to download/save it. */
export function AttachmentsSection({
  documents,
  downloadable = true,
}: AttachmentsSectionProps): React.ReactElement | null {
  const { t } = useTranslation(undefined, { i18n: appI18n });
  const [downloadingId, setDownloadingId] = React.useState<string | null>(null);

  if (documents.length === 0) return null;

  const handleDownload = async (item: (typeof documents)[number]) => {
    const canShare = await Sharing.isAvailableAsync();
    if (!canShare) return;

    setDownloadingId(item.id);
    try {
      const isRemote = /^https?:\/\//i.test(item.uri);
      const localUri = isRemote
        ? (
            await FileSystem.downloadAsync(
              item.uri,
              `${FileSystem.cacheDirectory}${item.name ?? `${item.id}.pdf`}`,
            )
          ).uri
        : item.uri;
      await Sharing.shareAsync(localUri);
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <View style={styles.root}>
      <AppText weight="bold" style={styles.title}>
        {t('listingDetail.attachments')}
      </AppText>

      <View style={styles.list}>
        {documents.map((item) =>
          downloadable ? (
            <Pressable
              key={item.id}
              onPress={() => void handleDownload(item)}
              disabled={downloadingId === item.id}
              style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
              accessibilityRole="button"
              accessibilityLabel={item.name ?? t('serviceListing.document')}
            >
              <Ionicons name="document-text-outline" size={20} color={palette.gold} />
              <AppText style={styles.name} numberOfLines={1}>
                {item.name ?? t('serviceListing.document')}
              </AppText>
              {downloadingId === item.id ? (
                <ActivityIndicator size="small" color={palette.muted} />
              ) : (
                <Ionicons name="download-outline" size={18} color={palette.muted} />
              )}
            </Pressable>
          ) : (
            <View key={item.id} style={styles.row}>
              <Ionicons name="document-text-outline" size={20} color={palette.gold} />
              <AppText style={styles.name} numberOfLines={1}>
                {item.name ?? t('serviceListing.document')}
              </AppText>
            </View>
          ),
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: spacing.sm,
  },
  title: {
    fontSize: 15,
    color: palette.charcoal,
  },
  list: {
    gap: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: palette.softGold,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  rowPressed: {
    backgroundColor: palette.warmWhite,
  },
  name: {
    flex: 1,
    fontSize: 13,
    color: palette.charcoal,
  },
});
