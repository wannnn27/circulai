/**
 * @file TailorChatScreen.js
 * @description Real-time style chat between user and a local tailor.
 *
 * Features:
 * - Direct messaging with local tailor persona & AI assistance
 * - Media & Sketch Attachments (Camera & Gallery via expo-image-picker)
 * - Interactive Quick Replies (Ukuran, Kain, Estimasi, Fitting)
 * - Fullscreen image viewer
 * - Smooth typing bounce animations
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import AnimatedPressable from '../components/AnimatedPressable';
import { useAppState } from '../state/AppContext';
import { colors, shadows } from '../theme/colors';

const QUICK_MESSAGES = [
  { icon: 'ruler', label: 'Rekomendasi ukuran', text: 'Bisa minta rekomendasi ukuran yang pas untuk bentuk tubuh saya?' },
  { icon: 'layers', label: 'Pilihan kain sisa', text: 'Pilihan kain sisa dan warna apa saja yang saat ini masih tersedia?' },
  { icon: 'clock', label: 'Estimasi pengerjaan', text: 'Berapa lama estimasi pengerjaan jahit made-to-order sampai dikirim?' },
  { icon: 'scissors', label: 'Jadwal fitting & ukur', text: 'Apakah saya bisa konsultasi ukuran atau fitting langsung dengan penjahit?' },
  { icon: 'image', label: 'Kirim foto referensi', text: 'Saya punya foto referensi model yang saya inginkan, apakah bisa dibuatkan?' },
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
  const [selectedImage, setSelectedImage] = useState(null);
  const [attachMenuVisible, setAttachMenuVisible] = useState(false);
  const [fullScreenImage, setFullScreenImage] = useState(null);

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

  const handleSend = (value = draft, imageToSend = selectedImage) => {
    const cleanValue = value.trim();
    if (!cleanValue && !imageToSend) return;

    setDraft('');
    setSelectedImage(null);
    setTyping(true);
    sendTailorMessage(tailor.name, cleanValue, context, imageToSend);
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => setTyping(false), 760);
  };

  const handlePickImage = async () => {
    setAttachMenuVisible(false);
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Izin Galeri', 'Aplikasi memerlukan izin untuk mengakses galeri foto.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets?.[0]?.uri) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch {
      Alert.alert('Gagal', 'Terjadi kesalahan saat memilih gambar.');
    }
  };

  const handleTakePhoto = async () => {
    setAttachMenuVisible(false);
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Izin Kamera', 'Aplikasi memerlukan izin kamera untuk mengambil foto.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets?.[0]?.uri) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch {
      Alert.alert('Gagal', 'Terjadi kesalahan saat membuka kamera.');
    }
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
      {/* Header Bar */}
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
            <Text style={styles.onlineText}>Aktif • Membalas {tailor.responseTime}</Text>
          </View>
        </View>

        <AnimatedPressable
          style={styles.headerAction}
          onPress={() => setAttachMenuVisible(true)}
          scaleDown={0.9}
        >
          <Feather name="camera" size={17} color={colors.forest} />
        </AnimatedPressable>
      </View>

      {/* Messages FlatList */}
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
                {/* Optional Image Attachment in Message */}
                {!!item.image && (
                  <Pressable onPress={() => setFullScreenImage(item.image)}>
                    <Image source={{ uri: item.image }} style={styles.bubbleImage} resizeMode="cover" />
                  </Pressable>
                )}

                {!!item.text && (
                  <Text style={[styles.messageText, outgoing && styles.outgoingText]}>{item.text}</Text>
                )}

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

      {/* Selected Image Attachment Preview Box */}
      {!!selectedImage && (
        <View style={styles.attachmentPreview}>
          <Image source={{ uri: selectedImage }} style={styles.previewThumb} />
          <View style={styles.previewInfo}>
            <Text style={styles.previewTitle}>Foto referensi siap dikirim</Text>
            <Text style={styles.previewSub}>Tambahkan catatan ukuran atau klik kirim</Text>
          </View>
          <Pressable style={styles.removePreviewBtn} onPress={() => setSelectedImage(null)}>
            <Feather name="x" size={16} color={colors.warmGray} />
          </Pressable>
        </View>
      )}

      {/* Quick Replies Strip */}
      <View style={styles.quickArea}>
        <FlatList
          horizontal
          data={QUICK_MESSAGES}
          keyExtractor={(item) => item.label}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.quickList}
          renderItem={({ item }) => (
            <Pressable style={styles.quickChip} onPress={() => handleSend(item.text)}>
              <Feather name={item.icon} size={11} color={colors.forest} />
              <Text style={styles.quickText}>{item.label}</Text>
            </Pressable>
          )}
        />
      </View>

      {/* Bottom Composer Input Bar */}
      <View style={[styles.composer, { paddingBottom: Math.max(insets.bottom, 10) }]}>
        {/* Attachment Button */}
        <AnimatedPressable
          style={styles.attachBtn}
          onPress={() => setAttachMenuVisible(true)}
          scaleDown={0.9}
        >
          <Feather name="plus" size={18} color={colors.forest} />
        </AnimatedPressable>

        <TextInput
          value={draft}
          onChangeText={setDraft}
          onSubmitEditing={() => handleSend()}
          placeholder={selectedImage ? 'Beri catatan foto referensi...' : 'Tulis pesan untuk penjahit...'}
          placeholderTextColor={colors.warmGrayLight}
          returnKeyType="send"
          style={styles.input}
        />

        <AnimatedPressable
          style={[styles.sendButton, (!draft.trim() && !selectedImage) && styles.sendButtonDisabled]}
          disabled={!draft.trim() && !selectedImage}
          onPress={() => handleSend()}
          scaleDown={0.9}
        >
          <Feather name="send" size={17} color={colors.white} />
        </AnimatedPressable>
      </View>

      {/* ─── Image Attachment Options Modal ─────────────────────────────── */}
      <Modal
        visible={attachMenuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setAttachMenuVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setAttachMenuVisible(false)}>
          <View style={styles.actionSheet}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Kirim Foto / Sketsa Referensi</Text>
            <Text style={styles.sheetSub}>Bagikan contoh pola baju, model, atau catatan fitting.</Text>

            <Pressable style={styles.sheetOption} onPress={handleTakePhoto}>
              <View style={[styles.optionIcon, { backgroundColor: colors.forestLight }]}>
                <Feather name="camera" size={18} color={colors.forest} />
              </View>
              <View style={styles.optionTextWrap}>
                <Text style={styles.optionTitle}>Ambil Foto Baru</Text>
                <Text style={styles.optionDesc}>Buka kamera untuk foto kain atau pola</Text>
              </View>
            </Pressable>

            <Pressable style={styles.sheetOption} onPress={handlePickImage}>
              <View style={[styles.optionIcon, { backgroundColor: colors.sandLight }]}>
                <Feather name="image" size={18} color={colors.forest} />
              </View>
              <View style={styles.optionTextWrap}>
                <Text style={styles.optionTitle}>Pilih dari Galeri</Text>
                <Text style={styles.optionDesc}>Pilih gambar dari album fotomu</Text>
              </View>
            </Pressable>

            <Pressable style={styles.cancelBtn} onPress={() => setAttachMenuVisible(false)}>
              <Text style={styles.cancelBtnText}>Batal</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

      {/* ─── Fullscreen Image Viewer Modal ───────────────────────────────── */}
      <Modal
        visible={!!fullScreenImage}
        transparent
        animationType="fade"
        onRequestClose={() => setFullScreenImage(null)}
      >
        <View style={styles.fullScreenOverlay}>
          <Pressable style={styles.fullScreenClose} onPress={() => setFullScreenImage(null)}>
            <Feather name="x" size={24} color={colors.white} />
          </Pressable>
          {!!fullScreenImage && (
            <Image
              source={{ uri: fullScreenImage }}
              style={styles.fullScreenImg}
              resizeMode="contain"
            />
          )}
        </View>
      </Modal>
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
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.sandLight,
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
    paddingHorizontal: 12,
    paddingTop: 8,
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
  bubbleImage: {
    width: 200,
    height: 160,
    borderRadius: 12,
    marginBottom: 6,
    backgroundColor: colors.sandLight,
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
  attachmentPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: colors.sandLight,
    borderTopWidth: 1,
    borderTopColor: colors.sand,
  },
  previewThumb: {
    width: 42,
    height: 42,
    borderRadius: 8,
    backgroundColor: colors.sand,
  },
  previewInfo: {
    flex: 1,
  },
  previewTitle: {
    color: colors.forest,
    fontSize: 11,
    fontWeight: '800',
  },
  previewSub: {
    color: colors.warmGray,
    fontSize: 9,
  },
  removePreviewBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: 9999,
    paddingHorizontal: 11,
    paddingVertical: 7,
    backgroundColor: colors.sandLight,
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
  attachBtn: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: colors.sandLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.sand,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  actionSheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 32,
    ...shadows.xl,
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.lightGray,
    alignSelf: 'center',
    marginBottom: 16,
  },
  sheetTitle: {
    color: colors.charcoal,
    fontSize: 15,
    fontWeight: '900',
  },
  sheetSub: {
    color: colors.warmGray,
    fontSize: 11,
    marginTop: 3,
    marginBottom: 16,
  },
  sheetOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  optionIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionTextWrap: {
    flex: 1,
  },
  optionTitle: {
    color: colors.charcoal,
    fontSize: 13,
    fontWeight: '800',
  },
  optionDesc: {
    color: colors.warmGray,
    fontSize: 10,
    marginTop: 2,
  },
  cancelBtn: {
    marginTop: 16,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 14,
    backgroundColor: colors.sandLight,
  },
  cancelBtnText: {
    color: colors.forest,
    fontSize: 13,
    fontWeight: '800',
  },
  fullScreenOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullScreenClose: {
    position: 'absolute',
    top: 50,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  fullScreenImg: {
    width: '90%',
    height: '75%',
  },
});
