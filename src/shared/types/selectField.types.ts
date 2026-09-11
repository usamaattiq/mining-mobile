import type { Ionicons } from '@expo/vector-icons';

export type SelectFieldOption = {
  value: string;
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
};

export type SelectFieldProps = {
  label?: string;
  placeholder: string;
  sheetTitle: string;
  options: SelectFieldOption[];
  value: string | null;
  onChange: (value: string) => void;
  required?: boolean;
  error?: string;
  /** Shows a search input above the option list — useful for longer lists. */
  searchable?: boolean;
  searchPlaceholder?: string;
  /** Smaller trigger (less padding, smaller text) for inline/compact placements. */
  compact?: boolean;
  /** Opens a small popover menu anchored under the trigger instead of a bottom sheet. */
  dropdown?: boolean;
};
