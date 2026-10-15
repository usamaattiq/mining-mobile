export type LocationFieldProps = {
  label: string;
  value?: string;
  required?: boolean;
  loading?: boolean;
  onChangeText?: (value: string) => void;
  onUseCurrentLocation: () => void;
  onSelectOnMap: () => void;
  /** Show the city only. The stored value stays the full address. */
  cityOnly?: boolean;
};
