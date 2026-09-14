import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
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
  const markRead = useMessagesStore((state) => state.markRead);
  const sendMessage = useMessagesStore((state) => state.sendMessage);
  const [draft, setDraft] = React.useState('');
  const listRef = React.useRef<FlatList<ChatMessage>>(null);

  React.useEffect(() => {
    markRead(conversationId);
  }, [conversationId, markRead]);

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

  const submit = () => {
    const text = draft.trim();
    if (!text) return;
    sendMessage(conversationId, text);
    setDraft('');
  };

  return (
    <GoldSheetScreen
      title={conversation.participantName}
      left="back"
      onBackPress={navigation.goBack}
      headerStyle={styles.header}
      headerExtra={
        <View style={styles.listingChip}>
          <Ionicons name="pricetag-outline" size={14} color={palette.pureWhite} />
          <AppText style={styles.listingChipText} numberOfLines={1}>
            {conversation.listingTitle}
          </AppText>
        </View>
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
              senderName={conversation.participantName}
            />
          )}
        />
        <MessageComposer
          value={draft}
          onChangeText={setDraft}
          onSend={submit}
          placeholder={t('messages.inputPlaceholder')}
          sendLabel={t('messages.send')}
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
  listingChipText: {
    flex: 1,
    fontSize: 13,
    color: palette.pureWhite,
  },
  thread: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },
});
