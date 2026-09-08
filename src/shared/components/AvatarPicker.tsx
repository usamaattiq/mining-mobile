import React from 'react';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/shared/components/AppText';
import { palette, radius, spacing } from '@/shared/theme/tokens';
import { useMediaUpload } from '@/shared/hooks/useMediaUpload';
import { resolveMediaUrl } from '@/shared/services/media';

type AvatarPickerProps = {
  label?: string;
  uri: string | null;
  onChangeKey: (key: string | null) => void;
};

export function AvatarPicker({ label, uri, onChangeKey }: AvatarPickerProps): React.ReactElement {
  const { uploading, pickAndUpload } = useMediaUpload();

  const handlePress = async () => {
    const result = await pickAndUpload();
    if (result) {
      onChangeKey(result.key);
    }
  };

  const displayUri = uri ? resolveMediaUrl(uri) : null;

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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
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
});
