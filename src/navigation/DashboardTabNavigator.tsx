import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { FloatingTabBar } from '@/features/dashboard/components/FloatingTabBar';
import { MessagesScreen } from '@/features/messages/screens/MessagesScreen';
import { HomeScreen } from '@/features/dashboard/screens/HomeScreen';
import { RequestsScreen } from '@/features/dashboard/screens/RequestsScreen';
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
      <Tab.Screen name="Requests" component={RequestsScreen} />
      <Tab.Screen name="Messages" component={MessagesScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
