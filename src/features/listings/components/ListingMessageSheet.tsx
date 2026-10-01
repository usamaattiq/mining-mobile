import React from 'react';
import {
  ActivityIndicator,
  FlatList,
  Platform,
  Image,
  Pressable,
  StyleSheet,
  TextInput,
  View,
  type ListRenderItemInfo,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { i18n as appI18n } from '@/i18n';
import { useLanguage } from '@/i18n/hooks/useLanguage';
import { AppBottomSheet } from '@/shared/components/AppBottomSheet';
import { AppText } from '@/shared/components/AppText';
import { messagesApi } from '@/features/messages/api/messagesApi';
import { ChatBubble } from '@/features/messages/components/ChatBubble';
import type { ChatMessage } from '@/features/messages/types/conversation.types';
import type { ListingOwner } from '@/features/listings/types/listingOwner.types';
import { useMessagesStore } from '@/store/messagesStore';
import { formatClockTime } from '@/shared/utils/formatRelativeTime';
import { getFontFamily, palette, radius, spacing } from '@/theme';

type Props = {
  visible: boolean;
  listingId: string;
  owner: ListingOwner;
  /** When the listing owner messages a confirmed responder, that responder's user id. */
  buyerId?: string;
  onClose: () => void;
};

function initialsFromName(name: string): string {
  const trimmed = name.trim();
  return trimmed ? trimmed.charAt(0).toUpperCase() : '?';
}

export function ListingMessageSheet({
  visible,
  listingId,
  owner,
  buyerId,
  onClose,
}: Props): React.ReactElement {
  const { t } = useTranslation(undefined, { i18n: appI18n });
  const { currentLanguage } = useLanguage();
  const [conversationId, setConversationId] = React.useState<string | null>(null);
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [draft, setDraft] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [sending, setSending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const conversationIdRef = React.useRef<string | null>(null);
  conversationIdRef.current = conversationId;

  const storedMessages = useMessagesStore((state) =>
    conversationId
      ? (state.conversations.find((item) => item.id === conversationId)?.messages ?? null)
      : null,
  );

  React.useEffect(() => {
    if (storedMessages) {
      setMessages(storedMessages);
    }
  }, [storedMessages]);

  const listData = React.useMemo(() => [...messages].reverse(), [messages]);
  const titleName = owner.fullName.trim() || t('messages.fallbackName');
  const avatarInitials = initialsFromName(titleName);
  const canSend = Boolean(draft.trim()) && Boolean(conversationId) && !sending && !loading;

  React.useEffect(() => {
    if (!visible) {
      setConversationId(null);
      setMessages([]);
      setDraft('');
      setError(null);
      setLoading(false);
      setSending(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    void messagesApi
      .startConversation(listingId, buyerId)
      .then(async (conversation) => {
        if (cancelled) return;
        setConversationId(conversation.id);
        const loaded = await messagesApi.getConversation(conversation.id);
        if (cancelled) return;
        useMessagesStore.getState().upsertConversation(loaded);
        setMessages(loaded.messages);
        setError(null);
        void messagesApi
          .markRead(conversation.id)
          .then((read) => {
            if (cancelled) return;
            useMessagesStore.getState().upsertConversation(read);
          })
          .catch(() => undefined);
      })
      .catch(() => {
        if (cancelled) return;
        if (!conversationIdRef.current) {
          setError(t('messages.chatOpenFailed'));
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [visible, listingId, buyerId, t]);

  const latestId = messages.at(-1)?.id;
  const latestFromMe = messages.at(-1)?.fromMe;
  React.useEffect(() => {
    if (!visible || !conversationId || !latestId || latestFromMe) return;
    let cancelled = false;
    void messagesApi
      .markRead(conversationId)
      .then((read) => {
        if (!cancelled) useMessagesStore.getState().upsertConversation(read);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [visible, conversationId, latestId, latestFromMe]);

  const send = () => {
    const text = draft.trim();
    if (!text || !conversationId || sending) return;
    setSending(true);
    setDraft('');
    void messagesApi
      .sendMessage(conversationId, text)
      .then((updated) => {
        useMessagesStore.getState().upsertConversation(updated);
        setMessages(updated.messages);
        setError(null);
      })
      .catch(() => {
        setDraft(text);
        setError(t('messages.chatSendFailed'));
      })
      .finally(() => setSending(false));
  };

  const renderItem = ({ item }: ListRenderItemInfo<ChatMessage>) => (
    <ChatBubble
      text={item.text}
      time={formatClockTime(item.sentAt, currentLanguage)}
      fromMe={item.fromMe}
      status={item.status}
    />
  );

  return (
    <AppBottomSheet visible={visible} onClose={onClose} heightRatio={0.95}>
      <View style={styles.root}>
        <View style={styles.header}>
          {owner.avatarUrl ? (
            <Image source={{ uri: owner.avatarUrl }} style={styles.headerAvatar} />
          ) : (
            <View style={[styles.headerAvatar, styles.headerAvatarFallback]}>
              <AppText weight="bold" style={styles.headerAvatarInitial}>
                {avatarInitials}
              </AppText>
            </View>
          )}
          <View style={styles.headerCopy}>
            <AppText weight="bold" style={styles.headerTitle} numberOfLines={1}>
              {titleName}
            </AppText>
          </View>
          <Pressable
            onPress={onClose}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel={t('common.close')}
          >
            <Ionicons name="close" size={22} color={palette.muted} />
          </Pressable>
        </View>

        {loading && messages.length === 0 ? (
          <View style={styles.centered}>
            <ActivityIndicator color={palette.gold} />
          </View>
        ) : error && messages.length === 0 ? (
          <View style={styles.centered}>
            <AppText style={styles.errorText}>{error}</AppText>
          </View>
        ) : messages.length === 0 ? (
          <View style={styles.centered}>
            <AppText style={styles.emptyText}>{t('messages.chatEmpty')}</AppText>
          </View>
        ) : (
          <FlatList
            style={styles.list}
            data={listData}
            inverted
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="interactive"
          />
        )}

        {error && messages.length > 0 ? (
          <AppText style={styles.inlineError}>{error}</AppText>
        ) : null}

        <View style={styles.composer}>
          <TextInput
            style={[styles.input, { fontFamily: getFontFamily(currentLanguage) }]}
            value={draft}
            onChangeText={setDraft}
            placeholder={t('messages.inputPlaceholder')}
            placeholderTextColor={palette.muted}
            multiline
            maxLength={2000}
            editable={Boolean(conversationId) && !loading}
          />
          <Pressable
            onPress={send}
            disabled={!canSend}
            style={({ pressed }) => [
              styles.sendButton,
              !canSend && styles.sendButtonDisabled,
              pressed && canSend && styles.sendButtonPressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel={t('messages.send')}
          >
            {sending ? (
              <ActivityIndicator color={palette.pureWhite} size="small" />
            ) : (
              <Ionicons name="send" size={16} color={palette.pureWhite} />
            )}
          </Pressable>
        </View>
      </View>
    </AppBottomSheet>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingBottom: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: palette.softGold,
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: palette.softGold,
  },
  headerAvatarFallback: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.gold,
  },
  headerAvatarInitial: {
    fontSize: 14,
    color: palette.pureWhite,
  },
  headerCopy: {
    flex: 1,
    minWidth: 0,
  },
  headerTitle: {
    fontSize: 16,
    color: palette.charcoal,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
  },
  list: {
    flex: 1,
  },
  listContent: {
    flexGrow: 1,
    paddingVertical: spacing.sm,
  },
  emptyText: {
    textAlign: 'center',
    color: palette.muted,
    fontSize: 13,
    paddingVertical: spacing.xl,
  },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.xs,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: palette.softGold,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: palette.softGold,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    paddingTop: Platform.OS === 'ios' ? 10 : 8,
    paddingBottom: Platform.OS === 'ios' ? 10 : 8,
    fontSize: 14,
    lineHeight: 20,
    textAlignVertical: 'center',
    color: palette.charcoal,
    backgroundColor: palette.pureWhite,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: palette.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonPressed: {
    backgroundColor: palette.goldDark,
  },
  sendButtonDisabled: {
    opacity: 0.4,
  },
  errorText: {
    fontSize: 13,
    color: palette.danger,
    textAlign: 'center',
    paddingHorizontal: spacing.md,
  },
  inlineError: {
    fontSize: 12,
    color: palette.danger,
    paddingBottom: spacing.xs,
  },
});
