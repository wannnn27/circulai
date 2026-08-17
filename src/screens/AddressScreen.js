import React, { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import AnimatedPressable from '../components/AnimatedPressable';
import FlowHeader from '../components/FlowHeader';
import { useAppState } from '../state/AppContext';
import { colors, shadows } from '../theme/colors';
import { validateAddressDraft } from '../utils/validation';

export default function AddressScreen({ onBack, onContinue, mode = 'checkout' }) {
  const insets = useSafeAreaInsets();
  const { addresses, selectedAddress, selectAddress, addAddress, removeAddress, setNotice } = useAppState();
  const isManageMode = mode === 'manage';
  const [selectedId, setSelectedId] = useState(selectedAddress?.id ?? addresses[0]?.id ?? null);
  const [showForm, setShowForm] = useState(false);
  const [draft, setDraft] = useState({ label: '', receiver: '', phone: '', detail: '' });
  const selected = addresses.find((item) => item.id === selectedId) ?? selectedAddress ?? addresses[0];

  useEffect(() => {
    if (selectedAddress?.id && addresses.some((item) => item.id === selectedAddress.id)) {
      setSelectedId(selectedAddress.id);
    } else if (addresses.length > 0) {
      const fallbackId = addresses[0].id;
      setSelectedId(fallbackId);
      selectAddress(fallbackId);
    }
  }, [addresses, selectedAddress, selectAddress]);

  const handleAddAddress = async () => {
    const valResult = validateAddressDraft({
      label: draft.label || 'Rumah',
      name: draft.receiver,
      phone: draft.phone,
      detail: draft.detail,
    });

    if (!valResult.valid) {
      const firstError = Object.values(valResult.errors)[0];
      Alert.alert('Alamat Belum Lengkap', firstError);
      return;
    }

    const finalDraft = {
      ...draft,
      label: draft.label.trim() || 'Rumah',
      receiver: draft.receiver.trim(),
      detail: draft.detail.trim(),
    };
    const address = await addAddress(finalDraft);
    if (address?.id) {
      setSelectedId(address.id);
      selectAddress(address.id);
      setNotice(`Alamat "${address.label}" berhasil ditambahkan`);
    }
    setDraft({ label: '', receiver: '', phone: '', detail: '' });
    setShowForm(false);
  };

  const handleRemoveAddress = (address) => {
    Alert.alert(
      'Hapus alamat?',
      `${address.label} akan dihapus dari daftar alamatmu.`,
      [
        { text: 'Batal', style: 'cancel' },
        { text: 'Hapus', style: 'destructive', onPress: () => removeAddress(address.id) }
      ]
    );
  };

  const handleSelectCard = (address) => {
    setSelectedId(address.id);
    selectAddress(address.id);
  };

  return (
    <View style={styles.screen}>
      <FlowHeader
        title={isManageMode ? 'Kelola Alamat' : 'Alamat Pengiriman'}
        subtitle={isManageMode ? 'Tambah, pilih, atau hapus alamat tersimpan' : 'Pilih tujuan pengiriman pesanan'}
        onBack={onBack}
      />
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: Math.max(insets.bottom, 16) + 24 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {addresses.map((address) => {
          const active = selectedId === address.id;
          return (
            <AnimatedPressable key={address.id} style={[styles.card, active && styles.cardActive]} onPress={() => handleSelectCard(address)}>
              <View style={[styles.radio, active && styles.radioActive]}>{active && <View style={styles.dot} />}</View>
              <View style={styles.info}>
                <View style={styles.labelRow}>
                  <Text style={styles.label}>{address.label}</Text>
                  {active && <Text style={styles.activeBadge}>UTAMA / DIPILIH</Text>}
                </View>
                <Text style={styles.receiver}>{address.receiver}</Text>
                <Text style={styles.detail}>{address.phone}{'\n'}{address.detail}</Text>
              </View>
              {isManageMode && (
                <Pressable style={styles.deleteButton} onPress={() => handleRemoveAddress(address)} hitSlop={8}>
                  <Feather name="trash-2" size={14} color={colors.error} />
                </Pressable>
              )}
            </AnimatedPressable>
          );
        })}
        {showForm && (
          <View style={styles.form}>
            <Text style={styles.formTitle}>Tambah Alamat Baru</Text>
            <TextInput value={draft.label} onChangeText={(label) => setDraft((current) => ({ ...current, label }))} placeholder="Label alamat (contoh: Rumah, Kantor, Apartemen)" placeholderTextColor={colors.warmGrayLight} style={styles.input} />
            <TextInput value={draft.receiver} onChangeText={(receiver) => setDraft((current) => ({ ...current, receiver }))} placeholder="Nama penerima" placeholderTextColor={colors.warmGrayLight} style={styles.input} />
            <TextInput value={draft.phone} onChangeText={(phone) => setDraft((current) => ({ ...current, phone }))} placeholder="Nomor telepon" placeholderTextColor={colors.warmGrayLight} keyboardType="phone-pad" style={styles.input} />
            <TextInput value={draft.detail} onChangeText={(detail) => setDraft((current) => ({ ...current, detail }))} placeholder="Alamat lengkap dan kode pos" placeholderTextColor={colors.warmGrayLight} multiline style={[styles.input, styles.addressInput]} />
            <AnimatedPressable style={styles.save} onPress={handleAddAddress}><Text style={styles.saveText}>Simpan & Pilih Alamat</Text></AnimatedPressable>
          </View>
        )}
        <AnimatedPressable style={styles.add} onPress={() => setShowForm((current) => !current)}>
          <Feather name="plus" size={16} color={colors.forest} />
          <Text style={styles.addText}>{showForm ? 'Tutup Form Alamat' : 'Tambah Alamat Baru'}</Text>
        </AnimatedPressable>
        <AnimatedPressable
          style={[styles.primary, !selected && styles.disabled]}
          disabled={!selected}
          onPress={() => {
            if (selected) {
              selectAddress(selected.id);
            }
            if (isManageMode) {
              setNotice(selected ? `Alamat pengiriman diubah ke "${selected.label}"` : `${addresses.length} alamat tersimpan`);
              onBack();
              return;
            }
            onContinue(selected);
          }}
        >
          <Text style={styles.primaryText}>{isManageMode ? 'Gunakan Alamat Ini' : 'Pilih Metode Pembayaran'}</Text>
          <Feather name={isManageMode ? 'check' : 'arrow-right'} size={17} color={colors.white} />
        </AnimatedPressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.ivory },
  content: { padding: 20, paddingBottom: 40 },
  card: { flexDirection: 'row', gap: 12, padding: 16, borderRadius: 20, backgroundColor: colors.white, borderWidth: 1.5, borderColor: colors.lightGray, marginBottom: 12, ...shadows.sm },
  cardActive: { borderColor: colors.forest, backgroundColor: colors.successLight },
  radio: { width: 21, height: 21, borderRadius: 11, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: colors.lightGrayDark, marginTop: 2 },
  radioActive: { borderColor: colors.forest },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.forest },
  info: { flex: 1 },
  deleteButton: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.errorLight },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  label: { color: colors.forest, fontSize: 10, fontWeight: '900', textTransform: 'uppercase' },
  activeBadge: { color: colors.white, fontSize: 7, fontWeight: '900', paddingHorizontal: 6, paddingVertical: 3, borderRadius: 999, backgroundColor: colors.forest },
  receiver: { color: colors.charcoal, fontSize: 14, fontWeight: '900', marginTop: 7 },
  detail: { color: colors.warmGray, fontSize: 11, lineHeight: 17, marginTop: 3 },
  add: { minHeight: 52, flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center', borderRadius: 17, paddingHorizontal: 18, paddingVertical: 13, borderWidth: 1.5, borderStyle: 'dashed', borderColor: colors.forest, marginTop: 2 },
  addText: { color: colors.forest, fontSize: 12, lineHeight: 17, fontWeight: '900', textAlign: 'center' },
  form: { padding: 14, borderRadius: 18, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.lightGray, marginBottom: 12 },
  formTitle: { color: colors.charcoal, fontSize: 13, fontWeight: '900', marginBottom: 10 },
  input: { minHeight: 44, borderRadius: 13, paddingHorizontal: 12, color: colors.charcoal, fontSize: 11, backgroundColor: colors.ivory, borderWidth: 1, borderColor: colors.lightGray, marginBottom: 8 },
  addressInput: { minHeight: 72, paddingTop: 12, textAlignVertical: 'top' },
  save: { minHeight: 48, alignItems: 'center', justifyContent: 'center', borderRadius: 14, paddingHorizontal: 18, paddingVertical: 12, backgroundColor: colors.forest },
  saveText: { color: colors.white, fontSize: 11, lineHeight: 16, fontWeight: '900', textAlign: 'center' },
  primary: { minHeight: 56, flexDirection: 'row', gap: 9, alignItems: 'center', justifyContent: 'center', borderRadius: 18, paddingHorizontal: 20, paddingVertical: 14, backgroundColor: colors.forest, marginTop: 20, ...shadows.forest },
  primaryText: { color: colors.white, fontSize: 13, lineHeight: 18, fontWeight: '900', textAlign: 'center' },
  disabled: { opacity: 0.4 },
});
