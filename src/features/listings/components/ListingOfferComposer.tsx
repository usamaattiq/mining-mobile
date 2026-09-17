import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '@/shared/components/AppText';
import { useLanguage } from '@/i18n/hooks/useLanguage';
import { getFontFamily, palette, radius, spacing } from '@/theme';
import type { ListingOfferComposerProps } from '@/features/listings/types/listingOfferComposer.types';

export function ListingOfferComposer({
  currencyCode,
  placeholder,
  sendLabel,
  submittedLabel,
  confirmLabel,
  declineLabel,
  hasOffer,
  awaitingConfirm,
  submitting,
  onSubmit,
  onConfirm,
  onDecline,
}: ListingOfferComposerProps): React.ReactElement {
  const insets = useSafeAreaInsets();
  const { currentLanguage } = useLanguage();
  const [price, setPrice] = React.useState('');
  const canSend = /^\d+(\.\d{1,2})?$/.test(price.trim()) && Number(price) > 0 && !submitting;

  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
      {awaitingConfirm ? (
        <View style={styles.confirmRow}>
          <Pressable
            onPress={onDecline}
            disabled={submitting}
            accessibilityRole="button"
            accessibilityLabel={declineLabel}
            style={({ pressed }) => [
              styles.decline,
              submitting && styles.sendDisabled,
              pressed && !submitting && styles.declinePressed,
            ]}
          >
            <AppText weight="bold" style={styles.declineLabel}>
              {declineLabel}
            </AppText>
          </Pressable>
          <Pressable
            onPress={onConfirm}
            disabled={submitting}
            accessibilityRole="button"
            accessibilityLabel={confirmLabel}
            style={({ pressed }) => [
              styles.send,
              styles.confirm,
              submitting && styles.sendDisabled,
              pressed && !submitting && styles.sendPressed,
            ]}
          >
            {submitting ? (
              <ActivityIndicator color={palette.pureWhite} size="small" />
            ) : (
              <AppText weight="bold" style={styles.sendLabel}>
                {confirmLabel}
              </AppText>
            )}
          </Pressable>
        </View>
      ) : hasOffer ? (
        <View style={styles.submittedRow}>
          <Ionicons name="checkmark-circle" size={18} color={palette.gold} />
          <AppText weight="semibold" style={styles.submittedText}>
            {submittedLabel}
          </AppText>
        </View>
      ) : (
        <View style={styles.row}>
          <View style={styles.inputWrap}>
            <AppText weight="semibold" style={styles.currency}>
              {currencyCode}
            </AppText>
            <TextInput
              value={price}
              onChangeText={setPrice}
              placeholder={placeholder}
              placeholderTextColor={palette.muted}
              keyboardType="decimal-pad"
              editable={!submitting}
              style={[styles.input, { fontFamily: getFontFamily(currentLanguage) }]}
            />
          </View>
          <Pressable
            onPress={() => onSubmit(price.trim())}
            disabled={!canSend}
            accessibilityRole="button"
            accessibilityLabel={sendLabel}
            style={({ pressed }) => [
              styles.send,
              !canSend && styles.sendDisabled,
              pressed && canSend && styles.sendPressed,
            ]}
          >
            {submitting ? (
              <ActivityIndicator color={palette.pureWhite} size="small" />
            ) : (
              <>
                <Ionicons name="send" size={14} color={palette.pureWhite} />
                <AppText weight="bold" style={styles.sendLabel}>
                  {sendLabel}
                </AppText>
              </>
            )}
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    backgroundColor: palette.pureWhite,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: palette.softGold,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  inputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    minHeight: 44,
    borderWidth: 1,
    borderColor: palette.softGold,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    backgroundColor: palette.warmWhite,
  },
  currency: {
    fontSize: 14,
    color: palette.gold,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: palette.charcoal,
    paddingVertical: spacing.sm,
  },
  send: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: 44,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    backgroundColor: palette.gold,
  },
  sendPressed: {
    backgroundColor: palette.goldDark,
  },
  sendDisabled: {
    opacity: 0.4,
  },
  sendLabel: {
    fontSize: 13,
    color: palette.pureWhite,
  },
  submittedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: 44,
  },
  submittedText: {
    fontSize: 14,
    color: palette.charcoal,
  },
  confirmRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  confirm: {
    flex: 1,
    justifyContent: 'center',
  },
  decline: {
    flex: 1,
    minHeight: 44,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: palette.softGold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  declinePressed: {
    backgroundColor: palette.warmWhite,
  },
  declineLabel: {
    fontSize: 13,
    color: palette.charcoal,
  },
});
