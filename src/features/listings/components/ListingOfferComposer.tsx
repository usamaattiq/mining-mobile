import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { KeyboardStickyView, useKeyboardState } from 'react-native-keyboard-controller';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CounterField } from '@/shared/components/CounterField';
import { KeyboardDoneBar } from '@/shared/components/KeyboardDoneBar';
import { AppText } from '@/shared/components/AppText';
import { PriceTimesUnitsSummary } from '@/features/listings/components/PriceTimesUnitsSummary';
import { useLanguage } from '@/i18n/hooks/useLanguage';
import { formatAmountWithCommas, parsePositiveAmount } from '@/shared/utils/formatAmount';
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
  offerUnits,
  maxUnits,
  unitPricePlaceholder,
  hasOffer,
  leading = false,
  showInput,
  awaitingConfirm,
  submitting,
  sendInline = false,
  fulfillmentModes,
  fulfillmentLabels,
  fulfillmentRentLabel,
  fulfillmentSaleLabel,
  blockedFulfillmentModes,
  offerChoiceLabel,
  onSubmit,
  onConfirm,
  onDecline,
  footer,
}: ListingOfferComposerProps): React.ReactElement {
  const insets = useSafeAreaInsets();
  const priceAccessoryId = React.useId();
  const { currentLanguage } = useLanguage();
  const keyboardVisible = useKeyboardState((state) => state.isVisible);
  const [price, setPrice] = React.useState('');
  const [units, setUnits] = React.useState(1);
  const [fulfillment, setFulfillment] = React.useState<'rent' | 'sale' | 'onsite' | 'online'>(
    fulfillmentModes?.[0] ?? 'sale',
  );
  const unitCap = Math.max(maxUnits ?? 1, 1);
  const blockedModes = React.useMemo(
    () => new Set(blockedFulfillmentModes ?? []),
    [blockedFulfillmentModes],
  );
  React.useEffect(() => {
    setUnits((current) => Math.min(Math.max(current, 1), unitCap));
  }, [unitCap]);
  React.useEffect(() => {
    const open = (fulfillmentModes ?? []).filter((mode) => !blockedModes.has(mode));
    if (open.length === 0) return;
    const next = open[0];
    if (next && !open.includes(fulfillment)) setFulfillment(next);
  }, [blockedModes, fulfillment, fulfillmentModes]);
  const kindBlocked = blockedModes.has(fulfillment);
  const canSend =
    /^\d+(\.\d{1,2})?$/.test(price.trim()) && Number(price) > 0 && !submitting && !kindBlocked;
  const draftUnitAmount = parsePositiveAmount(price);
  const submittedTotal = parsePositiveAmount(offerPrice);
  const submittedUnits = offerUnits != null && offerUnits > 0 ? offerUnits : null;
  const submittedUnitAmount =
    submittedTotal != null && submittedUnits
      ? Math.round((submittedTotal / submittedUnits) * 100) / 100
      : submittedTotal;

  const handleSend = () => {
    const value = price.trim();
    if (!canSend || kindBlocked) return;
    setPrice('');
    onSubmit(
      value,
      maxUnits != null ? units : undefined,
      fulfillmentModes && fulfillmentModes.length > 1 ? fulfillment : fulfillmentModes?.[0],
    );
  };

  return (
    <KeyboardStickyView offset={{ closed: 0, opened: 0 }}>
    <View
      style={[
        styles.bar,
        { paddingBottom: keyboardVisible ? spacing.sm : Math.max(insets.bottom, spacing.md) },
      ]}
    >
      {hasOffer ? (
        <View style={styles.card}>
          <View style={styles.cardPriceRow}>
            <AppText weight="semibold" style={styles.cardTitle} numberOfLines={1}>
              {submittedLabel}
            </AppText>
            {submittedUnitAmount != null && submittedUnits ? (
              <PriceTimesUnitsSummary
                currencyCode={currencyCode}
                unitAmount={submittedUnitAmount}
                units={submittedUnits}
                compact
              />
            ) : offerPrice ? (
              <AppText weight="bold" style={styles.cardPrice}>
                {currencyCode} {formatAmountWithCommas(offerPrice)}
              </AppText>
            ) : null}
            {offerUnitsLabel && !(submittedUnitAmount != null && submittedUnits) ? (
              <AppText style={styles.cardUnits}>· {offerUnitsLabel}</AppText>
            ) : null}
            {offerChoiceLabel ? (
              <AppText style={styles.cardUnits}>{offerChoiceLabel}</AppText>
            ) : null}
            {leading ? <Ionicons name="trophy" size={16} color={palette.gold} /> : null}
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
          {fulfillmentModes && fulfillmentModes.length > 0 ? (
            <View style={styles.fulfillmentRow}>
              {fulfillmentModes.map((mode) => {
                const selected = fulfillment === mode;
                const blocked = blockedModes.has(mode);
                return (
                  <Pressable
                    key={mode}
                    onPress={() => setFulfillment(mode)}
                    disabled={blocked}
                    accessibilityState={{ disabled: blocked, selected }}
                    style={[
                      styles.fulfillmentChip,
                      selected && !blocked && styles.fulfillmentChipSelected,
                      blocked && styles.fulfillmentChipDisabled,
                    ]}
                  >
                    <AppText
                      weight="semibold"
                      style={[
                        styles.fulfillmentLabel,
                        selected && !blocked && styles.fulfillmentLabelSelected,
                        blocked && styles.fulfillmentLabelDisabled,
                      ]}
                    >
                      {fulfillmentLabels?.[mode] ??
                        (mode === 'rent' ? fulfillmentRentLabel : fulfillmentSaleLabel)}
                    </AppText>
                  </Pressable>
                );
              })}
            </View>
          ) : null}
          <View style={styles.row}>
            {maxUnits != null ? (
              <View style={sendInline ? styles.unitsWrapInline : styles.unitsWrap}>
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
                inputAccessoryViewID={priceAccessoryId}
                editable={!submitting}
                style={[styles.input, { fontFamily: getFontFamily(currentLanguage) }]}
              />
            </View>
            {sendInline ? (
              <Pressable
                onPress={handleSend}
                disabled={!canSend}
                accessibilityRole="button"
                accessibilityLabel={sendLabel}
                style={({ pressed }) => [
                  styles.send,
                  styles.sendInline,
                  !canSend && styles.sendDisabled,
                  pressed && canSend && styles.sendPressed,
                ]}
              >
                {submitting ? (
                  <ActivityIndicator color={palette.pureWhite} size="small" />
                ) : (
                  <Ionicons name="send" size={16} color={palette.pureWhite} />
                )}
              </Pressable>
            ) : null}
          </View>
          <KeyboardDoneBar nativeID={priceAccessoryId} />
          {draftUnitAmount != null && maxUnits != null ? (
            <PriceTimesUnitsSummary
              currencyCode={currencyCode}
              unitAmount={draftUnitAmount}
              units={units}
              compact
            />
          ) : null}
          {sendInline ? null : (
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
          )}
        </View>
      ) : null}

      {sendInline || !showInput ? footer : null}
    </View>
    </KeyboardStickyView>
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
  cardTitle: {
    flex: 1,
    fontSize: 13,
    color: palette.muted,
    justifyContent: 'space-between',
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
  unitsWrapInline: {
    width: 128,
    flexShrink: 0,
  },
  sendInline: {
    width: 44,
    paddingHorizontal: 0,
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
  fulfillmentRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  fulfillmentChip: {
    flex: 1,
    minHeight: 36,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: palette.softGold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fulfillmentChipSelected: {
    backgroundColor: palette.gold,
    borderColor: palette.gold,
  },
  fulfillmentChipDisabled: {
    opacity: 0.4,
    backgroundColor: palette.softGold,
  },
  fulfillmentLabel: {
    fontSize: 13,
    color: palette.charcoal,
  },
  fulfillmentLabelSelected: {
    color: palette.pureWhite,
  },
  fulfillmentLabelDisabled: {
    color: palette.muted,
  },
});
