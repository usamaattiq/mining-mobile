import React from 'react';
import { Text, type TextProps } from 'react-native';
import { useLanguage } from '@/i18n/hooks/useLanguage';
import { getFontFamily, type FontWeightToken } from '@/shared/theme/typography';

type AppTextProps = TextProps & {
  weight?: FontWeightToken;
};

export function AppText({ weight = 'regular', style, ...rest }: AppTextProps): React.ReactElement {
  const { currentLanguage } = useLanguage();

  return <Text {...rest} style={[{ fontFamily: getFontFamily(currentLanguage, weight) }, style]} />;
}
