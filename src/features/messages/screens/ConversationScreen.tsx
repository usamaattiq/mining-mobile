import React from 'react';
import { FlatList, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { i18n as appI18n } from '@/i18n';
import { useLanguage } from '@/i18n/hooks/useLanguage';
import type { RootStackParamList } from '@/navigation/types';
import { AppTopBar } from '@/shared/components/AppTopBar';
import { AppText } from '@/shared/components/AppText';
import { useMessagesStore } from '@/store/messagesStore';
import type { ChatMessage } from '@/features/messages/types/conversation.types';
import { formatClockTime, initialsFromName } from '@/features/messages/utils/formatMessageTime';
import { getFontFamily, palette, radius, spacing } from '@/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Conversation'>;

export function ConversationScreen({ navigation, route }: Props): React.ReactElement {
  const { conversationId } = route.params;
  const { t } = useTranslation(undefined, { i18n: appI18n });
  const { currentLanguage } = useLanguage();
  const insets = useSafeAreaInsets();
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
      <View style={styles.root}>
        <StatusBar style="light" />
        <AppTopBar
          variant="gold"
          left="back"
          title={t('messages.title')}
          onBackPress={navigation.goBack}
        />
        <View style={styles.missing}>
          <AppText style={styles.missingText}>{t('messages.notFound')}</AppText>
        </View>
      </View>
    );
  }

  const submit = () => {
    const text = draft.trim();
    if (!text) return;
    sendMessage(conversationId, text);
    setDraft('');
  };

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <AppTopBar
        variant="gold"
        left="back"
        title={conversation.participantName}
        onBackPress={navigation.goBack}
        style={styles.header}
      />
      <View style={styles.listingChip}>
        <Ionicons name="pricetag-outline" size={14} color={palette.pureWhite} />
        <AppText style={styles.listingChipText} numberOfLines={1}>
          {conversation.listingTitle}
        </AppText>
      </View>

      <KeyboardAvoidingView style={styles.sheet} behavior="padding">
        <FlatList
          ref={listRef}
          data={conversation.messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.thread}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
          renderItem={({ item }) => (
            <View style={[styles.bubbleRow, item.fromMe && styles.bubbleRowMine]}>
              {!item.fromMe ? (
                <View style={styles.tinyAvatar}>
                  <AppText weight="bold" style={styles.tinyAvatarText}>
                    {initialsFromName(conversation.participantName)}
                  </AppText>
                </View>
              ) : null}
              <View style={[styles.bubble, item.fromMe ? styles.bubbleMine : styles.bubbleTheirs]}>
                <AppText style={[styles.bubbleText, item.fromMe && styles.bubbleTextMine]}>
                  {item.text}
                </AppText>
                <AppText style={[styles.bubbleTime, item.fromMe && styles.bubbleTimeMine]}>
                  {formatClockTime(item.sentAt, currentLanguage)}
                </AppText>
              </View>
            </View>
          )}
        />

        <View style={[styles.composer, { paddingBottom: Math.max(insets.bottom, spacing.sm) }]}>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder={t('messages.inputPlaceholder')}
            placeholderTextColor={palette.muted}
            multiline
            style={[styles.composerInput, { fontFamily: getFontFamily(currentLanguage) }]}
          />
          <Pressable
            onPress={submit}
            disabled={!draft.trim()}
            accessibilityRole="button"
            accessibilityLabel={t('messages.send')}
            style={({ pressed }) => [
              styles.sendButton,
              !draft.trim() && styles.sendButtonDisabled,
              pressed && draft.trim() && styles.sendButtonPressed,
            ]}
          >
            <Ionicons name="send" size={18} color={palette.pureWhite} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: palette.gold,
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
  sheet: {
    flex: 1,
    backgroundColor: palette.pureWhite,
    borderTopLeftRadius: radius.lg + 4,
    borderTopRightRadius: radius.lg + 4,
    marginTop: -(radius.lg + 4),
    overflow: 'hidden',
  },
  thread: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },
  bubbleRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.xs,
    maxWidth: '100%',
  },
  bubbleRowMine: {
    justifyContent: 'flex-end',
  },
  tinyAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: palette.softGold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tinyAvatarText: {
    fontSize: 10,
    color: palette.gold,
  },
  bubble: {
    maxWidth: '78%',
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: 4,
  },
  bubbleTheirs: {
    backgroundColor: palette.warmWhite,
    borderBottomLeftRadius: radius.sm,
  },
  bubbleMine: {
    backgroundColor: palette.gold,
    borderBottomRightRadius: radius.sm,
  },
  bubbleText: {
    fontSize: 15,
    color: palette.charcoal,
  },
  bubbleTextMine: {
    color: palette.pureWhite,
  },
  bubbleTime: {
    fontSize: 11,
    color: palette.muted,
    alignSelf: 'flex-end',
  },
  bubbleTimeMine: {
    color: 'rgba(255,255,255,0.8)',
  },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: palette.softGold,
    backgroundColor: palette.pureWhite,
  },
  composerInput: {
    flex: 1,
    maxHeight: 120,
    borderWidth: 1,
    borderColor: palette.softGold,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 15,
    color: palette.charcoal,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: palette.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.4,
  },
  sendButtonPressed: {
    opacity: 0.9,
  },
  missing: {
    flex: 1,
    backgroundColor: palette.pureWhite,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  missingText: {
    fontSize: 14,
    color: palette.muted,
  },
});
