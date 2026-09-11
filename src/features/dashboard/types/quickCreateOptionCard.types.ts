import type { Ionicons } from '@expo/vector-icons';

export type QuickCreateOptionCardProps = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  onPress: () => void;
};
