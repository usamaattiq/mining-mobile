import React, { useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { i18n as appI18n } from '@/i18n';
import { AppText } from '@/shared/components/AppText';
import { palette, radius, spacing } from '@/theme';
import { useMarketplaceRoleStore } from '@/store/marketplaceRoleStore';

const TAB_FOCUS_TIMING = { duration: 200 };

type TabVisual = {
  labelKey: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconFocused: keyof typeof Ionicons.glyphMap;
};

const TAB_VISUALS: Record<string, TabVisual> = {
  HomeTab: {
    labelKey: 'tabs.home',
    icon: 'home-outline',
    iconFocused: 'home',
  },
  Requests: {
    labelKey: 'tabs.requests',
    icon: 'document-text-outline',
    iconFocused: 'document-text',
  },
  MyOffers: {
    labelKey: 'tabs.offers',
    icon: 'pricetag-outline',
    iconFocused: 'pricetag',
  },
  Profile: {
    labelKey: 'tabs.profile',
    icon: 'person-outline',
    iconFocused: 'person',
  },
  AdminUsers: {
    labelKey: 'tabs.users',
    icon: 'people-outline',
    iconFocused: 'people',
  },
  AdminListings: {
    labelKey: 'tabs.listings',
    icon: 'list-outline',
    iconFocused: 'list',
  },
  AdminCategories: {
    labelKey: 'tabs.categories',
    icon: 'grid-outline',
    iconFocused: 'grid',
  },
};

export const FLOATING_TAB_BAR_HEIGHT = 72;
export const FLOATING_TAB_BAR_MARGIN = 16;
/** Extra space under the pill, on top of the device safe area. */
const TAB_BAR_BOTTOM_GAP = spacing.sm;
const PLUS_BUTTON_SIZE = 60;

export const FloatingTabBarInsetContext = React.createContext(0);

export function useFloatingTabBarContentPadding(): number {
  return React.useContext(FloatingTabBarInsetContext);
}

/** Distance from the window bottom to the pill — safe area plus the same gap on every device. */
export function getFloatingTabBarBottomOffset(safeAreaBottom: number): number {
  return Math.max(safeAreaBottom, spacing.sm) + TAB_BAR_BOTTOM_GAP;
}

/** Space scroll content should keep clear so rows are not hidden behind the pill. */
export function getFloatingTabBarReservedHeight(safeAreaBottom: number): number {
  return getFloatingTabBarBottomOffset(safeAreaBottom) + FLOATING_TAB_BAR_HEIGHT;
}

function TabBarItem({
  focused,
  label,
  icon,
  iconFocused,
  onPress,
}: {
  focused: boolean;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconFocused: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
}): React.ReactElement {
  const progress = useSharedValue(focused ? 1 : 0);
  const color = focused ? palette.gold : palette.muted;

  useEffect(() => {
    progress.value = withTiming(focused ? 1 : 0, TAB_FOCUS_TIMING);
  }, [focused, progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 0.97 + progress.value * 0.03 }],
  }));

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: focused }}
      accessibilityLabel={label}
      style={({ pressed }) => [styles.tabItem, pressed && styles.pressed]}
    >
      <Animated.View style={[styles.tabItemInner, animatedStyle]}>
        <Ionicons name={focused ? iconFocused : icon} size={22} color={color} />
        <AppText
          weight={focused ? 'semibold' : 'medium'}
          style={[styles.tabLabel, { color }]}
          numberOfLines={1}
        >
          {label}
        </AppText>
      </Animated.View>
    </Pressable>
  );
}

export function FloatingTabBar({ state, navigation }: BottomTabBarProps): React.ReactElement {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation(undefined, { i18n: appI18n });
  const isBuyer = useMarketplaceRoleStore((state) => state.role === 'buyer');
  const bottomOffset = getFloatingTabBarBottomOffset(insets.bottom);
  const rootNavigation = navigation.getParent<NativeStackNavigationProp<RootStackParamList>>();

  const routes = state.routes.filter((route) => TAB_VISUALS[route.name]);
  const isAdminBar = routes.some((route) => route.name === 'AdminUsers');
  const firstHalf = isAdminBar ? routes : routes.slice(0, Math.ceil(routes.length / 2));
  const secondHalf = isAdminBar ? [] : routes.slice(Math.ceil(routes.length / 2));

  const renderTab = (route: (typeof routes)[number]) => {
    const visual = TAB_VISUALS[route.name];
    if (!visual) return null;
    const index = state.routes.findIndex((r) => r.key === route.key);
    const focused = state.index === index;
    const onPress = () => {
      const event = navigation.emit({
        type: 'tabPress',
        target: route.key,
        canPreventDefault: true,
      });

      if (!focused && !event.defaultPrevented) {
        navigation.navigate(route.name);
      }
    };

    return (
      <TabBarItem
        key={route.key}
        focused={focused}
        label={t(
          route.name === 'Requests' && isBuyer ? 'tabs.myRequests' : visual.labelKey,
        )}
        icon={visual.icon}
        iconFocused={visual.iconFocused}
        onPress={onPress}
      />
    );
  };

  return (
    <View pointerEvents="box-none" style={styles.dock}>
      <View pointerEvents="box-none" style={[styles.wrapper, { marginBottom: bottomOffset }]}>
        <View style={styles.bar}>
          {firstHalf.map(renderTab)}
          {isAdminBar ? null : (
            <View style={styles.plusSlot} pointerEvents="none">
              <AppText weight="medium" style={styles.plusLabel} numberOfLines={2}>
                {t(isBuyer ? 'tabs.createRequest' : 'tabs.createListing')}
              </AppText>
            </View>
          )}
          {secondHalf.map(renderTab)}
        </View>

        {isAdminBar ? null : (
          <Pressable
            onPress={() => rootNavigation?.navigate('QuickCreate')}
            accessibilityRole="button"
            accessibilityLabel={t(isBuyer ? 'tabs.createRequest' : 'tabs.createListing')}
            style={({ pressed }) => [styles.plusButton, pressed && styles.plusButtonPressed]}
          >
            <Ionicons name="add" size={28} color={palette.pureWhite} />
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  dock: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
  },
  wrapper: {
    marginHorizontal: FLOATING_TAB_BAR_MARGIN,
    zIndex: 20,
  },
  bar: {
    minHeight: FLOATING_TAB_BAR_HEIGHT,
    borderRadius: radius.pill,
    backgroundColor: palette.pureWhite,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(233, 229, 221, 0.95)',
    shadowColor: '#000000',
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 18,
    elevation: 12,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xs,
  },
  plusSlot: {
    width: 78,
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 8,
  },
  plusLabel: {
    fontSize: 10,
    lineHeight: 12,
    textAlign: 'center',
    color: palette.muted,
  },
  plusButton: {
    position: 'absolute',
    top: -PLUS_BUTTON_SIZE / 2 + 8,
    left: '50%',
    marginLeft: -PLUS_BUTTON_SIZE / 2,
    width: PLUS_BUTTON_SIZE,
    height: PLUS_BUTTON_SIZE,
    borderRadius: radius.pill,
    backgroundColor: palette.gold,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: palette.pureWhite,
    shadowColor: '#000000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 10,
    elevation: 14,
  },
  plusButtonPressed: {
    opacity: 0.9,
  },
  tabItemInner: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    width: '100%',
  },
  tabLabel: {
    fontSize: 11,
    textAlign: 'center',
    width: '100%',
  },
  pressed: {
    opacity: 0.82,
  },
});
