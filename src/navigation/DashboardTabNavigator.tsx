import React from 'react';
import { AppState, StyleSheet, View } from 'react-native';
import { createBottomTabNavigator, type BottomTabBarProps } from '@react-navigation/bottom-tabs';
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
import { AdminUsersScreen } from '@/features/admin/screens/AdminUsersScreen';
import { AdminListingsScreen } from '@/features/admin/screens/AdminListingsScreen';
import { AdminCategoriesScreen } from '@/features/admin/screens/AdminCategoriesScreen';
import { tabNavigatorScreenOptions } from '@/navigation/tabScreenOptions';
import type { DashboardTabParamList } from '@/navigation/types';
import { useProfileStore } from '@/store/profileStore';
import { useMarketplaceRoleStore } from '@/store/marketplaceRoleStore';
import { useSeenOffersStore } from '@/store/seenOffersStore';
import { refreshListings, refreshOfferedListings } from '@/features/listings/utils/refreshListings';

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
  const isAdmin = useProfileStore((state) => state.profile?.accountType === 'admin');
  const role = useMarketplaceRoleStore((state) => state.role);

  React.useEffect(() => {
    void useSeenOffersStore.getState().hydrate();
  }, []);

  React.useEffect(() => {
    if (isAdmin) return;
    let cancelled = false;
    const load = () => {
      void refreshListings(role).catch(() => undefined);
      void refreshOfferedListings().catch(() => undefined);
    };
    load();
    const interval = setInterval(() => {
      if (!cancelled && AppState.currentState === 'active') load();
    }, 30_000);
    const sub = AppState.addEventListener('change', (next) => {
      if (next === 'active') load();
    });
    return () => {
      cancelled = true;
      clearInterval(interval);
      sub.remove();
    };
  }, [isAdmin, role]);

  return (
    <FloatingTabBarInsetContext.Provider value={contentPadding}>
      <View style={styles.root}>
        <Tab.Navigator
          initialRouteName={isAdmin ? 'AdminUsers' : 'HomeTab'}
          safeAreaInsets={{ top: 0, right: 0, bottom: 0, left: 0 }}
          tabBar={(props) => <TabBarPropsSync {...props} onProps={setTabBarProps} />}
          screenOptions={tabNavigatorScreenOptions}
        >
          {isAdmin ? (
            <>
              <Tab.Screen name="AdminUsers" component={AdminUsersScreen} />
              <Tab.Screen name="AdminListings" component={AdminListingsScreen} />
              <Tab.Screen name="AdminCategories" component={AdminCategoriesScreen} />
              <Tab.Screen name="Profile" component={ProfileScreen} />
            </>
          ) : (
            <>
              <Tab.Screen name="HomeTab" component={HomeScreen} />
              <Tab.Screen name="Requests" component={RequestsScreen} />
              <Tab.Screen name="MyOffers" component={MyOffersScreen} />
              <Tab.Screen name="Profile" component={ProfileScreen} />
            </>
          )}
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
