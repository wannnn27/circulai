import React, { useEffect, useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

import AnimatedPressable from './AnimatedPressable';
import ProfileAvatar from './ProfileAvatar';
import { useAppState } from '../state/AppContext';
import { colors, shadows } from '../theme/colors';
import { deleteProfilePhoto, pickProfilePhoto } from '../utils/profilePhoto';

const panelMeta = {
  profile: { title: 'Edit Profil', subtitle: 'Perbarui informasi akunmu', icon: 'user' },
  measurements: { title: 'Ukuran Tersimpan', subtitle: 'Dipakai saat membuat custom order', icon: 'maximize-2' },
  membership: { title: 'CIRCULAI Membership', subtitle: 'Lihat progress dan benefit member', icon: 'award' },
  notifications: { title: 'Pengaturan Notifikasi', subtitle: 'Pilih kabar yang ingin kamu terima', icon: 'bell' },
  security: { title: 'Keamanan Akun', subtitle: 'Kelola perlindungan akunmu', icon: 'shield' },
  help: { title: 'Pusat Bantuan', subtitle: 'Jawaban cepat untuk pertanyaan umum', icon: 'help-circle' },
  privacy: { title: 'Privasi & Data', subtitle: 'Kontrol penggunaan datamu', icon: 'file-text' },
};

const faqItems = [
  ['Bagaimana proses made-to-order?', 'Pesanan mulai dibuat setelah pembayaran dikonfirmasi dan statusnya dapat dipantau dari menu Orders.'],
  ['Berapa lama proses produksi?', 'Rata-rata proses produksi membutuhkan 7-14 hari, tergantung produk dan detail kustomisasi.'],
  ['Apakah ukuran bisa diubah?', 'Ukuran tersimpan dapat diperbarui kapan saja dan digunakan sebagai referensi custom order berikutnya.'],
];

export default function ProfileActionModal({ panel, onClose }) {
  const {
    circularPoints,
    isLoggedIn,
    measurements,
    preferences,
    saveMeasurements,
    setNotice,
    updatePreference,
    updateUserProfile,
    userProfile,
  } = useAppState();
  const [profileDraft, setProfileDraft] = useState(userProfile);
  const [measurementDraft, setMeasurementDraft] = useState(measurements);
  const [openFaq, setOpenFaq] = useState(null);
  const meta = panelMeta[panel];

  useEffect(() => {
    setProfileDraft(userProfile);
    setMeasurementDraft(measurements);
    setOpenFaq(null);
  }, [measurements, panel, userProfile]);

  if (!panel || !meta) return null;

  const saveProfile = () => {
    if (!profileDraft.name.trim() || !profileDraft.email.trim() || !profileDraft.phone.trim()) {
      Alert.alert('Profil belum lengkap', 'Nama, email, dan nomor telepon wajib diisi.');
      return;
    }
    updateUserProfile(profileDraft);
    onClose();
  };

  const changeProfilePhoto = async () => {
    try {
      const photoUri = await pickProfilePhoto();
      if (!photoUri) return;
      deleteProfilePhoto(profileDraft.photoUri);
      setProfileDraft((current) => ({ ...current, photoUri }));
      updateUserProfile({ photoUri });
    } catch (error) {
      Alert.alert(
        'Foto belum dapat dipilih',
        error.code === 'PHOTO_PERMISSION_DENIED'
          ? 'Izinkan akses galeri agar CIRCULAI dapat menggunakan foto pilihanmu.'
          : 'Terjadi masalah saat memproses foto. Silakan coba lagi.'
      );
    }
  };

  const removeProfilePhoto = () => {
    deleteProfilePhoto(profileDraft.photoUri);
    setProfileDraft((current) => ({ ...current, photoUri: null }));
    updateUserProfile({ photoUri: null });
  };

  const saveBodyMeasurements = () => {
    if (Object.values(measurementDraft).some((value) => !String(value).trim())) {
      Alert.alert('Ukuran belum lengkap', 'Isi semua ukuran tubuh sebelum menyimpan.');
      return;
    }
    saveMeasurements(measurementDraft);
    onClose();
  };

  return (
    <Modal transparent visible animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.dismissArea} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <View style={styles.headerIcon}>
              <Feather name={meta.icon} size={18} color={colors.forest} />
            </View>
            <View style={styles.headerCopy}>
              <Text style={styles.title}>{meta.title}</Text>
              <Text style={styles.subtitle}>{meta.subtitle}</Text>
            </View>
            <Pressable style={styles.closeButton} onPress={onClose}>
              <Feather name="x" size={17} color={colors.warmGray} />
            </Pressable>
          </View>

          <ScrollView
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {panel === 'profile' && (
              <>
                <View style={styles.photoEditor}>
                  <ProfileAvatar
                    name={profileDraft.name}
                    photoUri={profileDraft.photoUri}
                    size={86}
                    editable
                    onPress={changeProfilePhoto}
                  />
                  <View style={styles.photoActions}>
                    <Text style={styles.photoTitle}>Foto profil</Text>
                    <Text style={styles.photoHint}>Gunakan foto persegi agar hasilnya terlihat rapi.</Text>
                    <View style={styles.photoButtonRow}>
                      <Pressable style={styles.photoButton} onPress={changeProfilePhoto}>
                        <Feather name="image" size={13} color={colors.forest} />
                        <Text style={styles.photoButtonText}>Pilih Foto</Text>
                      </Pressable>
                      {!!profileDraft.photoUri && (
                        <Pressable style={styles.removePhotoButton} onPress={removeProfilePhoto}>
                          <Feather name="trash-2" size={13} color={colors.error} />
                        </Pressable>
                      )}
                    </View>
                  </View>
                </View>
                <Field label="Nama lengkap" value={profileDraft.name} onChangeText={(name) => setProfileDraft((current) => ({ ...current, name }))} />
                <Field label="Email" value={profileDraft.email} keyboardType="email-address" onChangeText={(email) => setProfileDraft((current) => ({ ...current, email }))} />
                <Field label="Nomor telepon" value={profileDraft.phone} keyboardType="phone-pad" onChangeText={(phone) => setProfileDraft((current) => ({ ...current, phone }))} />
                <PrimaryButton label="Simpan Perubahan" icon="check" onPress={saveProfile} />
              </>
            )}

            {panel === 'measurements' && (
              <>
                <View style={styles.infoCard}>
                  <MaterialCommunityIcons name="tape-measure" size={20} color={colors.forest} />
                  <Text style={styles.infoText}>Gunakan satuan sentimeter agar rekomendasi fit lebih akurat.</Text>
                </View>
                <View style={styles.measurementGrid}>
                  <MeasurementField label="Tinggi" value={measurementDraft.height} onChangeText={(height) => setMeasurementDraft((current) => ({ ...current, height }))} />
                  <MeasurementField label="Dada" value={measurementDraft.chest} onChangeText={(chest) => setMeasurementDraft((current) => ({ ...current, chest }))} />
                  <MeasurementField label="Pinggang" value={measurementDraft.waist} onChangeText={(waist) => setMeasurementDraft((current) => ({ ...current, waist }))} />
                  <MeasurementField label="Pinggul" value={measurementDraft.hips} onChangeText={(hips) => setMeasurementDraft((current) => ({ ...current, hips }))} />
                </View>
                <PrimaryButton label="Simpan Ukuran" icon="save" onPress={saveBodyMeasurements} />
              </>
            )}

            {panel === 'membership' && (
              <>
                <View style={styles.membershipCard}>
                  <View style={styles.membershipTop}>
                    <View>
                      <Text style={styles.membershipKicker}>CURRENT TIER</Text>
                      <Text style={styles.membershipTier}>{isLoggedIn ? 'Green Member' : 'Guest'}</Text>
                    </View>
                    <MaterialCommunityIcons name="leaf-circle" size={48} color={colors.sand} />
                  </View>
                  <Text style={styles.membershipPoints}>{circularPoints} Impact Points</Text>
                  <View style={styles.progressTrack}><View style={[styles.progressFill, { width: isLoggedIn ? '64%' : '0%' }]} /></View>
                  <Text style={styles.membershipHint}>{isLoggedIn ? `${Math.max(0, 500 - circularPoints)} poin lagi menuju Emerald` : 'Masuk akun untuk mengumpulkan poin'}</Text>
                </View>
                <Text style={styles.sectionTitle}>Benefit aktif</Text>
                <Benefit icon="truck-outline" title="Prioritas produksi" desc="Antrean produksi lebih cepat untuk member." />
                <Benefit icon="ticket-percent-outline" title="Voucher impact" desc="Tukar poin menjadi potongan custom order." />
                <Benefit icon="account-heart-outline" title="Akses komunitas" desc="Dapatkan update event dan workshop lokal." />
              </>
            )}

            {panel === 'notifications' && (
              <>
                <SettingToggle label="Update pesanan" desc="Status pembayaran, produksi, dan pengiriman" value={preferences.notifications.orderUpdates} onValueChange={(value) => updatePreference('notifications', 'orderUpdates', value)} />
                <SettingToggle label="Promo & koleksi baru" desc="Penawaran dan produk circular terbaru" value={preferences.notifications.promotions} onValueChange={(value) => updatePreference('notifications', 'promotions', value)} />
                <SettingToggle label="Tips impact" desc="Inspirasi gaya dan laporan dampak bulanan" value={preferences.notifications.impactTips} onValueChange={(value) => updatePreference('notifications', 'impactTips', value)} />
              </>
            )}

            {panel === 'security' && (
              <>
                <SettingToggle label="Login biometrik" desc="Gunakan sidik jari atau pengenalan wajah" value={preferences.security.biometric} onValueChange={(value) => updatePreference('security', 'biometric', value)} />
                <SettingToggle label="Peringatan login" desc="Beritahu saat ada perangkat baru masuk" value={preferences.security.loginAlerts} onValueChange={(value) => updatePreference('security', 'loginAlerts', value)} />
                <AnimatedPressable
                  style={styles.secondaryButton}
                  onPress={() => {
                    setNotice('Tautan reset password telah dikirim ke email');
                    onClose();
                  }}
                >
                  <Feather name="key" size={15} color={colors.forest} />
                  <Text style={styles.secondaryButtonText}>Kirim Tautan Reset Password</Text>
                </AnimatedPressable>
              </>
            )}

            {panel === 'help' && (
              <>
                {faqItems.map(([question, answer], index) => (
                  <Pressable key={question} style={styles.faqItem} onPress={() => setOpenFaq(openFaq === index ? null : index)}>
                    <View style={styles.faqHeader}>
                      <Text style={styles.faqQuestion}>{question}</Text>
                      <Feather name={openFaq === index ? 'chevron-up' : 'chevron-down'} size={16} color={colors.forest} />
                    </View>
                    {openFaq === index && <Text style={styles.faqAnswer}>{answer}</Text>}
                  </Pressable>
                ))}
                <PrimaryButton
                  label="Hubungi Tim Dukungan"
                  icon="message-circle"
                  onPress={() => {
                    setNotice('Permintaan bantuan berhasil dibuat');
                    onClose();
                  }}
                />
              </>
            )}

            {panel === 'privacy' && (
              <>
                <View style={styles.infoCard}>
                  <Feather name="shield" size={19} color={colors.forest} />
                  <Text style={styles.infoText}>Data ukuran dan gaya digunakan untuk memberi rekomendasi yang lebih relevan.</Text>
                </View>
                <SettingToggle label="Personalisasi rekomendasi" desc="Gunakan profil gaya untuk kurasi produk" value={preferences.privacy.personalization} onValueChange={(value) => updatePreference('privacy', 'personalization', value)} />
                <SettingToggle label="Analitik penggunaan" desc="Bantu kami meningkatkan pengalaman aplikasi" value={preferences.privacy.analytics} onValueChange={(value) => updatePreference('privacy', 'analytics', value)} />
                <Text style={styles.privacyCopy}>
                  CIRCULAI tidak menjual data personal. Kamu dapat mengubah preferensi ini kapan saja.
                </Text>
              </>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function Field({ label, ...props }) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput {...props} style={styles.input} placeholderTextColor={colors.warmGrayLight} />
    </View>
  );
}

function MeasurementField({ label, ...props }) {
  return (
    <View style={styles.measurementField}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.measurementInputWrap}>
        <TextInput {...props} keyboardType="numeric" style={styles.measurementInput} />
        <Text style={styles.measurementUnit}>cm</Text>
      </View>
    </View>
  );
}

function SettingToggle({ label, desc, value, onValueChange }) {
  return (
    <View style={styles.settingRow}>
      <View style={styles.settingCopy}>
        <Text style={styles.settingLabel}>{label}</Text>
        <Text style={styles.settingDesc}>{desc}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: colors.lightGrayDark, true: colors.forestMid }}
        thumbColor={value ? colors.forest : colors.offWhite}
      />
    </View>
  );
}

