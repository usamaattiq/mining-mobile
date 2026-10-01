import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { i18n as appI18n } from '@/i18n';
import { GoldSheetScreen } from '@/features/dashboard/components/GoldSheetScreen';
import { adminApi, type AdminCategoryItem } from '@/features/admin/api/adminApi';
import { SegmentedSwitcher } from '@/shared/components/SegmentedSwitcher';
import { SearchField } from '@/shared/components/SearchField';
import { AppBottomSheet } from '@/shared/components/AppBottomSheet';
import { FormInput } from '@/shared/components/FormInput';
import { Button } from '@/shared/components/Button';
import { EmptyState } from '@/shared/components/EmptyState';
import { AppText } from '@/shared/components/AppText';
import { showAppAlert } from '@/shared/services/appAlert';
import { palette, radius, spacing } from '@/theme';

type CategoryKey = AdminCategoryItem['key'];

export function AdminCategoriesScreen(): React.ReactElement {
  const { t } = useTranslation(undefined, { i18n: appI18n });
  const [items, setItems] = React.useState<AdminCategoryItem[]>([]);
  const [domain, setDomain] = React.useState<CategoryKey>('equipment');
  const [query, setQuery] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const [draft, setDraft] = React.useState<{ id: string | null; name: string } | null>(null);
  const [saving, setSaving] = React.useState(false);

  const load = React.useCallback(async () => {
    const result = await adminApi.categories();
    setItems(result.items);
  }, []);

  React.useEffect(() => {
    void load()
      .catch(() => showAppAlert(t('admin.loadFailed')))
      .finally(() => setLoading(false));
  }, [load, t]);

  const labels = items.find((item) => item.key === domain)?.labels ?? [];
  const visible = labels.filter((label) =>
    label.name.toLowerCase().includes(query.trim().toLowerCase()),
  );

  const saveDraft = async () => {
    if (!draft?.name.trim()) return;
    setSaving(true);
    try {
      if (draft.id) await adminApi.renameCategory(draft.id, draft.name.trim());
      else await adminApi.createCategory(domain, draft.name.trim());
      setDraft(null);
      await load();
    } catch {
      showAppAlert(t('profile.saveError'));
    } finally {
      setSaving(false);
    }
  };

  const removeLabel = (id: string, name: string) => {
    showAppAlert(t('admin.deleteLabel'), name, [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.confirm'),
        style: 'destructive',
        onPress: () => {
          void adminApi.deleteCategory(id).then(() => load());
        },
      },
    ]);
  };

  return (
    <>
      <GoldSheetScreen
        title={t('tabs.categories')}
        titleAlign="left"
        titleSize="lg"
        headerStyle={styles.header}
        rightSlot={
          <Pressable
            onPress={() => setDraft({ id: null, name: '' })}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={t('admin.addLabel')}
            style={styles.headerAdd}
          >
            <Ionicons name="add" size={22} color={palette.pureWhite} />
          </Pressable>
        }
        headerExtra={
          <View style={styles.switcherWrap}>
            <SegmentedSwitcher
              value={domain}
              onChange={(next) => {
                setDomain(next);
                setQuery('');
              }}
              options={[
                { key: 'equipment', label: t('requests.categoryEquipment') },
                { key: 'services', label: t('requests.categoryServices') },
                { key: 'gold', label: t('requests.categoryGold') },
              ]}
            />
          </View>
        }
      >
        <View style={styles.body}>
          <SearchField value={query} onChangeText={setQuery} placeholder={t('admin.searchTypes')} />
          {loading ? (
            <ActivityIndicator color={palette.gold} style={styles.loader} />
          ) : visible.length === 0 ? (
            <EmptyState title={t('admin.emptyCategory')} subtitle={t('admin.addLabel')} />
          ) : (
            <View style={styles.card}>
              {visible.map((label, index) => (
                <View
                  key={label.id}
                  style={[styles.row, index < visible.length - 1 && styles.rowDivider]}
                >
                  <Ionicons name="pricetag-outline" size={16} color={palette.gold} />
                  <AppText weight="semibold" style={styles.name} numberOfLines={1}>
                    {label.name}
                  </AppText>
                  <Pressable
                    onPress={() => setDraft({ id: label.id, name: label.name })}
                    hitSlop={8}
                    style={styles.action}
                  >
                    <Ionicons name="create-outline" size={20} color={palette.muted} />
                  </Pressable>
                  <Pressable onPress={() => removeLabel(label.id, label.name)} hitSlop={8} style={styles.action}>
                    <Ionicons name="trash-outline" size={20} color={palette.danger} />
                  </Pressable>
                </View>
              ))}
            </View>
          )}
        </View>
      </GoldSheetScreen>

      <AppBottomSheet visible={draft !== null} onClose={() => setDraft(null)} fitContent>
        <AppText weight="bold" style={styles.sheetTitle}>
          {draft?.id ? t('admin.labelName') : t('admin.addLabel')}
        </AppText>
        <FormInput
          label={t('admin.labelName')}
          value={draft?.name ?? ''}
          onChangeText={(name) => setDraft((current) => (current ? { ...current, name } : current))}
        />
        <Button label={t('common.save')} onPress={() => void saveDraft()} loading={saving} />
      </AppBottomSheet>
    </>
  );
}

const styles = StyleSheet.create({
  header: { paddingBottom: spacing.lg },
  headerAdd: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
  },
  switcherWrap: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
    backgroundColor: palette.gold,
  },
  body: {
    gap: spacing.md,
  },
  loader: { marginTop: spacing.xl },
  card: {
    backgroundColor: palette.pureWhite,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: palette.softGold,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  rowDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: palette.softGold,
  },
  name: { flex: 1, fontSize: 15, color: palette.charcoal },
  action: { padding: 2 },
  sheetTitle: {
    fontSize: 18,
    color: palette.charcoal,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
});
