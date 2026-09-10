export type SignupLocationFieldProps = {
  label: string;
  value?: string;
  required?: boolean;
  loading?: boolean;
  onChangeText: (value: string) => void;
  onUseCurrentLocation: () => void;
  onSelectOnMap: () => void;
};
