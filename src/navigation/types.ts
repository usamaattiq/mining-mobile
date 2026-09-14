import type { NavigatorScreenParams } from '@react-navigation/native';

export type EquipmentListingMode = 'rent' | 'sell';

/** Top-level Requests-tab category — switchable, mirrors the Home action cards. */
export type ListingCategory = 'equipment' | 'services' | 'gold';

export type ServiceType = 'onsite' | 'online';

export type DashboardTabParamList = {
  HomeTab: undefined;
  Requests: undefined;
  Messages: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  Onboarding: undefined;
  Login: undefined;
  SignUpFlow: undefined;
  Welcome: undefined;
  Dashboard: NavigatorScreenParams<DashboardTabParamList> | undefined;
  PersonalInformation: undefined;
  SecuritySettings: undefined;
  EquipmentListingMode: undefined;
  EquipmentListingForm: { mode: EquipmentListingMode };
  ServiceListingMode: undefined;
  ServiceListingForm: { serviceType: ServiceType };
  GoldListingForm: undefined;
  CompleteListingDetail: { id: string; category: ListingCategory };
  Conversation: { conversationId: string };
  Notifications: undefined;
  QuickCreate: undefined;
};
