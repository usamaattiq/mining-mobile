import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '@/shared/components/AppText';
import { useLanguage } from '@/i18n/hooks/useLanguage';
import { formatAmountWithCommas } from '@/shared/utils/formatAmount';
import { getFontFamily, palette, radius, spacing } from '@/theme';
import type { ListingOfferComposerProps } from '@/features/listings/types/listingOfferComposer.types';

export function ListingOfferComposer({
  currencyCode,
  placeholder,
  sendLabel,
  submittedLabel,
  confirmLabel,
  declineLabel,
  offerPrice,
  hasOffer,
  showInput,
  awaitingConfirm,
  canWithdraw,
  submitting,
  withdrawLabel,
  onSubmit,
  onConfirm,
  onDecline,
  onWithdraw,
  footer,
}: ListingOfferComposerProps): React.ReactElement {
  const insets = useSafeAreaInsets();
  const { currentLanguage } = useLanguage();
  const [price, setPrice] = React.useState('');
  const canSend = /^\d+(\.\d{1,2})?$/.test(price.trim()) && Number(price) > 0 && !submitting;

  const handleSend = () => {
    const value = price.trim();
    if (!canSend) return;
    setPrice('');
    onSubmit(value);
  };

  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
      {hasOffer ? (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <AppText weight="semibold" style={styles.cardTitle} numberOfLines={1}>
              {submittedLabel}
            </AppText>
            {offerPrice ? (
              <AppText weight="bold" style={styles.cardPrice}>
                {currencyCode} {formatAmountWithCommas(offerPrice)}
              </AppText>
            ) : null}
          </View>

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
          ) : canWithdraw && onWithdraw ? (
            <Pressable
              onPress={onWithdraw}
              disabled={submitting}
              accessibilityRole="button"
              accessibilityLabel={withdrawLabel}
              style={({ pressed }) => [
                styles.withdraw,
                submitting && styles.sendDisabled,
                pressed && !submitting && styles.declinePressed,
              ]}
            >
              <AppText weight="semibold" style={styles.withdrawLabel}>
                {withdrawLabel}
              </AppText>
            </Pressable>
          ) : null}
        </View>
      ) : null}

      {showInput ? (
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
            onPress={handleSend}
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
      ) : null}

      {footer}
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
    gap: spacing.sm,
  },
  card: {
    backgroundColor: palette.warmWhite,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: palette.softGold,
    padding: spacing.md,
    gap: spacing.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  cardTitle: {
    flex: 1,
    fontSize: 13,
    color: palette.muted,
  },
  cardPrice: {
    fontSize: 18,
    color: palette.charcoal,
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
  withdraw: {
    alignSelf: 'flex-start',
    minHeight: 36,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: palette.softGold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  withdrawLabel: {
    fontSize: 12,
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
    backgroundColor: palette.pureWhite,
  },
  declineLabel: {
    fontSize: 13,
    color: palette.charcoal,
  },
});
