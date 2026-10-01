import type { Ionicons } from '@expo/vector-icons';

export type HomeActionCardProps = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  onPress: () => void;
};
