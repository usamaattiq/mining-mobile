import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Slider from '@react-native-community/slider';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { i18n as appI18n } from '@/i18n';
import { AppText } from '@/shared/components/AppText';
import { palette, radius, spacing } from '@/theme';

const MIN_HOURS = 0.5;
const MAX_HOURS = 24;
const SLIDER_STEP_HOURS = 0.5;
const TICK_HOURS = [6, 12, 18, 24];

type DurationSliderProps = {
  value: number;
  onChange: (hours: number) => void;
  label: string;
};

function snapToHalfHour(hours: number): number {
  const snapped = Math.round(hours / SLIDER_STEP_HOURS) * SLIDER_STEP_HOURS;
  return Math.min(MAX_HOURS, Math.max(MIN_HOURS, Number(snapped.toFixed(1))));
}

export function formatAuctionDurationLabel(hours: number, t: TFunction): string {
  const wholeHours = Math.floor(hours);
  const minutes = Math.round((hours - wholeHours) * 60);

  if (minutes === 0) {
    return t('goldListing.auctionDurationHours', { count: wholeHours });
  }
  if (wholeHours === 0) {
    return t('goldListing.auctionDurationMinutes', { count: minutes });
  }
  return t('goldListing.auctionDurationHoursMinutes', {
    hours: wholeHours,
    minutes,
  });
}

export function DurationSlider({
  value,
  onChange,
  label,
}: DurationSliderProps): React.ReactElement {
  const { t } = useTranslation(undefined, { i18n: appI18n });
  const safeValue = snapToHalfHour(value);

  return (
    <View style={styles.wrap}>
      <AppText weight="semibold" style={styles.label}>
        {label}
      </AppText>
      <AppText weight="semibold" style={styles.value}>
        {formatAuctionDurationLabel(safeValue, t)}
      </AppText>

      <Slider
        style={styles.slider}
        minimumValue={MIN_HOURS}
        maximumValue={MAX_HOURS}
        step={SLIDER_STEP_HOURS}
        value={safeValue}
        onValueChange={(next) => onChange(snapToHalfHour(next))}
        minimumTrackTintColor={palette.gold}
        maximumTrackTintColor={palette.softGold}
        thumbTintColor={palette.gold}
      />

      <View style={styles.ticks}>
        {TICK_HOURS.map((hour) => {
          const selected = hour === safeValue;
          return (
            <Pressable
              key={hour}
              onPress={() => onChange(hour)}
              style={[styles.tick, selected && styles.tickSelected]}
              hitSlop={4}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              accessibilityLabel={formatAuctionDurationLabel(hour, t)}
            >
              <AppText
                weight={selected ? 'semibold' : 'medium'}
                style={[styles.tickLabel, selected && styles.tickLabelSelected]}
              >
                {hour}
              </AppText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.xs,
  },
  label: {
    fontSize: 13,
    color: palette.charcoal,
  },
  value: {
    fontSize: 15,
    color: palette.gold,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  ticks: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  tick: {
    minWidth: 44,
    height: 36,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.softGold,
  },
  tickSelected: {
    backgroundColor: palette.gold,
  },
  tickLabel: {
    fontSize: 13,
    color: palette.charcoal,
  },
  tickLabelSelected: {
    color: palette.pureWhite,
  },
});
