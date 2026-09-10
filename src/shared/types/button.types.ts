import type { Ionicons } from '@expo/vector-icons';
import type { TouchableOpacityProps } from 'react-native';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'link';

export type ButtonProps = TouchableOpacityProps & {
  label: string;
  variant?: ButtonVariant;
  loading?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
};
