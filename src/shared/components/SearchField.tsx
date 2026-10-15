import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { FormInput } from '@/shared/components/FormInput';
import { StyleSheet } from 'react-native';
import { palette, radius } from '@/theme';
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
      rowStyle={styles.row}
      style={styles.input}
      leftAdornment={<Ionicons name="search" size={18} color={palette.muted} />}
      autoCorrect={false}
      autoCapitalize="none"
    />
  );
}

const styles = StyleSheet.create({
  row: {
    borderRadius: radius.pill,
    minHeight: 44,
  },
  input: {
    paddingVertical: 8,
  },
});
