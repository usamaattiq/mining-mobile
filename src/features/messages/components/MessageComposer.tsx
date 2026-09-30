import React from 'react';
import { ActivityIndicator, Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { KeyboardStickyView, useKeyboardState } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLanguage } from '@/i18n/hooks/useLanguage';
import { getFontFamily, palette, radius, spacing } from '@/theme';
import type { MessageComposerProps } from '@/features/messages/types/messageComposer.types';

export function MessageComposer({
  value,
  onChangeText,
  onSend,
  placeholder,
  sendLabel,
  sending = false,
}: MessageComposerProps): React.ReactElement {
  const insets = useSafeAreaInsets();
  const { currentLanguage } = useLanguage();
  const keyboardVisible = useKeyboardState((state) => state.isVisible);
  const canSend = Boolean(value.trim()) && !sending;
  const paddingBottom = keyboardVisible ? spacing.sm : Math.max(insets.bottom, spacing.md);

  return (
    <KeyboardStickyView offset={{ closed: 0, opened: 0 }}>
    <View style={[styles.composer, { paddingBottom }]}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={palette.muted}
        multiline
        maxLength={2000}
        style={[styles.input, { fontFamily: getFontFamily(currentLanguage) }]}
      />
      <Pressable
        onPress={onSend}
        disabled={!canSend}
        accessibilityRole="button"
        accessibilityLabel={sendLabel}
        style={({ pressed }) => [
          styles.sendButton,
          !canSend && styles.sendButtonDisabled,
          pressed && canSend && styles.sendButtonPressed,
        ]}
      >
        {sending ? (
          <ActivityIndicator color={palette.pureWhite} size="small" />
        ) : (
          <Ionicons name="send" size={16} color={palette.pureWhite} />
        )}
      </Pressable>
    </View>
    </KeyboardStickyView>
  );
}

const styles = StyleSheet.create({
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.xs,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: palette.softGold,
    backgroundColor: palette.pureWhite,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: palette.softGold,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    paddingTop: Platform.OS === 'ios' ? 10 : 8,
    paddingBottom: Platform.OS === 'ios' ? 10 : 8,
    fontSize: 14,
    lineHeight: 20,
    textAlignVertical: 'center',
    color: palette.charcoal,
    backgroundColor: palette.pureWhite,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: palette.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonPressed: {
    backgroundColor: palette.goldDark,
  },
  sendButtonDisabled: {
    opacity: 0.4,
  },
});
