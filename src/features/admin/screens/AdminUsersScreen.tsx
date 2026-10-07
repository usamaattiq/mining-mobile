import React from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { i18n as appI18n } from '@/i18n';
import { GoldSheetScreen } from '@/features/dashboard/components/GoldSheetScreen';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/navigation/types';
import { adminApi, type AdminUserItem } from '@/features/admin/api/adminApi';
import { SegmentedSwitcher } from '@/shared/components/SegmentedSwitcher';
import { AppText } from '@/shared/components/AppText';
import { EmptyState } from '@/shared/components/EmptyState';
import { SearchField } from '@/shared/components/SearchField';
import { FilterBadges } from '@/features/admin/components/FilterBadges';
import { showAppAlert } from '@/shared/services/appAlert';
import { palette, radius, spacing } from '@/theme';
import { cardBackShadow } from '@/theme/cardShadow';

export function AdminUsersScreen(): React.ReactElement {
  const { t } = useTranslation(undefined, { i18n: appI18n });
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [accountType, setAccountType] = React.useState<'individual' | 'company'>('individual');
  const [statusFilter, setStatusFilter] = React.useState<'all' | 'blocked'>('all');
  const [query, setQuery] = React.useState('');
  const [items, setItems] = React.useState<AdminUserItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);

  const load = React.useCallback(
    async (search: string, type: 'individual' | 'company', status: 'all' | 'blocked') => {
      const result = await adminApi.listUsers({
        search,
        accountType: type,
        status: status === 'blocked' ? 'suspended' : undefined,
      });
      setItems(result.items);
    },
    [],
  );

  React.useEffect(() => {
    const handle = setTimeout(
      () => {
        setLoading(true);
        void load(query, accountType, statusFilter)
          .catch(() => showAppAlert(t('admin.loadFailed')))
          .finally(() => setLoading(false));
      },
      query ? 300 : 0,
    );
    return () => clearTimeout(handle);
  }, [query, accountType, statusFilter, load, t]);

  return (
    <GoldSheetScreen
      title={t('tabs.users')}
      titleAlign="left"
      titleSize="lg"
      headerStyle={styles.header}
      headerExtra={
        <View style={styles.headerExtra}>
          <SegmentedSwitcher
            value={accountType}
            onChange={setAccountType}
            options={[
              { key: 'individual', label: t('admin.individual') },
              { key: 'company', label: t('admin.company') },
            ]}
          />
        </View>
      }
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            void load(query, accountType, statusFilter).finally(() => setRefreshing(false));
          }}
        />
      }
    >
      <SearchField value={query} onChangeText={setQuery} placeholder={t('admin.searchUsers')} />
      <FilterBadges
        value={statusFilter}
        onChange={setStatusFilter}
        options={[
          { id: 'all', label: t('admin.all') },
          { id: 'blocked', label: t('admin.blocked') },
        ]}
      />
      {loading ? (
        <ActivityIndicator color={palette.gold} style={styles.loader} />
      ) : items.length === 0 ? (
        <EmptyState title={t('admin.emptyUsers')} />
      ) : (
        items.map((item) => (
          <Pressable
            key={item.id}
            onPress={() => navigation.navigate('AdminUserProfile', { userId: item.id })}
            style={styles.card}
          >
            {item.avatarUrl ? (
              <Image source={{ uri: item.avatarUrl }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarFallback}>
                <AppText weight="semibold" style={styles.initial}>
                  {item.fullName.trim().charAt(0).toUpperCase() || '?'}
                </AppText>
              </View>
            )}
            <View style={styles.copy}>
              <AppText weight="semibold" style={styles.name} numberOfLines={1}>
                {item.fullName}
              </AppText>
              <AppText style={styles.phone} numberOfLines={1}>
                {item.phoneE164}
              </AppText>
            </View>
            {item.status === 'suspended' ? (
              <View style={styles.badge}>
                <AppText weight="semibold" style={styles.badgeText}>
                  {t('admin.blocked')}
                </AppText>
              </View>
            ) : null}
          </Pressable>
        ))
      )}
    </GoldSheetScreen>
  );
}

const styles = StyleSheet.create({
  header: { paddingBottom: spacing.lg },
  headerExtra: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
    backgroundColor: palette.gold,
  },
  loader: { marginTop: spacing.xl },
  card: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm + 2,
    backgroundColor: palette.warmWhite,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: palette.softGold,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    // marginBottom: spacing.xs,
    ...cardBackShadow,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  avatarFallback: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.softGold,
  },
  initial: {
    color: palette.goldDark,
    fontSize: 16,
  },
  copy: {
    flex: 1,
    gap: 4,
    minWidth: 0,
  },
  name: {
    fontSize: 16,
    color: palette.charcoal,
  },
  phone: {
    fontSize: 13,
    color: palette.muted,
  },
  badge: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    backgroundColor: palette.danger,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  badgeText: {
    fontSize: 11,
    color: palette.pureWhite,
  },
});
