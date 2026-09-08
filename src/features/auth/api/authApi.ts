import { apiFetch } from '@/shared/services/api';
import type {
  AuthLoginResultDto,
  AuthSignupResultDto,
  LoginOtpPurpose,
  PhoneIdentity,
  SignupSubmitPayload,
  UserProfileDto,
} from './authApi.types';

export const authApi = {
  sendSignupOtp(phone: PhoneIdentity): Promise<{ sent: boolean }> {
    return apiFetch('/auth/signup/otp/send', { method: 'POST', body: phone });
  },

  verifySignupOtp(phone: PhoneIdentity, otp: string): Promise<{ verified: boolean }> {
    return apiFetch('/auth/signup/otp/verify', { method: 'POST', body: { ...phone, otp } });
  },

  submitSignup(payload: SignupSubmitPayload): Promise<AuthSignupResultDto> {
    return apiFetch('/auth/signup/submit', { method: 'POST', body: payload });
  },

  sendLoginOtp(
    phone: PhoneIdentity,
    purpose: LoginOtpPurpose = 'login',
  ): Promise<{ sent: boolean }> {
    return apiFetch('/auth/login/otp/send', { method: 'POST', body: { ...phone, purpose } });
  },

  verifyLoginOtp(
    phone: PhoneIdentity,
    otp: string,
    purpose: LoginOtpPurpose = 'login',
  ): Promise<{ verified: boolean }> {
    return apiFetch('/auth/login/otp/verify', {
      method: 'POST',
      body: { ...phone, otp, purpose },
    });
  },

  loginWithMpin(phone: PhoneIdentity, mpin: string, deviceId: string): Promise<AuthLoginResultDto> {
    return apiFetch('/auth/login/mpin', { method: 'POST', body: { ...phone, mpin, deviceId } });
  },

  resetMpin(phone: PhoneIdentity, newMpin: string, deviceId: string): Promise<AuthLoginResultDto> {
    return apiFetch('/auth/login/mpin/reset', {
      method: 'POST',
      body: { ...phone, newMpin, deviceId },
    });
  },

  getMe(): Promise<UserProfileDto> {
    return apiFetch('/auth/me');
  },

  logout(deviceId?: string): Promise<{ loggedOut: boolean }> {
    return apiFetch('/auth/logout', { method: 'POST', body: deviceId ? { deviceId } : {} });
  },
};
