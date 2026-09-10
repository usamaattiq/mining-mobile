import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LoginScreen } from '@/features/auth/screens/LoginScreen';
import { SignUpFlowScreen } from '@/features/auth/screens/SignUpFlowScreen';
import { OnboardingScreen } from '@/features/shared/screens/OnboardingScreen';
import { WelcomeScreen } from '@/features/shared/screens/WelcomeScreen';
import { DashboardTabNavigator } from '@/navigation/DashboardTabNavigator';
import { PersonalInformationScreen } from '@/features/dashboard/screens/PersonalInformationScreen';
import { SecuritySettingsScreen } from '@/features/dashboard/screens/SecuritySettingsScreen';
import type { RootStackParamList } from '@/navigation/types';
import { palette } from '@/theme';
import { useAuthStore } from '@/store/authStore';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator(): React.ReactElement {
  // Computed once at mount — App.tsx already confirms/hydrates the session
  // before this navigator ever renders, so a restored 'authenticated' status
  // here means a verified, non-stale session.
  const [initialRouteName] = React.useState<keyof RootStackParamList>(() =>
    useAuthStore.getState().status === 'authenticated' ? 'Welcome' : 'Onboarding',
  );

  return (
    <Stack.Navigator
      initialRouteName={initialRouteName}
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: palette.pureWhite },
        statusBarTranslucent: true,
        statusBarBackgroundColor: 'transparent',
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
      <Stack.Screen name="SecuritySettings" component={SecuritySettingsScreen} />
    </Stack.Navigator>
  );
}
