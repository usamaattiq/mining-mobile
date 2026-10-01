import type { BottomTabNavigationOptions } from '@react-navigation/bottom-tabs';
import { palette } from '@/theme';

/** Instant tab switch — no cross-fade or slide (avoids ghosting / transparency glitches). */
export const tabNavigatorScreenOptions: BottomTabNavigationOptions = {
  headerShown: false,
  animation: 'none',
  sceneStyle: { backgroundColor: palette.warmWhite },
  tabBarStyle: {
    height: 0,
    overflow: 'hidden' as const,
    backgroundColor: 'transparent',
    borderTopWidth: 0,
    elevation: 0,
  },
};
