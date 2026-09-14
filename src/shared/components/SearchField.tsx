import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { FormInput } from '@/shared/components/FormInput';
import { palette } from '@/theme';
import type { SearchFieldProps } from '@/shared/types/searchField.types';

export function SearchField({
  value,
  onChangeText,
  placeholder,
}: SearchFieldProps): React.ReactElement {
  return (
    <FormInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      leftAdornment={<Ionicons name="search" size={18} color={palette.muted} />}
      autoCorrect={false}
      autoCapitalize="none"
    />
  );
}
