/**
 * @file TailorChatScreen.js
 * @description Real-time style chat between user and a local tailor.
 *
 * In demo / offline mode, outgoing messages trigger a simulated
 * Gemini AI reply that represents the tailor's expertise.
 * The typing indicator uses a staggered bounce animation.
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import AnimatedPressable from '../components/AnimatedPressable';
import { useAppState } from '../state/AppContext';
import { colors, shadows } from '../theme/colors';

const QUICK_MESSAGES = [
  'Apakah ukurannya bisa disesuaikan?',
  'Pilihan kain apa yang tersedia?',
  'Bagaimana status pesananku?'
];

function formatMessageTime(value) {
  return new Intl.DateTimeFormat('id-ID', {
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(value));
}

export default function TailorChatScreen({ tailorName, product, order, onBack }) {
  const insets = useSafeAreaInsets();
  const listRef = useRef(null);
  const typingTimer = useRef(null);
  const [draft, setDraft] = useState('');
  const [typing, setTyping] = useState(false);
  const { conversations, sendTailorMessage, getTailorByName } = useAppState();
  const tailor = useMemo(() => getTailorByName(tailorName), [getTailorByName, tailorName]);
  const context = useMemo(
    () => ({
      orderId: order?.id,
      productName: product?.name ?? order?.product
    }),
    [order?.id, order?.product, product?.name]
  );
  const subject = context.orderId
    ? `${context.orderId} - ${context.productName}`
    : context.productName;
  const messages = useMemo(() => {
    const intro = {
      id: `INTRO-${tailor.name}`,
      sender: 'tailor',
      text: subject
        ? `Halo Adi, saya dari ${tailor.name}. Ada yang bisa kami bantu terkait ${subject}?`
        : `Halo Adi, saya dari ${tailor.name}. Ada yang bisa kami bantu untuk outfit custommu?`,
      createdAt: new Date(2026, 5, 7, 9, 30).toISOString()
    };
    return [intro, ...(conversations[tailor.name] ?? [])];
  }, [conversations, subject, tailor.name]);

  useEffect(() => () => clearTimeout(typingTimer.current), []);

  const handleSend = (value = draft) => {
    const cleanValue = value.trim();
    if (!cleanValue) return;

    setDraft('');
    setTyping(true);
    sendTailorMessage(tailor.name, cleanValue, context);
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => setTyping(false), 760);
  };

  // ── Typing indicator bounce animation ─────────────────────────────────────
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;
  const typingAnim = useRef(null);

  useEffect(() => {
    if (typing) {
      const makeBounce = (dotAnim, delay) =>
        Animated.sequence([
          Animated.delay(delay),
          Animated.loop(
            Animated.sequence([
              Animated.spring(dotAnim, {
                toValue: -6,
                useNativeDriver: true,
                speed: 28,
                bounciness: 10,
              }),
              Animated.spring(dotAnim, {
                toValue: 0,
                useNativeDriver: true,
                speed: 20,
                bounciness: 4,
              }),
              Animated.delay(180),
            ])
          ),
        ]);

      typingAnim.current = Animated.parallel([
        makeBounce(dot1, 0),
        makeBounce(dot2, 130),
        makeBounce(dot3, 260),
      ]);
      typingAnim.current.start();
    } else {
      typingAnim.current?.stop();
      dot1.setValue(0);
      dot2.setValue(0);
      dot3.setValue(0);
    }

    return () => typingAnim.current?.stop();
  }, [typing, dot1, dot2, dot3]);

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <AnimatedPressable style={styles.backButton} onPress={onBack} scaleDown={0.9}>
          <Feather name="chevron-left" size={20} color={colors.forest} />
        </AnimatedPressable>

        {tailor.image ? (
          <Image source={{ uri: tailor.image }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarFallback}>
            <Feather name="user" size={18} color={colors.forest} />
          </View>
        )}

        <View style={styles.headerInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.tailorName} numberOfLines={1}>{tailor.name}</Text>
            {tailor.verified && <Feather name="check-circle" size={13} color={colors.success} />}
          </View>
          <View style={styles.onlineRow}>
            <View style={styles.onlineDot} />
            <Text style={styles.onlineText}>Aktif, biasanya membalas {tailor.responseTime}</Text>
          </View>
        </View>

        <View style={styles.headerAction}>
          <Feather name="more-horizontal" size={18} color={colors.warmGray} />
        </View>
      </View>

      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(item) => item.id}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.messageList}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
        ListHeaderComponent={
          <View style={styles.conversationHeader}>
            {!!subject && (
              <View style={styles.subjectCard}>
                {product?.image || order?.image ? (
                  <Image source={{ uri: product?.image ?? order?.image }} style={styles.subjectImage} />
                ) : (
                  <View style={styles.subjectIcon}>
                    <Feather name="scissors" size={18} color={colors.forest} />
                  </View>
                )}
                <View style={styles.subjectInfo}>
                  <Text style={styles.subjectLabel}>
                    {context.orderId ? 'Diskusi Pesanan' : 'Diskusi Produk'}
                  </Text>
                  <Text style={styles.subjectTitle} numberOfLines={1}>{subject}</Text>
                </View>
                <Feather name="chevron-right" size={16} color={colors.warmGrayLight} />
              </View>
            )}
            <Text style={styles.dayLabel}>Hari ini</Text>
          </View>
        }
        ListFooterComponent={
          typing ? (
            <View style={styles.typingBubble}>
              {[dot1, dot2, dot3].map((dotAnim, i) => (
                <Animated.View
                  key={i}
                  style={[
                    styles.typingDot,
                    { transform: [{ translateY: dotAnim }] },
                  ]}
                />
              ))}
            </View>
          ) : null
        }
        renderItem={({ item }) => {
          const outgoing = item.sender === 'user';
          return (
            <View style={[styles.messageRow, outgoing && styles.messageRowOutgoing]}>
              <View style={[styles.messageBubble, outgoing ? styles.outgoingBubble : styles.incomingBubble]}>
                <Text style={[styles.messageText, outgoing && styles.outgoingText]}>{item.text}</Text>
                <View style={styles.messageMeta}>
                  <Text style={[styles.messageTime, outgoing && styles.outgoingTime]}>
                    {formatMessageTime(item.createdAt)}
                  </Text>
                  {outgoing && <Feather name="check" size={11} color="rgba(255,255,255,0.66)" />}
                </View>
              </View>
            </View>
          );
        }}
      />

      <View style={styles.quickArea}>
        <FlatList
          horizontal
          data={QUICK_MESSAGES}
          keyExtractor={(item) => item}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.quickList}
          renderItem={({ item }) => (
            <Pressable style={styles.quickChip} onPress={() => handleSend(item)}>
              <Text style={styles.quickText}>{item}</Text>
            </Pressable>
          )}
        />
      </View>

      <View style={[styles.composer, { paddingBottom: Math.max(insets.bottom, 10) }]}>
        <TextInput
          value={draft}
          onChangeText={setDraft}
          onSubmitEditing={() => handleSend()}
          placeholder="Tulis pesan untuk penjahit..."
          placeholderTextColor={colors.warmGrayLight}
          returnKeyType="send"
          style={styles.input}
        />
        <AnimatedPressable
          style={[styles.sendButton, !draft.trim() && styles.sendButtonDisabled]}
          disabled={!draft.trim()}
          onPress={() => handleSend()}
          scaleDown={0.9}
        >
          <Feather name="send" size={17} color={colors.white} />
        </AnimatedPressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.ivory,
  },
  header: {
    minHeight: 70,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
    ...shadows.sm,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.sandLight,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: colors.sand,
  },
  avatarFallback: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.sand,
  },
  headerInfo: {
    flex: 1,
    minWidth: 0,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  tailorName: {
    flexShrink: 1,
    color: colors.charcoal,
    fontSize: 14,
    fontWeight: '900',
  },
  onlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 3,
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.success,
  },
  onlineText: {
    flex: 1,
    color: colors.warmGray,
    fontSize: 8,
    fontWeight: '600',
  },
  headerAction: {
    width: 34,
    height: 34,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.ivory,
  },
  messageList: {
    flexGrow: 1,
    padding: 16,
    paddingBottom: 18,
  },
  conversationHeader: {
    marginBottom: 16,
  },
  subjectCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 10,
    borderRadius: 16,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.lightGray,
  },
  subjectImage: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.sand,
  },
  subjectIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.sand,
  },
  subjectInfo: {
    flex: 1,
    minWidth: 0,
  },
  subjectLabel: {
    color: colors.warmGray,
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  subjectTitle: {
    color: colors.charcoal,
    fontSize: 11,
    fontWeight: '900',
    marginTop: 3,
  },
  dayLabel: {
    alignSelf: 'center',
    color: colors.warmGray,
    fontSize: 9,
    fontWeight: '700',
    marginTop: 16,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
    backgroundColor: colors.ivoryDark,
  },
  messageRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 10,
  },
  messageRowOutgoing: {
    justifyContent: 'flex-end',
  },
  messageBubble: {
    maxWidth: '82%',
    paddingHorizontal: 13,
    paddingTop: 10,
    paddingBottom: 7,
    borderRadius: 18,
  },
  incomingBubble: {
    backgroundColor: colors.white,
    borderBottomLeftRadius: 5,
    borderWidth: 1,
    borderColor: colors.lightGray,
  },
  outgoingBubble: {
    backgroundColor: colors.forest,
    borderBottomRightRadius: 5,
  },
  messageText: {
    color: colors.charcoal,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '500',
  },
  outgoingText: {
    color: colors.white,
  },
  messageMeta: {
    alignSelf: 'flex-end',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 4,
  },
  messageTime: {
    color: colors.warmGrayLight,
    fontSize: 7,
    fontWeight: '600',
  },
  outgoingTime: {
    color: 'rgba(255,255,255,0.58)',
  },
  typingBubble: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 16,
    borderBottomLeftRadius: 5,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.lightGray,
  },
  typingDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.warmGrayLight,
  },
  quickArea: {
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
    backgroundColor: colors.white,
  },
  quickList: {
    gap: 7,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  quickChip: {
    borderRadius: 9999,
    paddingHorizontal: 11,
    paddingVertical: 7,
    backgroundColor: colors.successLight,
    borderWidth: 1,
    borderColor: 'rgba(47,79,58,0.12)',
  },
  quickText: {
    color: colors.forest,
    fontSize: 9,
    fontWeight: '800',
  },
  composer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingTop: 10,
    backgroundColor: colors.white,
  },
  input: {
    flex: 1,
    minHeight: 42,
    borderRadius: 15,
    paddingHorizontal: 13,
    color: colors.charcoal,
    fontSize: 12,
    backgroundColor: colors.ivory,
    borderWidth: 1,
    borderColor: colors.lightGray,
  },
  sendButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.forest,
  },
  sendButtonDisabled: {
    opacity: 0.38,
  },
});
