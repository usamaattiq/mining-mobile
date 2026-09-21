import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { i18n as appI18n } from '@/i18n';
import { CounterField } from '@/shared/components/CounterField';
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
  offerUnitsLabel,
  maxUnits,
  unitPricePlaceholder,
  hasOffer,
  showInput,
  awaitingConfirm,
  submitting,
  onSubmit,
  onConfirm,
  onDecline,
  footer,
}: ListingOfferComposerProps): React.ReactElement {
  const { t } = useTranslation(undefined, { i18n: appI18n });
  const insets = useSafeAreaInsets();
  const { currentLanguage } = useLanguage();
  const [price, setPrice] = React.useState('');
  const [units, setUnits] = React.useState(1);
  const unitCap = Math.max(maxUnits ?? 1, 1);
  React.useEffect(() => {
    setUnits((current) => Math.min(Math.max(current, 1), unitCap));
  }, [unitCap]);
  const canSend = /^\d+(\.\d{1,2})?$/.test(price.trim()) && Number(price) > 0 && !submitting;
  const totalPrice =
    canSend && maxUnits != null
      ? (Math.round(Number(price) * units * 100) / 100).toFixed(2)
      : null;

  const handleSend = () => {
    const value = price.trim();
    if (!canSend) return;
    setPrice('');
    onSubmit(value, maxUnits != null ? units : undefined);
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
              <View style={styles.cardPriceRow}>
                <AppText weight="bold" style={styles.cardPrice}>
                  {currencyCode} {formatAmountWithCommas(offerPrice)}
                </AppText>
                {offerUnitsLabel ? (
                  <AppText style={styles.cardUnits}>· {offerUnitsLabel}</AppText>
                ) : null}
              </View>
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
          ) : null}
        </View>
      ) : null}

      {showInput ? (
        <View style={styles.form}>
          <View style={styles.row}>
            {maxUnits != null ? (
              <View style={styles.unitsWrap}>
                <CounterField
                  value={units}
                  onChange={setUnits}
                  min={1}
                  max={unitCap}
                  required
                />
              </View>
            ) : null}
            <View style={styles.inputWrap}>
              <AppText weight="semibold" style={styles.currency}>
                {currencyCode}
              </AppText>
              <TextInput
                value={price}
                onChangeText={setPrice}
                placeholder={unitPricePlaceholder ?? placeholder}
                placeholderTextColor={palette.muted}
                keyboardType="decimal-pad"
                editable={!submitting}
                style={[styles.input, { fontFamily: getFontFamily(currentLanguage) }]}
              />
            </View>
          </View>
          <View style={styles.actions}>
            {footer ? <View style={styles.actionButton}>{footer}</View> : null}
            <Pressable
              onPress={handleSend}
              disabled={!canSend}
              accessibilityRole="button"
              accessibilityLabel={sendLabel}
              style={({ pressed }) => [
                styles.send,
                styles.actionButton,
                !canSend && styles.sendDisabled,
                pressed && canSend && styles.sendPressed,
              ]}
            >
              {submitting ? (
                <ActivityIndicator color={palette.pureWhite} size="small" />
              ) : (
                <>
                  <Ionicons name="send" size={14} color={palette.pureWhite} />
                  <AppText weight="bold" style={styles.sendLabel} numberOfLines={1}>
                    {sendLabel}
                  </AppText>
                </>
              )}
            </Pressable>
          </View>
          {totalPrice ? (
            <AppText weight="semibold" style={styles.total}>
              {t('rfq.offerTotal', {
                amount: `${currencyCode} ${formatAmountWithCommas(totalPrice)}`,
              })}
            </AppText>
          ) : null}
        </View>
      ) : null}

      {!showInput ? footer : null}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    backgroundColor: palette.warmWhite,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: palette.softGold,
    gap: spacing.sm,
  },
  card: {
    backgroundColor: palette.warmWhite,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: palette.softGold,
    padding: spacing.sm + 2,
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
  cardPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.xs,
    flexShrink: 1,
  },
  cardUnits: {
    fontSize: 12,
    color: palette.muted,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  unitsWrap: {
    flex: 1,
    maxWidth: 168,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
  },
  form: {
    gap: spacing.sm,
  },
  total: {
    fontSize: 13,
    color: palette.gold,
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
    backgroundColor: palette.pureWhite,
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
    justifyContent: 'center',
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
