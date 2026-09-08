export interface PhoneIdentity {
  countryCallingCode: string;
  phoneDigits: string;
  countryCode: string;
}

export type LoginOtpPurpose = 'login' | 'mpin_reset';
export type AccountType = 'individual' | 'company';

export interface UserProfileDto {
  id: string;
  fullName: string;
  phoneE164: string;
  countryCode: string;
  countryCallingCode: string;
  email: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  avatarUrl: string | null;
  accountType: AccountType;
  companyName: string | null;
  biometricEnabled: boolean;
  isVerified: boolean;
  hasMpin: boolean;
}

export interface AuthLoginResultDto {
  accessToken: string;
  profile: UserProfileDto;
}

export interface AuthSignupResultDto {
  userId: string;
  accessToken: string;
  profile: UserProfileDto;
}

export interface UpdateProfilePayload {
  fullName?: string;
  accountType?: AccountType;
  companyName?: string | null;
  email?: string | null;
  address?: string | null;
  locationCoordinates?: { latitude: number; longitude: number } | null;
  avatarUrl?: string | null;
  biometricEnabled?: boolean;
}

export interface SignupSubmitPayload extends PhoneIdentity {
  fullName: string;
  accountType: AccountType;
  companyName?: string;
  email?: string;
  address?: string;
  locationCoordinates?: { latitude: number; longitude: number } | null;
  avatarUrl?: string | null;
  mpin: string;
  biometricEnabled: boolean;
  deviceId: string;
}
