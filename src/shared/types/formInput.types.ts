import type { ReactNode } from 'react';
import type { TextInputProps } from 'react-native';

export type FormInputProps = TextInputProps & {
  label?: string;
  required?: boolean;
  error?: string;
  leftAdornment?: ReactNode;
};
