import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LoginScreen } from '@/features/auth/screens/LoginScreen';
import { SignUpFlowScreen } from '@/features/auth/screens/SignUpFlowScreen';
import { OnboardingScreen } from '@/features/shared/screens/OnboardingScreen';
import { WelcomeScreen } from '@/features/shared/screens/WelcomeScreen';
import { DashboardTabNavigator } from '@/navigation/DashboardTabNavigator';
import { PersonalInformationScreen } from '@/features/dashboard/screens/PersonalInformationScreen';
import { AdminUserProfileScreen } from '@/features/admin/screens/AdminUserProfileScreen';
import { SecuritySettingsScreen } from '@/features/dashboard/screens/SecuritySettingsScreen';
import { EquipmentListingFormScreen } from '@/features/listings/screens/EquipmentListingFormScreen';
import { ServiceListingFormScreen } from '@/features/listings/screens/ServiceListingFormScreen';
import { GoldListingFormScreen } from '@/features/listings/screens/GoldListingFormScreen';
import { CompleteListingDetailScreen } from '@/features/listings/screens/CompleteListingDetailScreen';
import { EquipmentStockScreen } from '@/features/listings/screens/EquipmentStockScreen';
import { AdminSystemCategoriesScreen } from '@/features/admin/screens/AdminCategoriesScreen';
import { AdminSystemMessageScreen } from '@/features/admin/screens/AdminSystemMessageScreen';
import { QuickCreateScreen } from '@/features/dashboard/screens/QuickCreateScreen';
import { ConversationScreen } from '@/features/messages/screens/ConversationScreen';
import { MessagesScreen } from '@/features/messages/screens/MessagesScreen';
import { NotificationsScreen } from '@/features/dashboard/screens/NotificationsScreen';
import type { RootStackParamList } from '@/navigation/types';
import { palette } from '@/theme';
import { useAuthStore } from '@/store/authStore';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator(): React.ReactElement {
  // Computed once at mount — App.tsx already confirms/hydrates the session
  // before this navigator ever renders, so a restored 'authenticated' status
  // here means a verified, non-stale session.
  const [initialRouteName] = React.useState<keyof RootStackParamList>(() =>
    useAuthStore.getState().status === 'authenticated' ? 'Dashboard' : 'Onboarding',
  );

  return (
    <Stack.Navigator
      initialRouteName={initialRouteName}
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: palette.pureWhite },
        statusBarTranslucent: true,
        statusBarBackgroundColor: 'transparent',
        navigationBarTranslucent: true,
        navigationBarColor: 'transparent',
      }}
    >
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ contentStyle: { backgroundColor: palette.gold } }}
      />
      <Stack.Screen
        name="SignUpFlow"
        component={SignUpFlowScreen}
        options={{ contentStyle: { backgroundColor: palette.gold } }}
      />
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Dashboard" component={DashboardTabNavigator} />
      <Stack.Screen name="PersonalInformation" component={PersonalInformationScreen} />
      <Stack.Screen name="AdminUserProfile" component={AdminUserProfileScreen} />
      <Stack.Screen name="SecuritySettings" component={SecuritySettingsScreen} />
      <Stack.Screen name="EquipmentListingForm" component={EquipmentListingFormScreen} />
      <Stack.Screen name="ServiceListingForm" component={ServiceListingFormScreen} />
      <Stack.Screen name="GoldListingForm" component={GoldListingFormScreen} />
      <Stack.Screen name="CompleteListingDetail" component={CompleteListingDetailScreen} />
      <Stack.Screen name="EquipmentStock" component={EquipmentStockScreen} />
      <Stack.Screen name="AdminSystemMessage" component={AdminSystemMessageScreen} />
      <Stack.Screen name="AdminSystemCategories" component={AdminSystemCategoriesScreen} />
      <Stack.Screen
        name="Messages"
        component={MessagesScreen}
        options={{ contentStyle: { backgroundColor: palette.gold } }}
      />
      <Stack.Screen
        name="Conversation"
        component={ConversationScreen}
        options={{ contentStyle: { backgroundColor: palette.gold } }}
      />
      <Stack.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{ contentStyle: { backgroundColor: palette.gold } }}
      />
      <Stack.Screen
        name="QuickCreate"
        component={QuickCreateScreen}
        options={{ contentStyle: { backgroundColor: palette.gold } }}
      />
    </Stack.Navigator>
  );
}
