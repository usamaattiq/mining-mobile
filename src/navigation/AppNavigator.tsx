import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LoginScreen } from '@/features/auth/screens/LoginScreen';
import { SignUpFlowScreen } from '@/features/auth/screens/SignUpFlowScreen';
import { OnboardingScreen } from '@/features/shared/screens/OnboardingScreen';
import type { RootStackParamList } from '@/navigation/types';
import { palette } from '@/shared/theme/tokens';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator(): React.ReactElement {
  return (
    <Stack.Navigator
      initialRouteName="Onboarding"
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: palette.pureWhite },
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
    </Stack.Navigator>
  );
}
