import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { i18n as appI18n } from '@/i18n';
import { GoldSheetScreen } from '@/features/dashboard/components/GoldSheetScreen';
import { adminApi } from '@/features/admin/api/adminApi';
import { AppBottomSheet } from '@/shared/components/AppBottomSheet';
import { FormInput } from '@/shared/components/FormInput';
import { Button } from '@/shared/components/Button';
import { EmptyState } from '@/shared/components/EmptyState';
import { AppText } from '@/shared/components/AppText';
import { showAppAlert } from '@/shared/services/appAlert';
import { palette, radius, spacing } from '@/theme';

type UnitItem = { id: string; name: string; nameAr: string | null };

export function AdminSystemUnitsScreen(): React.ReactElement {
  const { t } = useTranslation(undefined, { i18n: appI18n });
  const navigation = useNavigation();
  const [items, setItems] = React.useState<UnitItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [draft, setDraft] = React.useState<{ id: string | null; name: string; nameAr: string } | null>(
    null,
  );

  const load = React.useCallback(async () => {
    const result = await adminApi.units();
    setItems(result.items);
  }, []);

  React.useEffect(() => {
    void load()
      .catch(() => showAppAlert(t('admin.loadFailed')))
      .finally(() => setLoading(false));
  }, [load, t]);

  const save = async () => {
    if (!draft?.name.trim() || !draft.nameAr.trim()) return;
    setSaving(true);
    try {
      if (draft.id) await adminApi.renameUnit(draft.id, draft.name.trim(), draft.nameAr.trim());
      else await adminApi.createUnit(draft.name.trim(), draft.nameAr.trim());
      setDraft(null);
      await load();
    } catch {
      showAppAlert(t('profile.saveError'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <GoldSheetScreen
        title={t('admin.sectionUnits')}
        titleAlign="left"
        titleSize="lg"
        left="back"
        onBackPress={() => navigation.goBack()}
        headerStyle={styles.header}
        rightSlot={
          <Pressable
            onPress={() => setDraft({ id: null, name: '', nameAr: '' })}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={t('admin.addLabel')}
            style={styles.headerAdd}
          >
            <Ionicons name="add" size={22} color={palette.pureWhite} />
          </Pressable>
        }
      >
        {loading ? (
          <ActivityIndicator color={palette.gold} style={styles.loader} />
        ) : items.length === 0 ? (
          <EmptyState title={t('admin.emptyCategory')} subtitle={t('admin.addLabel')} />
        ) : (
          <View style={styles.card}>
            {items.map((item, index) => (
              <View key={item.id} style={[styles.row, index > 0 && styles.rowDivider]}>
                <AppText weight="semibold" style={styles.name} numberOfLines={1}>
                  {item.nameAr ? `${item.name} · ${item.nameAr}` : item.name}
                </AppText>
                <Pressable
                  onPress={() => setDraft({ id: item.id, name: item.name, nameAr: item.nameAr ?? '' })}
                  hitSlop={8}
                  style={styles.action}
                >
                  <Ionicons name="create-outline" size={20} color={palette.muted} />
                </Pressable>
                <Pressable
                  onPress={() =>
                    showAppAlert(t('admin.deleteLabel'), item.name, [
                      { text: t('common.cancel'), style: 'cancel' },
                      {
                        text: t('common.confirm'),
                        style: 'destructive',
                        onPress: () => {
                          void adminApi.deleteUnit(item.id).then(() => load());
                        },
                      },
                    ])
                  }
                  hitSlop={8}
                  style={styles.action}
                >
                  <Ionicons name="trash-outline" size={20} color={palette.danger} />
                </Pressable>
              </View>
            ))}
          </View>
        )}
      </GoldSheetScreen>
      <AppBottomSheet visible={draft !== null} onClose={() => setDraft(null)} fitContent>
        <AppText weight="bold" style={styles.sheetTitle}>
          {t('equipmentListing.fieldUnit')}
        </AppText>
        <View style={styles.sheetForm}>
          <FormInput
            label={t('admin.nameEnglish')}
            placeholder={t('admin.nameEnglish')}
            value={draft?.name ?? ''}
            onChangeText={(name) => setDraft((current) => (current ? { ...current, name } : current))}
          />
          <FormInput
            label={t('admin.nameArabic')}
            placeholder="الاسم بالعربية"
            value={draft?.nameAr ?? ''}
            onChangeText={(nameAr) =>
              setDraft((current) => (current ? { ...current, nameAr } : current))
            }
          />
          <Button label={t('common.save')} onPress={() => void save()} loading={saving} />
        </View>
      </AppBottomSheet>
    </>
  );
}

const styles = StyleSheet.create({
  header: { paddingBottom: spacing.xl },
  headerAdd: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
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
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: palette.softGold,
  },
  name: { flex: 1, fontSize: 15, color: palette.charcoal },
  action: { padding: 2 },
  sheetTitle: {
    fontSize: 18,
    color: palette.charcoal,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  sheetForm: { gap: spacing.sm },
});
