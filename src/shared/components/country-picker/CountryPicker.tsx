import React from 'react';
import { countries } from '@/shared/constants/countries';
import type { Country } from '@/shared/constants/countries';
import type { CountryPickerProps } from '@/shared/types/countryPicker.types';
import { CountryPickerSheet } from './CountryPickerSheet';
import { CountryPickerTrigger } from './CountryPickerTrigger';

export function CountryPicker({ value, onChange }: CountryPickerProps): React.ReactElement {
  const [isSheetVisible, setIsSheetVisible] = React.useState(false);

  const handleSelect = (country: Country) => {
    onChange(country);
    setIsSheetVisible(false);
  };

  return (
    <>
      <CountryPickerTrigger country={value} onPress={() => setIsSheetVisible(true)} />
      <CountryPickerSheet
        visible={isSheetVisible}
        countries={countries}
        selected={value}
        onSelect={handleSelect}
        onClose={() => setIsSheetVisible(false)}
      />
    </>
  );
}
