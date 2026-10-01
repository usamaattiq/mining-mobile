import type { Country } from '@/shared/constants/countries';

export type CountryPickerProps = {
  value: Country;
  onChange: (country: Country) => void;
};

export type CountryPickerTriggerProps = {
  country: Country;
  onPress: () => void;
};

export type CountryPickerSheetProps = {
  visible: boolean;
  countries: Country[];
  selected: Country;
  onSelect: (country: Country) => void;
  onClose: () => void;
};
