import React from 'react';
import { Text } from 'react-native';
import { useLanguage } from '@/i18n/hooks/useLanguage';
import { getFontFamily } from '@/theme';
import type { AppTextProps } from '@/shared/types/appText.types';

export function AppText({ weight = 'regular', style, ...rest }: AppTextProps): React.ReactElement {
  const { currentLanguage } = useLanguage();

  return <Text {...rest} style={[{ fontFamily: getFontFamily(currentLanguage, weight) }, style]} />;
}
