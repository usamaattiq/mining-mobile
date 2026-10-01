import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

const LAST_PHONE_KEY = 'devicePrefs.lastPhone';
const CACHED_MPIN_KEY = 'devicePrefs.cachedMpin';
const BIOMETRIC_ENABLED_KEY = 'devicePrefs.biometricEnabled';

export interface LastPhonePreference {
  countryCode: string;
  countryCallingCode: string;
  phoneDigits: string;
}

interface DevicePrefsState {
  hydrated: boolean;
  lastPhone: LastPhonePreference | null;
  cachedMpin: string | null;
  biometricEnabled: boolean;
  hydrate: () => Promise<void>;
  setLastPhone: (preference: LastPhonePreference) => Promise<void>;
  clearLastPhone: () => Promise<void>;
  setCachedMpin: (mpin: string) => Promise<void>;
  clearCachedMpin: () => Promise<void>;
  setBiometricEnabled: (enabled: boolean) => Promise<void>;
}

function parseLastPhone(raw: string | null): LastPhonePreference | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<LastPhonePreference>;
    if (parsed.countryCode && parsed.countryCallingCode && parsed.phoneDigits) {
      return {
        countryCode: parsed.countryCode,
        countryCallingCode: parsed.countryCallingCode,
        phoneDigits: parsed.phoneDigits,
      };
    }
    return null;
  } catch {
    return null;
  }
}

export const useDevicePrefsStore = create<DevicePrefsState>((set) => ({
  hydrated: false,
  lastPhone: null,
  cachedMpin: null,
  biometricEnabled: false,

  hydrate: async () => {
    const [lastPhoneRaw, cachedMpin, biometricEnabled] = await Promise.all([
      AsyncStorage.getItem(LAST_PHONE_KEY),
      SecureStore.getItemAsync(CACHED_MPIN_KEY),
      AsyncStorage.getItem(BIOMETRIC_ENABLED_KEY),
    ]);

    set({
      hydrated: true,
      lastPhone: parseLastPhone(lastPhoneRaw),
      cachedMpin,
      biometricEnabled: biometricEnabled === 'true',
    });
  },

  setLastPhone: async (preference: LastPhonePreference) => {
    await AsyncStorage.setItem(LAST_PHONE_KEY, JSON.stringify(preference));
    set({ lastPhone: preference });
  },

  clearLastPhone: async () => {
    await AsyncStorage.removeItem(LAST_PHONE_KEY);
    set({ lastPhone: null });
  },

  setCachedMpin: async (mpin: string) => {
    await SecureStore.setItemAsync(CACHED_MPIN_KEY, mpin);
    set({ cachedMpin: mpin });
  },

  clearCachedMpin: async () => {
    await SecureStore.deleteItemAsync(CACHED_MPIN_KEY);
    set({ cachedMpin: null });
  },

  setBiometricEnabled: async (enabled: boolean) => {
    // Update state first — the Switch bound to this value is controlled, so
    // awaiting the storage write before `set()` makes it lag behind the native
    // toggle gesture and visibly snap back/forward once the write resolves.
    set({ biometricEnabled: enabled });
    await AsyncStorage.setItem(BIOMETRIC_ENABLED_KEY, String(enabled));
  },
}));
