import type { Ionicons } from '@expo/vector-icons';

export type ListingModeCardProps = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  onPress: () => void;
};