function Benefit({ icon, title, desc }) {
  return (
    <View style={styles.benefit}>
      <View style={styles.benefitIcon}>
        <MaterialCommunityIcons name={icon} size={18} color={colors.forest} />
      </View>
      <View style={styles.benefitCopy}>
        <Text style={styles.benefitTitle}>{title}</Text>
        <Text style={styles.benefitDesc}>{desc}</Text>
      </View>
      <Feather name="check-circle" size={16} color={colors.success} />
    </View>
  );
}

function PrimaryButton({ label, icon, onPress }) {
  return (
    <AnimatedPressable style={styles.primaryButton} onPress={onPress}>
      <Text style={styles.primaryButtonText}>{label}</Text>
      <Feather name={icon} size={16} color={colors.white} />
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: colors.overlay },
  dismissArea: { flex: 1 },
  sheet: { maxHeight: '84%', borderTopLeftRadius: 28, borderTopRightRadius: 28, backgroundColor: colors.ivory, overflow: 'hidden' },
  handle: { alignSelf: 'center', width: 42, height: 4, borderRadius: 99, backgroundColor: colors.lightGrayDark, marginTop: 9 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 11, padding: 18, borderBottomWidth: 1, borderBottomColor: colors.lightGray },
  headerIcon: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.sand },
  headerCopy: { flex: 1 },
  title: { color: colors.charcoal, fontSize: 17, fontWeight: '900' },
  subtitle: { color: colors.warmGray, fontSize: 10, marginTop: 2 },
  closeButton: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.white, borderWidth: 1, borderColor: colors.lightGray },
  content: { padding: 18, paddingBottom: 36 },
  photoEditor: { flexDirection: 'row', alignItems: 'center', gap: 16, padding: 14, borderRadius: 20, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.lightGray, marginBottom: 16 },
  photoActions: { flex: 1 },
  photoTitle: { color: colors.charcoal, fontSize: 13, fontWeight: '900' },
  photoHint: { color: colors.warmGray, fontSize: 9, lineHeight: 13, marginTop: 3 },
  photoButtonRow: { flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 9 },
  photoButton: { minHeight: 34, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderRadius: 11, paddingHorizontal: 11, backgroundColor: colors.successLight },
  photoButtonText: { color: colors.forest, fontSize: 9, fontWeight: '900' },
  removePhotoButton: { width: 34, height: 34, borderRadius: 11, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.errorLight },
  field: { marginBottom: 12 },
  fieldLabel: { color: colors.charcoalMid, fontSize: 10, fontWeight: '800', marginBottom: 6 },
  input: { minHeight: 48, borderRadius: 14, paddingHorizontal: 13, color: colors.charcoal, fontSize: 12, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.lightGray },
  primaryButton: { minHeight: 54, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 17, paddingHorizontal: 18, backgroundColor: colors.forest, marginTop: 10, ...shadows.forest },
  primaryButtonText: { color: colors.white, fontSize: 12, fontWeight: '900' },
  infoCard: { flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 16, padding: 13, backgroundColor: colors.sandLight, borderWidth: 1, borderColor: colors.lightGray, marginBottom: 14 },
  infoText: { flex: 1, color: colors.warmGray, fontSize: 11, lineHeight: 16 },
  measurementGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 12 },
  measurementField: { width: '48%' },
  measurementInputWrap: { minHeight: 52, flexDirection: 'row', alignItems: 'center', borderRadius: 15, paddingHorizontal: 13, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.lightGray },
  measurementInput: { flex: 1, color: colors.charcoal, fontSize: 16, fontWeight: '900' },
  measurementUnit: { color: colors.warmGray, fontSize: 10, fontWeight: '700' },
  membershipCard: { borderRadius: 22, padding: 18, backgroundColor: colors.forest, marginBottom: 18, ...shadows.md },
  membershipTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  membershipKicker: { color: 'rgba(255,255,255,0.55)', fontSize: 8, fontWeight: '900', letterSpacing: 1 },
  membershipTier: { color: colors.white, fontSize: 20, fontWeight: '900', marginTop: 3 },
  membershipPoints: { color: colors.sand, fontSize: 12, fontWeight: '800', marginTop: 16 },
  progressTrack: { height: 7, borderRadius: 99, overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.16)', marginTop: 8 },
  progressFill: { width: '64%', height: '100%', borderRadius: 99, backgroundColor: colors.sand },
  membershipHint: { color: 'rgba(255,255,255,0.62)', fontSize: 9, marginTop: 7 },
  sectionTitle: { color: colors.charcoal, fontSize: 12, fontWeight: '900', marginBottom: 9 },
  benefit: { flexDirection: 'row', alignItems: 'center', gap: 11, padding: 13, borderRadius: 16, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.lightGray, marginBottom: 9 },
  benefitIcon: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.successLight },
  benefitCopy: { flex: 1 },
  benefitTitle: { color: colors.charcoal, fontSize: 11, fontWeight: '900' },
  benefitDesc: { color: colors.warmGray, fontSize: 9, lineHeight: 13, marginTop: 2 },
  settingRow: { minHeight: 70, flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 17, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.lightGray, marginBottom: 10 },
  settingCopy: { flex: 1 },
  settingLabel: { color: colors.charcoal, fontSize: 12, fontWeight: '900' },
  settingDesc: { color: colors.warmGray, fontSize: 9, lineHeight: 13, marginTop: 3 },
  secondaryButton: { minHeight: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 16, paddingHorizontal: 16, borderWidth: 1.5, borderColor: colors.forest, marginTop: 5 },
  secondaryButtonText: { color: colors.forest, fontSize: 11, fontWeight: '900' },
  faqItem: { padding: 14, borderRadius: 16, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.lightGray, marginBottom: 9 },
  faqHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  faqQuestion: { flex: 1, color: colors.charcoal, fontSize: 11, fontWeight: '900' },
  faqAnswer: { color: colors.warmGray, fontSize: 10, lineHeight: 15, marginTop: 10 },
  privacyCopy: { color: colors.warmGray, fontSize: 10, lineHeight: 15, textAlign: 'center', marginTop: 8 },
});
