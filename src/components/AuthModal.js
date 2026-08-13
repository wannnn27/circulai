import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

import AnimatedPressable from './AnimatedPressable';
import LeafMark from './LeafMark';
import { colors, shadows } from '../theme/colors';
import { useAppState } from '../state/AppContext';

export default function AuthModal({ visible, onClose, onSuccess, initialMode = 'login', message }) {
  const [mode, setMode] = useState(initialMode); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAppState();

  const handleLoginSubmit = () => {
    if (mode === 'register' && !name.trim()) {
      Alert.alert('Perhatian', 'Silakan masukkan nama lengkap kamu.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      Alert.alert('Perhatian', 'Silakan masukkan email yang valid.');
      return;
    }
    if (!password.trim() || password.length < 4) {
      Alert.alert('Perhatian', 'Password minimal 4 karakter.');
      return;
    }

    login({
      name: name.trim() || 'Adi Arwan Syah',
      email: email.trim(),
    });

    onClose();
    if (onSuccess) onSuccess();
  };

  const handleQuickDemoLogin = () => {
    login({
      name: 'Adi Arwan Syah',
      email: 'adi.arwansyah@email.com',
    });
    onClose();
    if (onSuccess) onSuccess();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <Pressable style={styles.backdrop} onPress={onClose} />

        <View style={styles.sheet}>
          <View style={styles.handleBar} />

          <View style={styles.header}>
            <View style={styles.brandRow}>
              <View style={styles.logoBadge}>
                <LeafMark size={18} color={colors.sand} />
              </View>
              <Text style={styles.brandTitle}>CIRCULAI</Text>
            </View>
            <Pressable style={styles.closeBtn} onPress={onClose}>
              <Feather name="x" size={18} color={colors.warmGray} />
            </Pressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollBody}
            keyboardShouldPersistTaps="handled"
          >
            {!!message && (
              <View style={styles.messageBox}>
                <Feather name="lock" size={15} color={colors.forest} />
                <Text style={styles.messageText}>{message}</Text>
              </View>
            )}

            <View style={styles.tabContainer}>
              <Pressable
                style={[styles.tab, mode === 'login' && styles.tabActive]}
                onPress={() => setMode('login')}
              >
                <Text style={[styles.tabText, mode === 'login' && styles.tabTextActive]}>
                  Masuk Akun
                </Text>
              </Pressable>
              <Pressable
                style={[styles.tab, mode === 'register' && styles.tabActive]}
                onPress={() => setMode('register')}
              >
                <Text style={[styles.tabText, mode === 'register' && styles.tabTextActive]}>
                  Daftar Baru
                </Text>
              </Pressable>
            </View>

            <Text style={styles.formTitle}>
              {mode === 'login' ? 'Selamat Datang Kembali!' : 'Buat Akun CIRCULAI'}
            </Text>
            <Text style={styles.formSubtitle}>
              {mode === 'login'
                ? 'Masuk untuk memproses pesanan, melacak status MTO, dan menukar poin.'
                : 'Dapatkan 100 Impact Points gratis saat pertama kali mendaftar.'}
            </Text>

            {mode === 'register' && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Nama Lengkap</Text>
                <View style={styles.inputWrapper}>
                  <Feather name="user" size={16} color={colors.warmGray} />
                  <TextInput
                    style={styles.input}
                    placeholder="Contoh: Adi Arwan Syah"
                    placeholderTextColor={colors.warmGrayLight}
                    value={name}
                    onChangeText={setName}
                  />
                </View>
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email</Text>
              <View style={styles.inputWrapper}>
                <Feather name="mail" size={16} color={colors.warmGray} />
                <TextInput
                  style={styles.input}
                  placeholder="email@domain.com"
                  placeholderTextColor={colors.warmGrayLight}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Password</Text>
              <View style={styles.inputWrapper}>
                <Feather name="lock" size={16} color={colors.warmGray} />
                <TextInput
                  style={styles.input}
                  placeholder="Masukkan password"
                  placeholderTextColor={colors.warmGrayLight}
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                />
                <Pressable onPress={() => setShowPassword(!showPassword)}>
                  <Feather
                    name={showPassword ? 'eye-off' : 'eye'}
                    size={16}
                    color={colors.warmGray}
                  />
                </Pressable>
              </View>
            </View>

            <AnimatedPressable
              style={styles.submitBtn}
              onPress={handleLoginSubmit}
              scaleDown={0.98}
            >
              <Text style={styles.submitBtnText}>
                {mode === 'login' ? 'Masuk Sekarang' : 'Daftar Akun'}
              </Text>
              <Feather name="arrow-right" size={16} color={colors.white} />
            </AnimatedPressable>

            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>atau</Text>
              <View style={styles.dividerLine} />
            </View>

            <AnimatedPressable
              style={styles.demoBtn}
              onPress={handleQuickDemoLogin}
              scaleDown={0.98}
            >
              <MaterialCommunityIcons name="lightning-bolt" size={18} color={colors.forest} />
              <Text style={styles.demoBtnText}>Masuk Cepat Demo (1-Klik)</Text>
            </AnimatedPressable>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(31,36,33,0.55)',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '90%',
    paddingBottom: 24,
    ...shadows.xl,
  },
  handleBar: {
    width: 38,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.lightGrayDark,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 6,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoBadge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: colors.forest,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: colors.forest,
    letterSpacing: 1,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.ivory,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollBody: {
    padding: 20,
  },
  messageBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.forestAlpha9,
    padding: 12,
    borderRadius: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.forestAlpha20,
  },
  messageText: {
    flex: 1,
    color: colors.forest,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.ivory,
    borderRadius: 14,
    padding: 4,
    marginBottom: 18,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 11,
  },
  tabActive: {
    backgroundColor: colors.white,
    ...shadows.sm,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.warmGray,
  },
  tabTextActive: {
    color: colors.forest,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.charcoal,
    letterSpacing: -0.3,
  },
  formSubtitle: {
    fontSize: 12,
    color: colors.warmGray,
    lineHeight: 17,
    marginTop: 4,
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.charcoal,
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.lightGray,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 48,
    gap: 10,
  },
  input: {
    flex: 1,
    color: colors.charcoal,
    fontSize: 13,
    fontWeight: '600',
  },
  submitBtn: {
    backgroundColor: colors.forest,
    height: 50,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 10,
    ...shadows.forest,
  },
  submitBtnText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '900',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 18,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.lightGray,
  },
  dividerText: {
    fontSize: 11,
    color: colors.warmGrayLight,
    fontWeight: '600',
  },
  demoBtn: {
    backgroundColor: colors.sandLight,
    borderWidth: 1.5,
    borderColor: colors.sandDark,
    height: 48,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  demoBtnText: {
    color: colors.forest,
    fontSize: 13,
    fontWeight: '800',
  },
});
