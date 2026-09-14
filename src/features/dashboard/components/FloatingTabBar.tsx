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
import type { RootStackParamList } from '@/navigation/types';

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
  Messages: {
    labelKey: 'tabs.messages',
    icon: 'chatbubble-ellipses-outline',
    iconFocused: 'chatbubble-ellipses',
  },
  Profile: {
    labelKey: 'tabs.profile',
    icon: 'person-outline',
    iconFocused: 'person',
  },
};

export const FLOATING_TAB_BAR_HEIGHT = 72;
export const FLOATING_TAB_BAR_MARGIN = 16;
const PLUS_BUTTON_SIZE = 60;

/** Distance from the tab bar container bottom to the pill bar. */
export function getFloatingTabBarBottomOffset(safeAreaBottom: number): number {
  return Math.max(safeAreaBottom, spacing.sm) + spacing.sm;
}

/** Total vertical space the tab bar occupies in the navigator. */
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
  const bottomOffset = getFloatingTabBarBottomOffset(insets.bottom);
  const reservedHeight = getFloatingTabBarReservedHeight(insets.bottom);
  const rootNavigation = navigation.getParent<NativeStackNavigationProp<RootStackParamList>>();

  const routes = state.routes.filter((route) => TAB_VISUALS[route.name]);
  const firstHalf = routes.slice(0, Math.ceil(routes.length / 2));
  const secondHalf = routes.slice(Math.ceil(routes.length / 2));

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
        label={t(visual.labelKey)}
        icon={visual.icon}
        iconFocused={visual.iconFocused}
        onPress={onPress}
      />
    );
  };

  return (
    <View pointerEvents="box-none" style={{ height: reservedHeight }}>
      <View pointerEvents="box-none" style={[styles.wrapper, { bottom: bottomOffset }]}>
        <View style={styles.bar}>
          {firstHalf.map(renderTab)}
          <View style={styles.plusSlot} />
          {secondHalf.map(renderTab)}
        </View>

        <Pressable
          onPress={() => rootNavigation?.navigate('QuickCreate')}
          accessibilityRole="button"
          accessibilityLabel={t('dashboardHome.quickCreateTitle')}
          style={({ pressed }) => [styles.plusButton, pressed && styles.plusButtonPressed]}
        >
          <Ionicons name="add" size={28} color={palette.pureWhite} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: FLOATING_TAB_BAR_MARGIN,
    right: FLOATING_TAB_BAR_MARGIN,
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
    width: PLUS_BUTTON_SIZE,
  },
  plusButton: {
    position: 'absolute',
    top: -PLUS_BUTTON_SIZE / 2 + 14,
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
