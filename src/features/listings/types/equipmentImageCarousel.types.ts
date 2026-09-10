import type { StyleProp, ViewStyle } from 'react-native';
import type { EquipmentMediaAsset } from '@/features/listings/types/equipmentMedia.types';

export type EquipmentImageCarouselProps = {
  media: EquipmentMediaAsset[];
  onPressImage: (index: number) => void;
  style?: StyleProp<ViewStyle>;
};
