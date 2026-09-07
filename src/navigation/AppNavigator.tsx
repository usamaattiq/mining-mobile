import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LoginScreen } from '@/features/auth/screens/LoginScreen';
import { SignUpRoleScreen } from '@/features/auth/screens/SignUpRoleScreen';
import { SignUpPhoneScreen } from '@/features/auth/screens/SignUpPhoneScreen';
import { SignUpOtpScreen } from '@/features/auth/screens/SignUpOtpScreen';
import { SignUpPersonalInfoScreen } from '@/features/auth/screens/SignUpPersonalInfoScreen';
import { SignUpSecurityScreen } from '@/features/auth/screens/SignUpSecurityScreen';
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
      <Stack.Screen name="SignUpRole" component={SignUpRoleScreen} />
      <Stack.Screen name="SignUpPhone" component={SignUpPhoneScreen} />
      <Stack.Screen name="SignUpOtp" component={SignUpOtpScreen} />
      <Stack.Screen name="SignUpPersonalInfo" component={SignUpPersonalInfoScreen} />
      <Stack.Screen name="SignUpSecurity" component={SignUpSecurityScreen} />
    </Stack.Navigator>
  );
}
