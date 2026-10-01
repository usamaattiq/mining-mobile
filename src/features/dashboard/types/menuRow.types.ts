import type { Ionicons } from '@expo/vector-icons';

export type MenuRowVariant = 'default' | 'gold';

export type MenuRowProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  subtitle?: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: MenuRowVariant;
  /** Bottom divider — used by MenuListCard between rows. Ignored for the 'gold' variant. */
  showBorder?: boolean;
  accessibilityLabel?: string;
};
