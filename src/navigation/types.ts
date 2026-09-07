export type UserRole = 'buyer' | 'supplier';

export type RootStackParamList = {
  Onboarding: undefined;
  Login: undefined;
  SignUpRole: undefined;
  SignUpPhone: { role: UserRole };
  SignUpOtp: { role: UserRole; phone: string };
  SignUpPersonalInfo: { role: UserRole; phone: string };
  SignUpSecurity: { role: UserRole; phone: string; fullName: string; email: string };
};
