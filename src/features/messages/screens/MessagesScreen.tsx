import React from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { CompositeScreenProps } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { useTranslation } from 'react-i18next';
import { i18n as appI18n } from '@/i18n';
import type { DashboardTabParamList, RootStackParamList } from '@/navigation/types';
import { GoldSheetScreen } from '@/features/dashboard/components/GoldSheetScreen';
import { SearchField } from '@/shared/components/SearchField';
import { EmptyState } from '@/shared/components/EmptyState';
import { ConversationRow } from '@/features/messages/components/ConversationRow';
import { useMessagesStore } from '@/store/messagesStore';
import { messagesApi } from '@/features/messages/api/messagesApi';

type Props = CompositeScreenProps<
  BottomTabScreenProps<DashboardTabParamList, 'Messages'>,
  NativeStackScreenProps<RootStackParamList>
>;

export function MessagesScreen({ navigation }: Props): React.ReactElement {
  const { t } = useTranslation(undefined, { i18n: appI18n });
  const conversations = useMessagesStore((state) => state.conversations);
  const [query, setQuery] = React.useState('');

  useFocusEffect(
    React.useCallback(() => {
      void messagesApi.listConversations().then((items) => {
        useMessagesStore.getState().setConversations(items);
      });
    }, []),
  );

  const filtered = conversations.filter((conversation) => {
    const needle = query.trim().toLowerCase();
    if (!needle) return true;
    return (
      conversation.participantName.toLowerCase().includes(needle) ||
      conversation.listingTitle.toLowerCase().includes(needle)
    );
  });

  return (
    <GoldSheetScreen title={t('messages.title')} titleAlign="left" titleSize="lg">
      <SearchField
        value={query}
        onChangeText={setQuery}
        placeholder={t('messages.searchPlaceholder')}
      />
      {filtered.length === 0 ? (
        <EmptyState title={t('messages.emptyTitle')} subtitle={t('messages.emptySubtitle')} />
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
    </GoldSheetScreen>
  );
}
