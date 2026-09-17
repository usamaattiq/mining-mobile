import React from 'react';
import { FlatList, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { i18n as appI18n } from '@/i18n';
import { useLanguage } from '@/i18n/hooks/useLanguage';
import type { RootStackParamList } from '@/navigation/types';
import { GoldSheetScreen } from '@/features/dashboard/components/GoldSheetScreen';
import { AppText } from '@/shared/components/AppText';
import { EmptyState } from '@/shared/components/EmptyState';
import { useMessagesStore } from '@/store/messagesStore';
import { messagesApi } from '@/features/messages/api/messagesApi';
import type { ChatMessage } from '@/features/messages/types/conversation.types';
import { ChatBubble } from '@/features/messages/components/ChatBubble';
import { MessageComposer } from '@/features/messages/components/MessageComposer';
import { formatClockTime } from '@/shared/utils/formatRelativeTime';
import { palette, spacing } from '@/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Conversation'>;

export function ConversationScreen({ navigation, route }: Props): React.ReactElement {
  const { conversationId } = route.params;
  const { t } = useTranslation(undefined, { i18n: appI18n });
  const { currentLanguage } = useLanguage();
  const conversation = useMessagesStore((state) =>
    state.conversations.find((item) => item.id === conversationId),
  );
  const upsertConversation = useMessagesStore((state) => state.upsertConversation);
  const [draft, setDraft] = React.useState('');
  const [sending, setSending] = React.useState(false);
  const listRef = React.useRef<FlatList<ChatMessage>>(null);

  React.useEffect(() => {
    let cancelled = false;
    void messagesApi
      .getConversation(conversationId)
      .then((item) => {
        if (!cancelled) upsertConversation(item);
      })
      .catch(() => undefined);
    void messagesApi.markRead(conversationId).then((item) => {
      if (!cancelled) upsertConversation(item);
    });
    return () => {
      cancelled = true;
    };
  }, [conversationId, upsertConversation]);

  React.useEffect(() => {
    const last = conversation?.messages.at(-1);
    if (!last || last.fromMe) return;
    void messagesApi.markRead(conversationId).then((item) => {
      upsertConversation(item);
    });
  }, [conversation?.messages.at(-1)?.id, conversationId, upsertConversation]);

  React.useEffect(() => {
    if (conversation?.messages.length) {
      requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: false }));
    }
  }, [conversation?.messages.length]);

  if (!conversation) {
    return (
      <GoldSheetScreen
        title={t('messages.title')}
        left="back"
        onBackPress={navigation.goBack}
        scroll={false}
      >
        <EmptyState title={t('messages.notFound')} />
      </GoldSheetScreen>
    );
  }

  const openListing = () => {
    if (!conversation.listingId || !conversation.listingCategory) return;
    navigation.navigate('CompleteListingDetail', {
      id: conversation.listingId,
      category: conversation.listingCategory,
    });
  };

  const submit = async () => {
    const text = draft.trim();
    if (!text || sending) return;
    setSending(true);
    setDraft('');
    try {
      const updated = await messagesApi.sendMessage(conversationId, text);
      upsertConversation(updated);
    } catch {
      setDraft(text);
    } finally {
      setSending(false);
    }
  };

  return (
    <GoldSheetScreen
      title={conversation.participantName}
      left="back"
      onBackPress={navigation.goBack}
      headerStyle={styles.header}
      headerExtra={
        <Pressable
          onPress={openListing}
          accessibilityRole="link"
          accessibilityLabel={conversation.listingTitle}
          style={({ pressed }) => [styles.listingChip, pressed && styles.listingChipPressed]}
        >
          <Ionicons name="pricetag-outline" size={14} color={palette.pureWhite} />
          <AppText style={styles.listingChipText} numberOfLines={1}>
            {conversation.listingTitle}
          </AppText>
          <Ionicons name="chevron-forward" size={14} color={palette.pureWhite} />
        </Pressable>
      }
      scroll={false}
    >
      <KeyboardAvoidingView style={styles.flex} behavior="padding">
        <FlatList
          ref={listRef}
          data={conversation.messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.thread}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
          renderItem={({ item }) => (
            <ChatBubble
              text={item.text}
              time={formatClockTime(item.sentAt, currentLanguage)}
              fromMe={item.fromMe}
            />
          )}
        />
        <MessageComposer
          value={draft}
          onChangeText={setDraft}
          onSend={submit}
          placeholder={t('messages.inputPlaceholder')}
          sendLabel={t('messages.send')}
          sending={sending}
        />
      </KeyboardAvoidingView>
    </GoldSheetScreen>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  header: {
    paddingBottom: spacing.sm,
  },
  listingChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  listingChipPressed: {
    opacity: 0.85,
  },
  listingChipText: {
    flex: 1,
    fontSize: 13,
    color: palette.pureWhite,
  },
  thread: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
});
