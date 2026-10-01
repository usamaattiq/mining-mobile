import type { ReactNode } from 'react';
import type { Ionicons } from '@expo/vector-icons';
import type { TouchableOpacityProps } from 'react-native';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'link' | 'whatsapp';
export type ButtonSize = 'md' | 'lg';

export type ButtonProps = TouchableOpacityProps & {
  label: string;
  variant?: ButtonVariant;
  /** 'lg' is a 56px pill button (used for full-width primary CTAs like onboarding "Continue"). */
  size?: ButtonSize;
  loading?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  /** Where the icon sits relative to the label. Default 'left'. */
  iconPosition?: 'left' | 'right';
  /** Absolutely-positioned layer rendered behind the label (e.g. an animated progress fill). */
  overlay?: ReactNode;
};
