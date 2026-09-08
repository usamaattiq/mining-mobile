import React from 'react';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/shared/components/AppText';
import { palette, radius, spacing } from '@/shared/theme/tokens';
import { useMediaUpload } from '@/shared/hooks/useMediaUpload';
import { resolveMediaUrl, type UploadableContentType } from '@/shared/services/media';

type AvatarPickerProps = {
  label?: string;
  uri: string | null;
  onChangeKey: (key: string | null) => void;
} & (
  | { deferUpload?: false; onPickLocal?: never }
  | {
      /** Skip the immediate upload (no auth token yet, e.g. during sign-up) and just preview
       * the picked image locally; the caller uploads it later via onPickLocal's asset. */
      deferUpload: true;
      onPickLocal: (asset: { uri: string; contentType: UploadableContentType } | null) => void;
    }
);

export function AvatarPicker({
  label,
  uri,
  onChangeKey,
  deferUpload,
  onPickLocal,
}: AvatarPickerProps): React.ReactElement {
  const { uploading, error, pickImage, pickAndUpload } = useMediaUpload();
  const [localUri, setLocalUri] = React.useState<string | null>(null);

  const handlePress = async () => {
    if (deferUpload) {
      const picked = await pickImage();
      setLocalUri(picked?.uri ?? null);
      onPickLocal(picked);
      return;
    }

    const result = await pickAndUpload();
    if (result) {
      onChangeKey(result.key);
    }
  };

  const displayUri = deferUpload ? localUri : uri ? resolveMediaUrl(uri) : null;

  return (
    <View style={styles.container}>
      {label ? (
        <AppText weight="semibold" style={styles.label}>
          {label}
        </AppText>
      ) : null}
      <TouchableOpacity
        style={styles.circle}
        onPress={() => void handlePress()}
        disabled={uploading}
        activeOpacity={0.8}
      >
        {displayUri ? (
          <Image source={{ uri: displayUri }} style={styles.image} />
        ) : (
          <Ionicons name="camera-outline" size={28} color={palette.muted} />
        )}
      </TouchableOpacity>
      {error ? (
        <AppText style={styles.error}>{error}</AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'flex-start',
    gap: spacing.xs,
  },
  label: {
    fontSize: 13,
    color: palette.charcoal,
  },
  circle: {
    width: 88,
    height: 88,
    borderRadius: radius.pill,
    backgroundColor: palette.softGold,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  error: {
    fontSize: 12,
    color: palette.danger,
  },
});
