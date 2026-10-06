import type { ReactNode } from 'react';
import type { TextInputProps } from 'react-native';

export type FormInputProps = TextInputProps & {
  label?: string;
  required?: boolean;
  error?: string;
  leftAdornment?: ReactNode;
  rightAdornment?: ReactNode;
  /** When true and maxLength is set, shows a live character counter (e.g. 12/20). */
  showCounter?: boolean;
};
