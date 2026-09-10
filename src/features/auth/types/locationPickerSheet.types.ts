export type LocationSelection = {
  label: string;
  latitude: number;
  longitude: number;
};

export type LocationPickerSheetProps = {
  visible: boolean;
  initial: { latitude: number; longitude: number } | null;
  onCancel: () => void;
  onConfirm: (selection: LocationSelection) => void;
};
