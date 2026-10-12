import type { ImageSourcePropType } from 'react-native';
import type { Ionicons } from '@expo/vector-icons';

export type HomeActionCardProps = {
  icon: keyof typeof Ionicons.glyphMap;
  iconImage?: ImageSourcePropType;
  title: string;
  subtitle: string;
  onPress: () => void;
  image?: ImageSourcePropType;
};
