import React from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { RemoteImage } from '@/shared/components/RemoteImage';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { palette, spacing } from '@/theme';
import { ListingVideoPlayer } from '@/features/listings/components/ListingVideoPlayer';
import type { EquipmentImageViewerModalProps } from '@/features/listings/types/equipmentImageViewerModal.types';

/** Full-screen swipeable viewer opened by tapping a photo in the carousel. */
export function EquipmentImageViewerModal({
  visible,
  media,
  initialIndex,
  onClose,
}: EquipmentImageViewerModalProps): React.ReactElement {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [scrolledIndex, setScrolledIndex] = React.useState<number | null>(null);
  const activeIndex = scrolledIndex ?? initialIndex;

  React.useEffect(() => {
    if (!visible) setScrolledIndex(null);
  }, [visible]);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (width <= 0) return;
    setScrolledIndex(Math.round(event.nativeEvent.contentOffset.x / width));
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={onClose}
    >
      {visible ? <StatusBar style="light" /> : null}
      <View style={styles.root}>
        {visible ? (
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            contentOffset={{ x: initialIndex * width, y: 0 }}
            onScroll={handleScroll}
            scrollEventThrottle={16}
          >
            {media.map((item, index) =>
              item.kind === 'video' ? (
                <View key={item.id} style={{ width, height }}>
                  <ListingVideoPlayer
                    uri={item.uri}
                    style={styles.image}
                    active={visible && index === activeIndex}
                  />
                </View>
              ) : (
                <Pressable key={item.id} onPress={onClose} style={{ width, height }}>
                  <RemoteImage
                    source={item.uri}
                    style={styles.image}
                    contentFit="contain"
                    recyclingKey={item.id}
                  />
                </Pressable>
              ),
            )}
          </ScrollView>
        ) : null}

        <Pressable
          onPress={onClose}
          hitSlop={12}
          style={[styles.closeButton, { top: insets.top + spacing.sm }]}
          accessibilityRole="button"
          accessibilityLabel="Close"
        >
          <Ionicons name="close" size={22} color={palette.pureWhite} />
        </Pressable>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000000',
  },
  image: {
    width: '100%',
    height: '100%',
    backgroundColor: '#000000',
  },
  closeButton: {
    position: 'absolute',
    right: spacing.md,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
