import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { FloatingTabBar } from '@/features/dashboard/components/FloatingTabBar';
import { AboutScreen } from '@/features/dashboard/screens/AboutScreen';
import { HomeScreen } from '@/features/dashboard/screens/HomeScreen';
import { ProfileScreen } from '@/features/dashboard/screens/ProfileScreen';
import { tabNavigatorScreenOptions } from '@/navigation/tabScreenOptions';
import type { DashboardTabParamList } from '@/navigation/types';

const Tab = createBottomTabNavigator<DashboardTabParamList>();

export function DashboardTabNavigator(): React.ReactElement {
  return (
    <Tab.Navigator
      initialRouteName="HomeTab"
      tabBar={(props) => <FloatingTabBar {...props} />}
      screenOptions={tabNavigatorScreenOptions}
    >
      <Tab.Screen name="HomeTab" component={HomeScreen} />
      <Tab.Screen name="About" component={AboutScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
