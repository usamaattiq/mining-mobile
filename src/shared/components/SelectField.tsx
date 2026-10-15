import React from 'react';
import { Modal, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { i18n as appI18n } from '@/i18n';
import { useLanguage } from '@/i18n/hooks/useLanguage';
import { AppText } from '@/shared/components/AppText';
import { AppBottomSheet } from '@/shared/components/AppBottomSheet';
import { palette, radius, spacing, getFontFamily } from '@/theme';
import type { SelectFieldProps } from '@/shared/types/selectField.types';

/**
 * Dropdown-style field: a FormInput-shaped trigger that opens a list of options.
 * Defaults to a bottom sheet; pass `dropdown` for a compact popover anchored under the trigger.
 */
export function SelectField({
  label,
  placeholder,
  sheetTitle,
  options,
  value,
  onChange,
  required,
  error,
  searchable,
  searchPlaceholder,
  compact,
  dropdown,
  tallWhenMany,
}: SelectFieldProps): React.ReactElement {
  const { t } = useTranslation(undefined, { i18n: appI18n });
  const { currentLanguage } = useLanguage();
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState('');
  const [expanded, setExpanded] = React.useState<Set<string>>(new Set());
  const [anchor, setAnchor] = React.useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);
  const triggerRef = React.useRef<View>(null);
  const selectedOption = options.find((option) => option.value === value);

  const hierarchical = options.some((option) => option.parentValue);
  const searching = searchable && query.trim().length > 0;
  const filteredOptions = searchable
    ? options.filter((option) => option.label.toLowerCase().includes(query.trim().toLowerCase()))
    : options;

  const visibleOptions = React.useMemo(() => {
    if (!hierarchical || searching || dropdown) {
      return filteredOptions.map((option) => ({ ...option, depth: 0, hasChildren: false }));
    }
    const childrenOf = new Map<string | null, SelectFieldProps['options']>();
    for (const option of options) {
      const parent = option.parentValue ?? null;
      const list = childrenOf.get(parent);
      if (list) list.push(option);
      else childrenOf.set(parent, [option]);
    }
    const rows: Array<(typeof options)[number] & { depth: number; hasChildren: boolean }> = [];
    const walk = (parent: string | null, depth: number) => {
      for (const option of childrenOf.get(parent) ?? []) {
        const kids = childrenOf.get(option.value) ?? [];
        rows.push({ ...option, depth, hasChildren: kids.length > 0 });
        if (kids.length > 0 && expanded.has(option.value)) walk(option.value, depth + 1);
      }
    };
    walk(null, 0);
    return rows;
  }, [hierarchical, searching, dropdown, filteredOptions, options, expanded]);

  React.useEffect(() => {
    if (!open || !hierarchical) return;
    setExpanded(
      new Set(
        options
          .filter((option) => options.some((child) => child.parentValue === option.value))
          .map((option) => option.value),
      ),
    );
  }, [open, hierarchical, options]);

  const handleSelect = (next: string) => {
    onChange(next);
    setOpen(false);
    setQuery('');
  };

  const handleOpen = () => {
    if (dropdown) {
      triggerRef.current?.measureInWindow((x, y, width, height) => {
        setAnchor({ x, y, width, height });
        setOpen(true);
      });
      return;
    }
    setOpen(true);
  };

  const optionList = visibleOptions.map((option) => {
    const selected = option.value === value;
    return (
      <Pressable
        key={option.value}
        onPress={() => handleSelect(option.value)}
        style={({ pressed }) => [
          styles.option,
          dropdown && styles.optionCompact,
          selected && styles.optionSelected,
          pressed && styles.pressed,
          option.depth > 0 && { paddingStart: spacing.md + option.depth * 16 },
        ]}
      >
        {option.hasChildren ? (
          <Pressable
            onPress={() =>
              setExpanded((current) => {
                const next = new Set(current);
                if (next.has(option.value)) next.delete(option.value);
                else next.add(option.value);
                return next;
              })
            }
            hitSlop={6}
          >
            <Ionicons
              name={expanded.has(option.value) ? 'chevron-down' : 'chevron-forward'}
              size={16}
              color={palette.gold}
            />
          </Pressable>
        ) : hierarchical && !dropdown && !searching ? (
          <View style={styles.expandSpacer} />
        ) : null}
        {option.icon ? (
          <View style={styles.optionIconWrap}>
            <Ionicons name={option.icon} size={18} color={palette.gold} />
          </View>
        ) : null}
        <AppText
          weight="medium"
          style={[styles.optionLabel, dropdown && styles.optionLabelCompact]}
        >
          {option.label}
        </AppText>
        {selected ? <Ionicons name="checkmark" size={16} color={palette.gold} /> : null}
      </Pressable>
    );
  });

  return (
    <View style={styles.container}>
      {label ? (
        <AppText weight="semibold" style={styles.label}>
          {label}
          {required ? <AppText style={styles.required}> *</AppText> : null}
        </AppText>
      ) : null}
      <View ref={triggerRef} collapsable={false}>
        <Pressable
          onPress={handleOpen}
          style={[
            styles.trigger,
            compact && styles.triggerCompact,
            error ? styles.triggerError : null,
          ]}
          accessibilityRole="button"
          accessibilityLabel={label ?? placeholder}
        >
          {selectedOption?.icon ? (
            <View style={styles.triggerIconWrap}>
              <Ionicons name={selectedOption.icon} size={16} color={palette.gold} />
            </View>
          ) : null}
          <AppText
            style={[
              styles.triggerText,
              compact && styles.triggerTextCompact,
              !selectedOption && styles.triggerPlaceholder,
            ]}
            numberOfLines={1}
          >
            {selectedOption?.label ?? placeholder}
          </AppText>
          <Ionicons name="chevron-down" size={compact ? 14 : 18} color={palette.muted} />
        </Pressable>
      </View>
      {error ? <AppText style={styles.error}>{error}</AppText> : null}

      {dropdown ? (
        <Modal
          visible={open}
          transparent
          animationType="fade"
          statusBarTranslucent
          navigationBarTranslucent
          onRequestClose={() => setOpen(false)}
        >
          <Pressable style={styles.dropdownBackdrop} onPress={() => setOpen(false)}>
            {anchor ? (
              <View
                style={[
                  styles.dropdownMenu,
                  { top: anchor.y + anchor.height + 4, left: anchor.x, minWidth: anchor.width },
                ]}
              >
                {optionList}
              </View>
            ) : null}
          </Pressable>
        </Modal>
      ) : (
        <AppBottomSheet
          visible={open}
          onClose={() => setOpen(false)}
          heightRatio={
            searchable || hierarchical ? (tallWhenMany && options.length > 3 ? 0.54 : 0.38) : 0.62
          }
          fitContent={!searchable && !hierarchical}
        >
          <AppText weight="bold" style={styles.sheetTitle}>
            {sheetTitle}
          </AppText>

          {searchable ? (
            <View style={styles.searchRow}>
              <Ionicons name="search-outline" size={18} color={palette.muted} />
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder={searchPlaceholder ?? t('common.search')}
                placeholderTextColor={palette.muted}
                style={[styles.searchInput, { fontFamily: getFontFamily(currentLanguage) }]}
              />
              {query ? (
                <Pressable onPress={() => setQuery('')} hitSlop={8}>
                  <Ionicons name="close-circle" size={18} color={palette.muted} />
                </Pressable>
              ) : null}
            </View>
          ) : null}

          {searchable ? (
            <KeyboardAwareScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              bottomOffset={96}
              disableScrollOnKeyboardHide
              extraKeyboardSpace={0}
            >
              {optionList}
            </KeyboardAwareScrollView>
          ) : (
            <View>{optionList}</View>
          )}
        </AppBottomSheet>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
  },
  label: {
    fontSize: 13,
    color: palette.charcoal,
  },
  required: {
    fontSize: 13,
    color: palette.danger,
  },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: palette.softGold,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
    minHeight: 52,
  },
  triggerCompact: {
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 0,
    minHeight: 52,
    height: 52,
  },
  triggerError: {
    borderColor: palette.danger,
  },
  triggerIconWrap: {
    width: 28,
    height: 28,
    borderRadius: radius.sm,
    backgroundColor: palette.softGold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  triggerText: {
    flex: 1,
    fontSize: 15,
    color: palette.charcoal,
  },
  triggerTextCompact: {
    fontSize: 13,
  },
  triggerPlaceholder: {
    color: palette.muted,
  },
  error: {
    fontSize: 12,
    color: palette.danger,
  },
  sheetTitle: {
    fontSize: 16,
    color: palette.charcoal,
    textAlign: 'center',
    marginBottom: spacing.sm,
    paddingVertical: spacing.sm,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: palette.softGold,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: spacing.sm + 4,
    fontSize: 15,
    color: palette.charcoal,
    textAlignVertical: 'center',
  },
  option: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  expandSpacer: { width: 16 },
  optionCompact: {
    minHeight: 0,
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.sm,
  },
  optionSelected: {
    backgroundColor: palette.softGold,
  },
  optionIconWrap: {
    width: 24,
    height: 24,
    borderRadius: radius.sm,
    backgroundColor: palette.softGold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionLabel: {
    flex: 1,
    fontSize: 15,
    color: palette.charcoal,
  },
  optionLabelCompact: {
    fontSize: 13,
  },
  pressed: {
    opacity: 0.88,
  },
  dropdownBackdrop: {
    flex: 1,
  },
  dropdownMenu: {
    position: 'absolute',
    backgroundColor: palette.pureWhite,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: palette.softGold,
    // paddingVertical: spacing.xs,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
});
