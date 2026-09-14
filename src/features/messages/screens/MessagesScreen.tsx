import React from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { i18n as appI18n } from '@/i18n';
import { useLanguage } from '@/i18n/hooks/useLanguage';
import type { DashboardTabParamList, RootStackParamList } from '@/navigation/types';
import { AppTopBar } from '@/shared/components/AppTopBar';
import { CurvedSheetScrollView } from '@/features/dashboard/components/CurvedSheetScrollView';
import { AppText } from '@/shared/components/AppText';
import { ConversationRow } from '@/features/messages/components/ConversationRow';
import { useMessagesStore } from '@/store/messagesStore';
import { getFontFamily, palette, radius, spacing } from '@/theme';

type Props = CompositeScreenProps<
  BottomTabScreenProps<DashboardTabParamList, 'Messages'>,
  NativeStackScreenProps<RootStackParamList>
>;

export function MessagesScreen({ navigation }: Props): React.ReactElement {
  const { t } = useTranslation(undefined, { i18n: appI18n });
  const { currentLanguage } = useLanguage();
  const conversations = useMessagesStore((state) => state.conversations);
  const [query, setQuery] = React.useState('');

  const filtered = conversations.filter((conversation) => {
    const needle = query.trim().toLowerCase();
    if (!needle) return true;
    return (
      conversation.participantName.toLowerCase().includes(needle) ||
      conversation.listingTitle.toLowerCase().includes(needle)
    );
  });

  return (
    <View style={styles.root}>
      <AppTopBar
        variant="gold"
        title={t('messages.title')}
        titleAlign="left"
        titleSize="lg"
        style={styles.header}
      />
      <CurvedSheetScrollView>
        <View style={styles.searchRow}>
          <Ionicons name="search" size={18} color={palette.muted} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder={t('messages.searchPlaceholder')}
            placeholderTextColor={palette.muted}
            style={[styles.searchInput, { fontFamily: getFontFamily(currentLanguage) }]}
          />
        </View>
        {filtered.length === 0 ? (
          <View style={styles.empty}>
            <AppText weight="semibold" style={styles.emptyTitle}>
              {t('messages.emptyTitle')}
            </AppText>
            <AppText style={styles.emptySubtitle}>{t('messages.emptySubtitle')}</AppText>
          </View>
        ) : (
          filtered.map((conversation) => (
            <ConversationRow
              key={conversation.id}
              conversation={conversation}
              t={t}
              onPress={() =>
                navigation.navigate('Conversation', { conversationId: conversation.id })
              }
            />
          ))
        )}
      </CurvedSheetScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: palette.gold,
  },
  header: {
    paddingBottom: spacing.xl,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: palette.softGold,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    backgroundColor: palette.pureWhite,
  },
  searchInput: {
    flex: 1,
    paddingVertical: spacing.sm + 4,
    fontSize: 15,
    color: palette.charcoal,
  },
  empty: {
    paddingVertical: spacing.xxl,
    alignItems: 'center',
    gap: spacing.xs,
  },
  emptyTitle: {
    fontSize: 15,
    color: palette.charcoal,
  },
  emptySubtitle: {
    fontSize: 13,
    color: palette.muted,
    textAlign: 'center',
  },
});
