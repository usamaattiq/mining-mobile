export type EquipmentListingMode = 'rent' | 'sell';

export type RootStackParamList = {
  Onboarding: undefined;
  Login: undefined;
  SignUpFlow: undefined;
  Welcome: undefined;
  Dashboard: undefined;
  PersonalInformation: undefined;
  SecuritySettings: undefined;
  EquipmentListingMode: undefined;
  EquipmentListingForm: { mode: EquipmentListingMode };
  EquipmentListingDetail: { id: string };
};

export type DashboardTabParamList = {
  HomeTab: undefined;
  Requests: undefined;
  About: undefined;
  Profile: undefined;
};
