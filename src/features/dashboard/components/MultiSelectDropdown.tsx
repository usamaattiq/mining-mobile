import React from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/shared/components/AppText';
import { palette, radius, spacing } from '@/theme';

type MultiSelectOption = {
  key: string;
  label: string;
};

type MultiSelectDropdownProps = {
  label: string;
  placeholder: string;
  options: MultiSelectOption[];
  values: string[];
  onChange: (values: string[]) => void;
};

export function MultiSelectDropdown({
  label,
  placeholder,
  options,
  values,
  onChange,
}: MultiSelectDropdownProps): React.ReactElement {
  const [open, setOpen] = React.useState(false);
  const [anchor, setAnchor] = React.useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);
  const triggerRef = React.useRef<View>(null);

  const selected = options.filter((option) => values.includes(option.key));

  const toggle = (key: string) => {
    if (values.includes(key)) {
      onChange(values.filter((item) => item !== key));
      return;
    }
    onChange([...values, key]);
    setOpen(false);
  };

  const remove = (key: string) => {
    onChange(values.filter((item) => item !== key));
  };

  const handleOpen = () => {
    triggerRef.current?.measureInWindow((x, y, width, height) => {
      setAnchor({ x, y, width, height });
      setOpen(true);
    });
  };

  return (
    <View style={styles.container}>
      <AppText weight="semibold" style={styles.label}>
        {label}
      </AppText>
      <View ref={triggerRef} collapsable={false}>
        <Pressable
          onPress={handleOpen}
          style={styles.trigger}
          accessibilityRole="button"
          accessibilityLabel={label}
        >
          <AppText style={[styles.triggerText, styles.placeholder]} numberOfLines={1}>
            {placeholder}
          </AppText>
          <Ionicons name="chevron-down" size={18} color={palette.muted} />
        </Pressable>
      </View>

      {selected.length > 0 ? (
        <View style={styles.chipRow}>
          {selected.map((option) => (
            <Pressable
              key={option.key}
              onPress={() => remove(option.key)}
              accessibilityRole="button"
              accessibilityLabel={option.label}
              style={({ pressed }) => [styles.chip, pressed && styles.pressed]}
            >
              <AppText style={styles.chipText}>{option.label}</AppText>
              <Ionicons name="close" size={14} color={palette.gold} />
            </Pressable>
          ))}
        </View>
      ) : null}

      <Modal
        visible={open}
        transparent
        animationType="fade"
        statusBarTranslucent
        navigationBarTranslucent
        onRequestClose={() => setOpen(false)}
      >
        <View style={styles.modalRoot}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setOpen(false)} />
          {anchor ? (
            <View
              style={[
                styles.menu,
                { top: anchor.y + anchor.height + 4, left: anchor.x, width: anchor.width },
              ]}
            >
              <ScrollView
                keyboardShouldPersistTaps="handled"
                nestedScrollEnabled
                style={styles.menuScroll}
              >
                {options.map((option) => {
                  const selected = values.includes(option.key);
                  return (
                    <Pressable
                      key={option.key}
                      onPress={() => toggle(option.key)}
                      style={({ pressed }) => [
                        styles.option,
                        selected && styles.optionSelected,
                        pressed && styles.pressed,
                      ]}
                    >
                      <AppText weight="medium" style={styles.optionLabel}>
                        {option.label}
                      </AppText>
                      {selected ? (
                        <Ionicons name="checkmark" size={16} color={palette.gold} />
                      ) : null}
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>
          ) : null}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
    marginTop: spacing.md,
  },
  label: {
    fontSize: 13,
    color: palette.muted,
  },
  trigger: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: palette.softGold,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    backgroundColor: palette.pureWhite,
  },
  triggerText: {
    flex: 1,
    fontSize: 15,
    color: palette.charcoal,
  },
  placeholder: {
    color: palette.muted,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: palette.softGold,
    backgroundColor: palette.pureWhite,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  chipText: {
    fontSize: 13,
    color: palette.gold,
  },
  modalRoot: {
    flex: 1,
  },
  menu: {
    position: 'absolute',
    maxHeight: 240,
    backgroundColor: palette.pureWhite,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: palette.softGold,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
    overflow: 'hidden',
  },
  menuScroll: {
    maxHeight: 240,
  },
  option: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  optionSelected: {
    backgroundColor: palette.softGold,
  },
  optionLabel: {
    flex: 1,
    fontSize: 15,
    color: palette.charcoal,
  },
  pressed: {
    opacity: 0.88,
  },
});
