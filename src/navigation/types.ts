export type EquipmentListingMode = 'rent' | 'sell';

/** Top-level Requests-tab category — switchable, mirrors the Home action cards. */
export type ListingCategory = 'equipment' | 'services' | 'gold';

export type ServiceType = 'onsite' | 'online';

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
  ServiceListingMode: undefined;
  ServiceListingForm: { serviceType: ServiceType };
  ServiceListingDetail: { id: string };
  GoldListingForm: undefined;
  GoldListingDetail: { id: string };
};

export type DashboardTabParamList = {
  HomeTab: undefined;
  Requests: undefined;
  About: undefined;
  Profile: undefined;
};
