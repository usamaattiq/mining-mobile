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
const DEV_AUCTION_MINUTES = 3;
export const ONE_MINUTE_HOURS = DEV_AUCTION_MINUTES / 60;

type DurationSliderProps = {
  value: number;
  onChange: (hours: number) => void;
  label: string;
  /** Development shortcut so a gold auction can end in a few minutes. */
  allowOneMinute?: boolean;
};

function snapToHalfHour(hours: number): number {
  const snapped = Math.round(hours / SLIDER_STEP_HOURS) * SLIDER_STEP_HOURS;
  return Math.min(MAX_HOURS, Math.max(MIN_HOURS, Number(snapped.toFixed(1))));
}

export function formatAuctionDurationLabel(hours: number, t: TFunction): string {
  const wholeHours = Math.floor(hours);
  const minutes = Math.round((hours - wholeHours) * 60);

  if (minutes === 0) {
    if (wholeHours === 1) {
      return t('goldListing.auctionDurationHour');
    }
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
  allowOneMinute = false,
}: DurationSliderProps): React.ReactElement {
  const { t } = useTranslation(undefined, { i18n: appI18n });
  const oneMinute = allowOneMinute && Math.abs(value - ONE_MINUTE_HOURS) < 0.001;
  const safeValue = oneMinute ? value : snapToHalfHour(value);

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
        value={oneMinute ? MIN_HOURS : safeValue}
        onValueChange={(next) => onChange(snapToHalfHour(next))}
        minimumTrackTintColor={palette.gold}
        maximumTrackTintColor={palette.softGold}
        thumbTintColor={palette.gold}
      />

      {allowOneMinute ? (
        <Pressable
          onPress={() => onChange(ONE_MINUTE_HOURS)}
          style={({ pressed }) => [
            styles.minuteButton,
            oneMinute && styles.tickSelected,
            pressed && styles.tickPressed,
          ]}
          accessibilityRole="button"
          accessibilityState={{ selected: oneMinute }}
        >
          <AppText
            weight="bold"
            style={[styles.minuteLabel, oneMinute && styles.tickHoursSelected]}
          >
            {t('goldListing.auctionDurationOneMinute')}
          </AppText>
        </Pressable>
      ) : null}

      <View style={styles.ticks}>
        {TICK_HOURS.map((hour) => {
          const selected = hour === safeValue;
          return (
            <Pressable
              key={hour}
              onPress={() => onChange(hour)}
              style={({ pressed }) => [
                styles.tick,
                selected && styles.tickSelected,
                pressed && styles.tickPressed,
              ]}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              accessibilityLabel={formatAuctionDurationLabel(hour, t)}
            >
              <AppText
                weight="bold"
                style={[styles.tickHours, selected && styles.tickHoursSelected]}
              >
                {hour}
              </AppText>
              <AppText
                weight="semibold"
                style={[styles.tickHrs, selected && styles.tickHrsSelected]}
              >
                {t('goldListing.auctionDurationHrs')}
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
  minuteButton: {
    minHeight: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.warmWhite,
    borderWidth: 1.5,
    borderColor: palette.softGold,
  },
  minuteLabel: {
    fontSize: 15,
    color: palette.charcoal,
  },
  ticks: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  tick: {
    flex: 1,
    flexDirection: 'row',
    minHeight: 56,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    backgroundColor: palette.warmWhite,
    borderWidth: 1.5,
    borderColor: palette.softGold,
  },
  tickSelected: {
    backgroundColor: palette.gold,
    borderColor: palette.goldDark,
  },
  tickPressed: {
    opacity: 0.88,
  },
  tickHours: {
    fontSize: 18,
    color: palette.charcoal,
  },
  tickHoursSelected: {
    color: palette.pureWhite,
  },
  tickHrs: {
    fontSize: 10,
    letterSpacing: 0.4,
    color: palette.muted,
    textTransform: 'lowercase',
  },
  tickHrsSelected: {
    color: palette.pureWhite,
  },
});
