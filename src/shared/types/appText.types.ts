import type { TextProps } from 'react-native';
import type { FontWeightToken } from '@/theme';

export type AppTextProps = TextProps & {
  weight?: FontWeightToken;
};
