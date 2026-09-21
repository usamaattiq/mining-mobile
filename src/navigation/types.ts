import type { NavigatorScreenParams } from '@react-navigation/native';

export type EquipmentListingMode = 'rent' | 'sell';

/** Top-level Requests-tab category — switchable, mirrors the Home action cards. */
export type ListingCategory = 'equipment' | 'services' | 'gold';

export type MarketplaceRole = 'buyer' | 'supplier';

export type ServiceType = 'onsite' | 'online' | 'both';

export type DashboardTabParamList = {
  HomeTab: undefined;
  Requests: { requestId?: string; category?: ListingCategory } | undefined;
  MyOffers: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  Onboarding: undefined;
  Login: undefined;
  SignUpFlow: undefined;
  Welcome: { next?: 'listings'; category?: ListingCategory } | undefined;
  Dashboard: NavigatorScreenParams<DashboardTabParamList> | undefined;
  PersonalInformation: undefined;
  SecuritySettings: undefined;
  EquipmentListingForm: undefined;
  ServiceListingForm: undefined;
  GoldListingForm: undefined;
  CompleteListingDetail: { id: string; category: ListingCategory };
  Conversation: { conversationId: string };
  Messages: undefined;
  Notifications: undefined;
  QuickCreate: undefined;
};
