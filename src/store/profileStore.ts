import { create } from 'zustand';
import type { UserProfileDto } from '@/features/auth/api/authApi.types';

interface ProfileState {
  profile: UserProfileDto | null;
  setProfile: (profile: UserProfileDto) => void;
  clear: () => void;
}

export const useProfileStore = create<ProfileState>((set) => ({
  profile: null,
  setProfile: (profile) => set({ profile }),
  clear: () => set({ profile: null }),
}));
