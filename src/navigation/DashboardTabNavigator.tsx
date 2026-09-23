import React from 'react';
import { StyleSheet, View } from 'react-native';
import {
  createBottomTabNavigator,
  type BottomTabBarProps,
} from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  FloatingTabBar,
  FloatingTabBarInsetContext,
  getFloatingTabBarReservedHeight,
} from '@/features/dashboard/components/FloatingTabBar';
import { HomeScreen } from '@/features/dashboard/screens/HomeScreen';
import { RequestsScreen } from '@/features/dashboard/screens/RequestsScreen';
import { MyOffersScreen } from '@/features/dashboard/screens/MyOffersScreen';
import { ProfileScreen } from '@/features/dashboard/screens/ProfileScreen';
import { tabNavigatorScreenOptions } from '@/navigation/tabScreenOptions';
import type { DashboardTabParamList } from '@/navigation/types';

const Tab = createBottomTabNavigator<DashboardTabParamList>();

function TabBarPropsSync({
  onProps,
  ...props
}: BottomTabBarProps & { onProps: (props: BottomTabBarProps) => void }): null {
  const tabIndex = props.state.index;
  React.useLayoutEffect(() => {
    onProps(props);
    // Tab bar chrome only needs a refresh when the focused tab changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- avoid setState loops from new props identities
  }, [onProps, tabIndex]);
  return null;
}

export function DashboardTabNavigator(): React.ReactElement {
  const insets = useSafeAreaInsets();
  const contentPadding = getFloatingTabBarReservedHeight(insets.bottom);
  const [tabBarProps, setTabBarProps] = React.useState<BottomTabBarProps | null>(null);

  return (
    <FloatingTabBarInsetContext.Provider value={contentPadding}>
      <View style={styles.root}>
        <Tab.Navigator
          initialRouteName="HomeTab"
          safeAreaInsets={{ top: 0, right: 0, bottom: 0, left: 0 }}
          tabBar={(props) => <TabBarPropsSync {...props} onProps={setTabBarProps} />}
          screenOptions={tabNavigatorScreenOptions}
        >
          <Tab.Screen name="HomeTab" component={HomeScreen} />
          <Tab.Screen name="Requests" component={RequestsScreen} />
          <Tab.Screen name="MyOffers" component={MyOffersScreen} />
          <Tab.Screen name="Profile" component={ProfileScreen} />
        </Tab.Navigator>
        {tabBarProps ? <FloatingTabBar {...tabBarProps} /> : null}
      </View>
    </FloatingTabBarInsetContext.Provider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
