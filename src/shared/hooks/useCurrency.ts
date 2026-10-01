import { useProfileStore } from '@/store/profileStore';
import { currencyForCountry, type Currency } from '@/shared/constants/currencies';

/** Currency to display prices in, based on the country of the phone number used to sign up/log in. */
export function useCurrency(): Currency {
  const countryCode = useProfileStore((state) => state.profile?.countryCode);
  return currencyForCountry(countryCode);
}
