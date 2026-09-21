import type { Ionicons } from '@expo/vector-icons';

export type OptionRowCardProps = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  onPress: () => void;
  selected?: boolean;
  compact?: boolean;
};
