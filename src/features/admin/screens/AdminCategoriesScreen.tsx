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
type Label = AdminCategoryItem['labels'][number];
type LabelNode = Label & { children: LabelNode[] };

function buildTree(labels: Label[]): LabelNode[] {
  const nodes = new Map<string, LabelNode>();
  for (const label of labels) nodes.set(label.id, { ...label, children: [] });
  const roots: LabelNode[] = [];
  for (const node of nodes.values()) {
    const parent = node.parentId ? nodes.get(node.parentId) : undefined;
    if (parent) parent.children.push(node);
    else roots.push(node);
  }
  return roots;
}

function filterTree(nodes: LabelNode[], query: string): LabelNode[] {
  const q = query.trim().toLowerCase();
  if (!q) return nodes;
  return nodes.flatMap((node) => {
    const children = filterTree(node.children, query);
    if (node.name.toLowerCase().includes(q)) return [{ ...node, children: node.children }];
    if (children.length > 0) return [{ ...node, children }];
    return [];
  });
}

export function AdminCategoriesScreen(): React.ReactElement {
  const { t } = useTranslation(undefined, { i18n: appI18n });
  const [items, setItems] = React.useState<AdminCategoryItem[]>([]);
  const [domain, setDomain] = React.useState<CategoryKey>('equipment');
  const [query, setQuery] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const [draft, setDraft] = React.useState<{ id: string | null; name: string; parentId: string | null } | null>(null);
  const [expanded, setExpanded] = React.useState<Set<string>>(new Set());
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
  const visible = filterTree(buildTree(labels), query);

  const saveDraft = async () => {
    if (!draft?.name.trim()) return;
    setSaving(true);
    try {
      if (draft.id) await adminApi.renameCategory(draft.id, draft.name.trim());
      else await adminApi.createCategory(domain, draft.name.trim(), draft.parentId);
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
          void adminApi
            .deleteCategory(id)
            .then(() => load())
            .catch(() => showAppAlert(t('admin.deleteChildrenFirst')));
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
            onPress={() => setDraft({ id: null, name: '', parentId: null })}
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
              {visible.map((node, index) => (
                <CategoryBranch
                  key={node.id}
                  node={node}
                  depth={0}
                  expanded={expanded}
                  onToggle={(id) =>
                    setExpanded((current) => {
                      const next = new Set(current);
                      if (next.has(id)) next.delete(id);
                      else next.add(id);
                      return next;
                    })
                  }
                  onAdd={domain === 'gold' ? undefined : (parentId) => setDraft({ id: null, name: '', parentId })}
                  onEdit={(label) => setDraft({ id: label.id, name: label.name, parentId: label.parentId })}
                  onDelete={removeLabel}
                  forceExpand={query.trim().length > 0}
                  showDivider={index < visible.length - 1}
                />
              ))}
            </View>
          )}
        </View>
      </GoldSheetScreen>

      <AppBottomSheet visible={draft !== null} onClose={() => setDraft(null)} fitContent>
        <AppText weight="bold" style={styles.sheetTitle}>
          {draft?.id ? t('admin.labelName') : draft?.parentId ? t('admin.addSubcategory') : t('admin.addLabel')}
        </AppText>
        <View style={styles.sheetForm}>
          <FormInput
            value={draft?.name ?? ''}
            onChangeText={(name) => setDraft((current) => (current ? { ...current, name } : current))}
          />
          <Button label={t('common.save')} onPress={() => void saveDraft()} loading={saving} />
        </View>
      </AppBottomSheet>
    </>
  );
}

function CategoryBranch({
  node,
  depth,
  expanded,
  forceExpand,
  onToggle,
  onAdd,
  onEdit,
  onDelete,
  showDivider,
}: {
  node: LabelNode;
  depth: number;
  expanded: Set<string>;
  forceExpand: boolean;
  onToggle: (id: string) => void;
  onAdd?: (parentId: string) => void;
  onEdit: (label: Label) => void;
  onDelete: (id: string, name: string) => void;
  showDivider: boolean;
}): React.ReactElement {
  const open = forceExpand || expanded.has(node.id);
  const hasChildren = node.children.length > 0;
  return (
    <View>
      <View style={[styles.row, showDivider && styles.rowDivider, { paddingStart: spacing.sm +2 + depth * 12 }]}>
        <View style={styles.lead}>
          {hasChildren ? (
            <Pressable onPress={() => onToggle(node.id)} hitSlop={6} style={styles.chevron}>
              <Ionicons name={open ? 'chevron-down' : 'chevron-forward'} size={14} color={palette.gold} />
            </Pressable>
          ) : (
            <View style={styles.expandSpacer} />
          )}
          <Ionicons name="pricetag-outline" size={16} color={palette.gold} />
        </View>
        <AppText weight="semibold" style={styles.name} numberOfLines={1}>
          {node.name}
        </AppText>
        {onAdd ? (
          <Pressable onPress={() => onAdd(node.id)} hitSlop={8} style={styles.action}>
            <Ionicons name="add" size={20} color={palette.gold} />
          </Pressable>
        ) : null}
        <Pressable onPress={() => onEdit(node)} hitSlop={8} style={styles.action}>
          <Ionicons name="create-outline" size={20} color={palette.muted} />
        </Pressable>
        <Pressable onPress={() => onDelete(node.id, node.name)} hitSlop={8} style={styles.action}>
          <Ionicons name="trash-outline" size={20} color={palette.danger} />
        </Pressable>
      </View>
      {open
        ? node.children.map((child, index) => (
            <CategoryBranch
              key={child.id}
              node={child}
              depth={depth + 1}
              expanded={expanded}
              forceExpand={forceExpand}
              onToggle={onToggle}
              onAdd={onAdd}
              onEdit={onEdit}
              onDelete={onDelete}
              showDivider={index < node.children.length - 1 || showDivider}
            />
          ))
        : null}
    </View>
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
  lead: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  chevron: { width: 14, alignItems: 'center' },
  expandSpacer: { width: 14 },
  sheetTitle: {
    fontSize: 18,
    color: palette.charcoal,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  sheetForm: {
    gap: spacing.sm,
  },
});
