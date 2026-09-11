import React from 'react';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/shared/components/AppText';
import { palette, radius, spacing } from '@/theme';
import { useMediaUpload } from '@/shared/hooks/useMediaUpload';
import type { AvatarPickerProps } from '@/shared/types/avatarPicker.types';

export function AvatarPicker({
  label,
  uri,
  onChangeUrl,
  deferUpload,
  onPickLocal,
}: AvatarPickerProps): React.ReactElement {
  const { uploading, error, pickImage, pickAndUpload } = useMediaUpload();
  const [localUri, setLocalUri] = React.useState<string | null>(null);
  const [loadError, setLoadError] = React.useState<string | null>(null);

  const handlePress = async () => {
    if (deferUpload) {
      const picked = await pickImage();
      setLocalUri(picked?.uri ?? null);
      onPickLocal(picked);
      return;
    }

    setLoadError(null);
    const result = await pickAndUpload();
    if (result) {
      onChangeUrl(result.url);
    }
  };

  const displayUri = deferUpload ? localUri : uri;

  const handleRemove = () => {
    if (deferUpload) {
      setLocalUri(null);
      onPickLocal(null);
      return;
    }
    onChangeUrl(null);
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
          {displayUri && !loadError ? (
            <Image
              source={{ uri: displayUri }}
              style={styles.image}
              onError={(e) => {
                setLoadError(e.nativeEvent.error);
                console.warn(
                  '[AvatarPicker] failed to load image',
                  displayUri,
                  e.nativeEvent.error,
                );
              }}
            />
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
      {error || loadError ? <AppText style={styles.error}>{error ?? loadError}</AppText> : null}
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
