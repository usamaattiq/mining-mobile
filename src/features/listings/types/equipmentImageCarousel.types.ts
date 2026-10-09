import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import type { Ionicons } from '@expo/vector-icons';
import type { EquipmentMediaAsset } from '@/features/listings/types/equipmentMedia.types';

export type EquipmentImageCarouselProps = {
  media: EquipmentMediaAsset[];
  onPressImage: (index: number) => void;
  placeholderIcon?: keyof typeof Ionicons.glyphMap;
  statusBadge?: ReactNode;
  style?: StyleProp<ViewStyle>;
};
