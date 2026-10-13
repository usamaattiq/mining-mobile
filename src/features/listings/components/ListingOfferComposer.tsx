import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { KeyboardStickyView, useKeyboardState } from 'react-native-keyboard-controller';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CounterField } from '@/shared/components/CounterField';
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
  offerSentAt,
  offerUnitsLabel,
  offerUnits,
  maxUnits,
  unitPricePlaceholder,
  hasOffer,
  leading = false,
  showInput,
  awaitingConfirm,
  submitting,
  offerTypeLabel,
  fulfillmentModes,
  fulfillmentLabels,
  fulfillmentRentLabel,
  fulfillmentSaleLabel,
  blockedFulfillmentModes,
  offerChoiceLabel,
  handoverModes,
  handoverLabels,
  handoverTitle,
  onSubmit,
  onConfirm,
  onDecline,
  footer,
}: ListingOfferComposerProps): React.ReactElement {
  const insets = useSafeAreaInsets();
  const { currentLanguage } = useLanguage();
  const keyboardVisible = useKeyboardState((state) => state.isVisible);
  const [price, setPrice] = React.useState('');
  const [units, setUnits] = React.useState(1);
  const [fulfillment, setFulfillment] = React.useState<'rent' | 'sale' | 'onsite' | 'online'>(
    fulfillmentModes?.[0] ?? 'sale',
  );
  const [handover, setHandover] = React.useState<'pickup' | 'delivery'>('pickup');
  React.useEffect(() => {
    if (handoverModes && !handoverModes.includes(handover)) setHandover('pickup');
  }, [handover, handoverModes]);
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
      fulfillmentModes && fulfillmentModes.length > 0 ? fulfillment : undefined,
      handoverModes && handoverModes.length > 0 ? handover : undefined,
    );
  };

  if (!hasOffer && !showInput && !footer) return <></>;

  return (
    <KeyboardStickyView offset={{ closed: 0, opened: 0 }}>
      <View
        style={[
          showInput ? styles.bar : styles.barPlain,
          { paddingBottom: keyboardVisible ? spacing.sm : Math.max(insets.bottom, spacing.md) },
        ]}
      >
        {hasOffer ? (
          <View style={styles.card}>
            <View style={styles.cardPriceRow}>
              <View style={styles.cardTitleBlock}>
                <AppText weight="semibold" style={styles.cardTitle}>
                  {submittedLabel}
                </AppText>
                {offerSentAt ? (
                  <AppText style={styles.cardDate} numberOfLines={1}>
                    {new Intl.DateTimeFormat(currentLanguage, {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    }).format(new Date(offerSentAt))}
                  </AppText>
                ) : null}
              </View>
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
            {fulfillmentModes && fulfillmentModes.length > 1 ? (
              <View style={styles.fulfillmentBlock}>
                {offerTypeLabel ? (
                  <AppText weight="semibold" style={styles.fulfillmentHeading}>
                    {offerTypeLabel}
                  </AppText>
                ) : null}
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
                          numberOfLines={1}
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
              </View>
            ) : null}
            {handoverModes && handoverModes.length > 1 ? (
              <View style={styles.handoverBlock}>
                {handoverTitle ? (
                  <AppText weight="bold" style={styles.handoverTitle}>
                    {handoverTitle}
                  </AppText>
                ) : null}
                <View style={styles.handoverRow}>
                  {handoverModes.map((mode) => {
                    const selected = handover === mode;
                    return (
                      <Pressable
                        key={mode}
                        onPress={() => setHandover(mode)}
                        accessibilityRole="radio"
                        accessibilityState={{ selected }}
                        style={[styles.handoverOption, selected && styles.handoverOptionSelected]}
                      >
                        <View style={[styles.radioOuter, selected && styles.radioOuterSelected]}>
                          {selected ? <View style={styles.radioInner} /> : null}
                        </View>
                        <MaterialCommunityIcons
                          name={mode === 'delivery' ? 'truck-fast' : 'package-variant-closed'}
                          size={20}
                          color={selected ? palette.gold : palette.muted}
                        />
                        <AppText
                          weight={selected ? 'semibold' : 'regular'}
                          numberOfLines={1}
                          style={[styles.handoverLabel, selected && styles.handoverLabelSelected]}
                        >
                          {handoverLabels?.[mode] ?? mode}
                        </AppText>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            ) : null}
            <View style={styles.row}>
              {maxUnits != null ? (
                <View style={styles.unitsWrapInline}>
                  <CounterField value={units} onChange={setUnits} min={1} max={unitCap} required />
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
            </View>
            {draftUnitAmount != null && maxUnits != null ? (
              <PriceTimesUnitsSummary
                currencyCode={currencyCode}
                unitAmount={draftUnitAmount}
                units={units}
                compact
              />
            ) : null}
          </View>
        ) : null}

        {footer}
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
  barPlain: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    backgroundColor: palette.pureWhite,
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
  cardTitleBlock: {
    flex: 1,
    gap: 2,
  },
  cardDate: {
    fontSize: 12,
    color: palette.muted,
  },
  cardTitle: {
    fontSize: 13,
    lineHeight: 18,
    color: palette.muted,
  },
  cardPrice: {
    fontSize: 18,
    color: palette.charcoal,
  },
  cardPriceRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
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
  unitsWrapInline: {
    width: 128,
    flexShrink: 0,
  },
  sendInline: {
    width: 44,
    paddingHorizontal: 0,
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
    flexShrink: 0,
    fontSize: 14,
    color: palette.gold,
  },
  input: {
    flex: 1,
    minWidth: 0,
    fontSize: 16,
    color: palette.charcoal,
    paddingVertical: 0,
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
  fulfillmentBlock: {
    gap: spacing.xs,
  },
  fulfillmentHeading: {
    fontSize: 13,
    color: palette.charcoal,
  },
  fulfillmentRow: {
    flexDirection: 'row',
    gap: spacing.xs,
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
  handoverBlock: {
    gap: spacing.sm,
  },
  handoverTitle: {
    fontSize: 14,
    color: palette.charcoal,
  },
  handoverRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  handoverOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    minHeight: 44,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: '#E7E1D6',
    backgroundColor: palette.warmWhite,
  },
  handoverOptionSelected: {
    borderColor: palette.gold,
    backgroundColor: '#FFF9EE',
  },
  radioOuter: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: palette.muted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterSelected: {
    borderColor: palette.gold,
  },
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: palette.gold,
  },
  handoverLabel: {
    flex: 1,
    fontSize: 14,
    color: palette.charcoal,
  },
  handoverLabelSelected: {
    color: palette.charcoal,
  },
});
