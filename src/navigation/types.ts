import type { NavigatorScreenParams } from '@react-navigation/native';

export type EquipmentListingMode = 'rent' | 'sell' | 'both';

/** Top-level Requests-tab category — switchable, mirrors the Home action cards. */
export type ListingCategory = 'equipment' | 'services' | 'gold';

export type MarketplaceRole = 'buyer' | 'supplier';

export type ServiceType = 'onsite' | 'online' | 'both';

export type DashboardTabParamList = {
  HomeTab: undefined;
  Requests: { requestId?: string; category?: ListingCategory } | undefined;
  MyOffers: undefined;
  AdminUsers: undefined;
  AdminListings: undefined;
  AdminCategories: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  Onboarding: undefined;
  Login: undefined;
  SignUpFlow: undefined;
  Welcome: { next?: 'listings'; category?: ListingCategory; listingId?: string } | undefined;
  Dashboard: NavigatorScreenParams<DashboardTabParamList> | undefined;
  PersonalInformation: undefined;
  AdminUserProfile: { userId: string };
  SecuritySettings: undefined;
  EquipmentListingForm: { repostId?: string; editId?: string } | undefined;
  ServiceListingForm: { repostId?: string; editId?: string } | undefined;
  GoldListingForm: { repostId?: string; editId?: string } | undefined;
  CompleteListingDetail: { id: string; category: ListingCategory };
  EquipmentStock: { id: string };
  AdminSystemMessage: undefined;
  AdminSystemCategories: undefined;
  Conversation: { conversationId: string };
  Messages: undefined;
  Notifications: undefined;
  QuickCreate: undefined;
};
