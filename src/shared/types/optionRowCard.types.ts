import type { ImageSourcePropType } from 'react-native';
import type { Ionicons } from '@expo/vector-icons';

export type OptionRowCardProps = {
  icon: keyof typeof Ionicons.glyphMap;
  /** Custom artwork shown in the left tile instead of the vector icon. */
  iconImage?: ImageSourcePropType;
  title: string;
  subtitle: string;
  onPress: () => void;
  selected?: boolean;
  compact?: boolean;
  image?: ImageSourcePropType;
};
