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

  const handleRemove = () => {
    if (deferUpload) {
      setLocalUri(null);
      onPickLocal(null);
      return;
    }
    onChangeKey(null);
  };

  return (
    <View style={styles.container}>
      {label ? (
        <AppText weight="semibold" style={styles.label}>
          {label}
        </AppText>
      ) : null}
      <View style={styles.avatarWrap}>
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
        {displayUri ? (
          <TouchableOpacity
            style={styles.removeButton}
            onPress={handleRemove}
            hitSlop={8}
            activeOpacity={0.8}
          >
            <Ionicons name="close" size={14} color={palette.warmWhite} />
          </TouchableOpacity>
        ) : null}
      </View>
      {error ? <AppText style={styles.error}>{error}</AppText> : null}
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
  avatarWrap: {
    width: 88,
    height: 88,
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
  removeButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 22,
    height: 22,
    borderRadius: radius.pill,
    backgroundColor: palette.charcoal,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: palette.warmWhite,
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
