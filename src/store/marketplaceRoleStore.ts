import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { TFunction } from 'i18next';
import type { MarketplaceRole } from '@/navigation/types';
import { showAppAlert } from '@/shared/services/appAlert';

const ROLE_KEY = 'marketplace.role';

interface MarketplaceRoleState {
  role: MarketplaceRole;
  hydrate: () => Promise<void>;
  setRole: (role: MarketplaceRole) => Promise<void>;
  toggleRole: () => Promise<MarketplaceRole>;
}

export function oppositeMarketplaceRole(role: MarketplaceRole): MarketplaceRole {
  return role === 'buyer' ? 'supplier' : 'buyer';
}

export function confirmSwitchMarketplaceRole(t: TFunction): void {
  const next = oppositeMarketplaceRole(useMarketplaceRoleStore.getState().role);
  const isBuyer = next === 'buyer';

  showAppAlert(
    t(isBuyer ? 'profile.switchToBuyerConfirmTitle' : 'profile.switchToSupplierConfirmTitle'),
    t(isBuyer ? 'profile.switchToBuyerConfirmMessage' : 'profile.switchToSupplierConfirmMessage'),
    [
      { text: t('common.no'), style: 'cancel' },
      {
        text: t('common.yes'),
        onPress: () => {
          void useMarketplaceRoleStore.getState().toggleRole();
        },
      },
    ],
  );
}

export const useMarketplaceRoleStore = create<MarketplaceRoleState>((set, get) => ({
  role: 'supplier',

  hydrate: async () => {
    const stored = await AsyncStorage.getItem(ROLE_KEY);
    if (stored === 'buyer' || stored === 'supplier') {
      set({ role: stored });
    }
  },

  setRole: async (role) => {
    set({ role });
    await AsyncStorage.setItem(ROLE_KEY, role);
  },

  toggleRole: async () => {
    const next = oppositeMarketplaceRole(get().role);
    await get().setRole(next);
    return next;
  },
}));
