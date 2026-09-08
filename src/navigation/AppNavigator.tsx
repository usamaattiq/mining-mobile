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
        animation: 'slide_from_right',
        animationDuration: 320,
        gestureEnabled: true,
        fullScreenGestureEnabled: true,
        contentStyle: { backgroundColor: palette.pureWhite },
      }}
    >
      <Stack.Screen
        name="Onboarding"
        component={OnboardingScreen}
        options={{ animation: 'fade' }}
      />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="SignUpFlow" component={SignUpFlowScreen} />
    </Stack.Navigator>
  );
}
