import React from 'react';
import { ActivityIndicator, Image, Pressable, RefreshControl, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { i18n as appI18n } from '@/i18n';
import { GoldSheetScreen } from '@/features/dashboard/components/GoldSheetScreen';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/navigation/types';
import { AdminChipRow } from '@/features/admin/components/AdminChipRow';
import { adminApi, type AdminUserItem } from '@/features/admin/api/adminApi';
import { AppText } from '@/shared/components/AppText';
import { SearchField } from '@/shared/components/SearchField';
import { showAppAlert } from '@/shared/services/appAlert';
import { palette, radius, spacing } from '@/theme';
import { cardBackShadow } from '@/theme/cardShadow';

export function AdminUsersScreen(): React.ReactElement {
  const { t } = useTranslation(undefined, { i18n: appI18n });
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [accountType, setAccountType] = React.useState('all');
  const [query, setQuery] = React.useState('');
  const [items, setItems] = React.useState<AdminUserItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);

  const load = React.useCallback(async (search: string, type: string) => {
    const result = await adminApi.listUsers({
      search,
      accountType: type === 'all' ? undefined : type,
    });
    setItems(result.items);
  }, []);

  React.useEffect(() => {
    const handle = setTimeout(() => {
      setLoading(true);
      void load(query, accountType)
        .catch(() => showAppAlert(t('admin.loadFailed')))
        .finally(() => setLoading(false));
    }, query ? 300 : 0);
    return () => clearTimeout(handle);
  }, [query, accountType, load, t]);

  return (
    <GoldSheetScreen
      title={t('tabs.users')}
      headerStyle={styles.header}
      headerExtra={
        <View style={styles.headerExtra}>
          <AdminChipRow
            value={accountType}
            onChange={setAccountType}
            options={[
              { id: 'all', label: t('admin.all'), icon: 'people-outline' },
              { id: 'individual', label: t('admin.individual'), icon: 'person-outline' },
              { id: 'company', label: t('admin.company'), icon: 'business-outline' },
            ]}
          />
        </View>
      }
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            void load(query, accountType).finally(() => setRefreshing(false));
          }}
        />
      }
    >
      <SearchField value={query} onChangeText={setQuery} placeholder={t('admin.searchUsers')} />
      {loading ? (
        <ActivityIndicator color={palette.gold} style={styles.loader} />
      ) : items.length === 0 ? (
        <AppText style={styles.empty}>{t('admin.emptyUsers')}</AppText>
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
          </Pressable>
        ))
      )}
    </GoldSheetScreen>
  );
}

const styles = StyleSheet.create({
  header: { paddingBottom: spacing.sm },
  headerExtra: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl + spacing.sm,
    backgroundColor: palette.gold,
  },
  loader: { marginTop: spacing.xl },
  empty: { color: palette.muted, textAlign: 'center', marginTop: spacing.xl },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: palette.warmWhite,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: palette.softGold,
    padding: spacing.sm,
    marginBottom: spacing.xs,
    ...cardBackShadow,
  },
  avatar: {
    width: 108,
    height: 108,
    borderRadius: 54,
  },
  avatarFallback: {
    width: 108,
    height: 108,
    borderRadius: 54,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.softGold,
  },
  initial: {
    color: palette.goldDark,
    fontSize: 36,
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
    fontSize: 14,
    color: palette.muted,
  },
});
