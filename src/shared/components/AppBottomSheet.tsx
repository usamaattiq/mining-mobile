import React from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { useReanimatedKeyboardAnimation } from 'react-native-keyboard-controller';
import {
  initialWindowMetrics,
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import { palette, spacing } from '@/theme';
import type { AppBottomSheetProps } from '@/shared/types/appBottomSheet.types';

/** Floor so 3-button / gesture nav never sits under sheet content when insets lag. */
const MIN_BOTTOM_INSET = 24;

function BottomSheetFrame({
  onClose,
  children,
  heightRatio,
  fitContent,
  sheetStyle,
  avoidKeyboard,
}: {
  onClose: () => void;
  children: React.ReactNode;
  heightRatio: number;
  fitContent: boolean;
  sheetStyle?: StyleProp<ViewStyle>;
  avoidKeyboard: boolean;
}): React.ReactElement {
  const insets = useSafeAreaInsets();
  const { width, height: windowHeight } = useWindowDimensions();
  const { height: keyboardHeight } = useReanimatedKeyboardAnimation();
  const layoutHeight = useSharedValue(windowHeight);
  const lastWidthRef = React.useRef(width);
  const clampedRatio = Math.min(0.95, Math.max(0.22, heightRatio));
  const fallbackBottom = initialWindowMetrics?.insets.bottom ?? 0;
  const closedPaddingBottom = Math.max(insets.bottom, fallbackBottom, MIN_BOTTOM_INSET, spacing.sm);
  const topReserve = Math.max(insets.top, spacing.md);

  React.useEffect(() => {
    if (lastWidthRef.current !== width) {
      lastWidthRef.current = width;
      layoutHeight.value = windowHeight;
      return;
    }
    if (windowHeight >= layoutHeight.value) {
      layoutHeight.value = windowHeight;
    }
  }, [layoutHeight, width, windowHeight]);

  const animatedSheetStyle = useAnimatedStyle(() => {
    const lift = avoidKeyboard ? Math.abs(keyboardHeight.value) : 0;
    const open = lift > 1;
    const fullH = layoutHeight.value;
    // Shrink the sheet into the remaining space so the inner content keeps
    // a real height and can scroll; do not let the sheet overflow under the IME.
    const maxHeight = Math.min(
      fullH * clampedRatio,
      Math.max(fullH - lift - topReserve, fullH * 0.32),
    );
    if (fitContent) {
      return {
        marginBottom: lift,
        height: undefined,
        maxHeight,
        paddingBottom: closedPaddingBottom,
      };
    }
    return {
      marginBottom: lift,
      height: maxHeight,
      paddingBottom: open ? 0 : closedPaddingBottom,
    };
  });

  return (
    <View style={styles.modalRoot}>
      <Pressable
        style={styles.backdrop}
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel="Close"
      />
      <Animated.View style={[styles.sheet, animatedSheetStyle, sheetStyle]}>
        <View style={fitContent ? styles.sheetInnerFit : styles.sheetInner}>{children}</View>
      </Animated.View>
    </View>
  );
}

export function AppBottomSheet({
  visible,
  onClose,
  children,
  heightRatio = 0.7,
  fitContent = false,
  sheetStyle,
  avoidKeyboard = true,
}: AppBottomSheetProps): React.ReactElement {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
      navigationBarTranslucent
    >
      <SafeAreaProvider initialMetrics={initialWindowMetrics ?? undefined}>
        <BottomSheetFrame
          onClose={onClose}
          heightRatio={heightRatio}
          fitContent={fitContent}
          sheetStyle={sheetStyle}
          avoidKeyboard={avoidKeyboard}
        >
          {children}
        </BottomSheetFrame>
      </SafeAreaProvider>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(34, 34, 34, 0.4)',
  },
  sheet: {
    width: '100%',
    backgroundColor: palette.warmWhite,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    overflow: 'hidden',
  },
  sheetInner: {
    flex: 1,
    minHeight: 0,
  },
  sheetInnerFit: {
    flexGrow: 0,
  },
});
