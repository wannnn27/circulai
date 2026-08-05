import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import AnimatedPressable from '../components/AnimatedPressable';
import FlowHeader from '../components/FlowHeader';
import { canRequestReturn, returnReasons, returnStatusMeta } from '../data/appData';
import { useAppState } from '../state/AppContext';
import { colors, shadows } from '../theme/colors';
import { deleteReturnEvidencePhotos, pickReturnEvidencePhoto } from '../utils/returnEvidence';

export default function ReturnRequestScreen({ orderId, onBack }) {
  const insets = useSafeAreaInsets();
  const { orders, submitReturnRequest } = useAppState();
  const order = orders.find((item) => item.id === orderId);
  const [reasonId, setReasonId] = useState('');
  const [notes, setNotes] = useState('');
  const [evidencePhotos, setEvidencePhotos] = useState([]);
  const [picking, setPicking] = useState(false);
  const submittedRef = useRef(false);
  const evidenceRef = useRef(evidencePhotos);

  useEffect(() => {
    evidenceRef.current = evidencePhotos;
  }, [evidencePhotos]);

  useEffect(() => () => {
    if (!submittedRef.current) {
      deleteReturnEvidencePhotos(evidenceRef.current);
    }
  }, []);

  const existingRequest = order?.returnRequest;
  const statusMeta = existingRequest
    ? returnStatusMeta[existingRequest.status] ?? returnStatusMeta.REVIEWING
    : null;
  const eligible = canRequestReturn(order);
  const selectedReason = useMemo(
    () => returnReasons.find((item) => item.id === reasonId),
    [reasonId]
  );
  const canSubmit = eligible && reasonId && notes.trim().length >= 12 && evidencePhotos.length > 0 && !picking;

  const handleAddPhoto = async () => {
    if (evidencePhotos.length >= 3 || picking) return;
    setPicking(true);
    try {
      const photoUri = await pickReturnEvidencePhoto();
      if (!photoUri) return;
      setEvidencePhotos((current) => [...current, photoUri].slice(0, 3));
    } catch (error) {
      if (error.code === 'PHOTO_PERMISSION_DENIED') {
        Alert.alert(
          'Izin Foto Dibutuhkan',
          'Aktifkan akses galeri agar kamu bisa melampirkan bukti kondisi produk.'
        );
        return;
      }
      Alert.alert('Gagal Mengambil Foto', 'Coba pilih foto lain sebagai bukti pengembalian.');
    } finally {
      setPicking(false);
    }
  };

  const handleRemovePhoto = (photoUri) => {
    deleteReturnEvidencePhotos([photoUri]);
    setEvidencePhotos((current) => current.filter((item) => item !== photoUri));
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;
    const submitted = await submitReturnRequest(order.id, {
      reasonId,
      notes,
      evidencePhotos
    });
    if (submitted) {
      submittedRef.current = true;
      onBack?.();
    }
  };

  if (!order) {
    return (
      <View style={styles.screen}>
        <FlowHeader title="Ajukan Pengembalian" onBack={onBack} />
        <View style={styles.centerState}>
          <View style={styles.emptyIcon}>
            <Feather name="package" size={28} color={colors.forest} />
          </View>
          <Text style={styles.emptyTitle}>Pesanan tidak ditemukan</Text>
          <Text style={styles.emptyDesc}>Coba buka lagi dari halaman Orders.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <FlowHeader title="Ajukan Pengembalian" subtitle={order.id} onBack={onBack} />
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: Math.max(insets.bottom, 16) + 28 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <View style={styles.heroIcon}>
            <Feather name="rotate-ccw" size={22} color={colors.sand} />
          </View>
          <View style={styles.heroCopy}>
            <Text style={styles.heroKicker}>Buyer Protection</Text>
            <Text style={styles.heroTitle}>Retur kalau produk tidak sesuai</Text>
            <Text style={styles.heroDesc}>
              Lampirkan foto kondisi barang dan alasan pengembalian agar tim bisa memverifikasi dengan adil.
            </Text>
          </View>
        </View>

        <View style={styles.orderCard}>
          <Image source={{ uri: order.image }} style={styles.orderImage} />
          <View style={styles.orderInfo}>
            <Text style={styles.orderLabel}>Produk yang diajukan</Text>
            <Text style={styles.orderTitle}>{order.product}</Text>
            <Text style={styles.orderMeta}>{order.tailor} - {order.price}</Text>
          </View>
        </View>

        {existingRequest ? (
          <ExistingRequest request={existingRequest} statusMeta={statusMeta} onBack={onBack} />
        ) : !eligible ? (
          <View style={styles.policyCard}>
            <View style={styles.policyIcon}>
              <Feather name="lock" size={18} color={colors.forest} />
            </View>
            <View style={styles.policyTextWrap}>
              <Text style={styles.policyTitle}>Retur tersedia setelah pesanan diterima</Text>
              <Text style={styles.policyDesc}>
                Tombol pengembalian akan aktif saat status pesanan sudah Sudah Diterima atau Pesanan Selesai.
              </Text>
            </View>
          </View>
        ) : (
          <>
            <Text style={styles.sectionTitle}>Pilih alasan pengembalian</Text>
            <View style={styles.reasonGrid}>
              {returnReasons.map((reason) => {
                const selected = reason.id === reasonId;
                return (
                  <AnimatedPressable
                    key={reason.id}
                    style={[styles.reasonCard, selected && styles.reasonCardActive]}
                    onPress={() => setReasonId(reason.id)}
                    scaleDown={0.97}
                  >
                    <View style={[styles.reasonCheck, selected && styles.reasonCheckActive]}>
                      {selected && <Feather name="check" size={13} color={colors.white} />}
                    </View>
                    <Text style={[styles.reasonLabel, selected && styles.reasonLabelActive]}>
                      {reason.label}
                    </Text>
                    <Text style={styles.reasonDesc}>{reason.desc}</Text>
                  </AnimatedPressable>
                );
              })}
            </View>

            <View style={styles.inputSection}>
              <View style={styles.inputHeader}>
                <Text style={styles.sectionTitleInline}>Ceritakan masalahnya</Text>
                <Text style={styles.inputCounter}>{notes.trim().length}/12 min</Text>
              </View>
              <TextInput
                value={notes}
                onChangeText={setNotes}
                placeholder="Contoh: ukuran dada terlalu kecil dari ukuran pesanan dan jahitan bagian lengan terbuka."
                placeholderTextColor={colors.warmGrayLight}
                multiline
                textAlignVertical="top"
                style={styles.textArea}
              />
              {!!selectedReason && (
                <Text style={styles.inputHint}>Alasan dipilih: {selectedReason.label}</Text>
              )}
            </View>

            <View style={styles.photoSection}>
              <View style={styles.inputHeader}>
                <Text style={styles.sectionTitleInline}>Foto bukti</Text>
                <Text style={styles.inputCounter}>{evidencePhotos.length}/3</Text>
              </View>
              <Text style={styles.photoHelp}>
                Unggah minimal 1 foto yang memperlihatkan kondisi produk, label ukuran, atau bagian yang bermasalah.
              </Text>
              <View style={styles.photoRow}>
                {evidencePhotos.map((photoUri) => (
                  <View key={photoUri} style={styles.photoWrap}>
                    <Image source={{ uri: photoUri }} style={styles.photo} />
                    <AnimatedPressable
                      style={styles.removePhoto}
                      onPress={() => handleRemovePhoto(photoUri)}
                      scaleDown={0.9}
                    >
                      <Feather name="x" size={12} color={colors.white} />
                    </AnimatedPressable>
                  </View>
                ))}
                {evidencePhotos.length < 3 && (
                  <AnimatedPressable
                    style={styles.addPhoto}
                    onPress={handleAddPhoto}
                    disabled={picking}
                    scaleDown={0.95}
                  >
                    <Feather name="camera" size={20} color={colors.forest} />
                    <Text style={styles.addPhotoText}>{picking ? 'Membuka...' : 'Tambah foto'}</Text>
                  </AnimatedPressable>
                )}
              </View>
            </View>

            <View style={styles.checklist}>
              <ChecklistItem done={!!reasonId} text="Alasan retur sudah dipilih" />
              <ChecklistItem done={notes.trim().length >= 12} text="Catatan minimal 12 karakter" />
              <ChecklistItem done={evidencePhotos.length > 0} text="Minimal 1 foto bukti" />
            </View>

            <AnimatedPressable
              style={[styles.submit, !canSubmit && styles.submitDisabled]}
              onPress={handleSubmit}
              disabled={!canSubmit}
            >
              <Text style={styles.submitText}>Kirim Pengajuan Retur</Text>
              <Feather name="arrow-right" size={18} color={colors.white} />
            </AnimatedPressable>
          </>
        )}
      </ScrollView>
    </View>
  );
}

function ExistingRequest({ request, statusMeta, onBack }) {
  return (
    <View style={styles.existingCard}>
      <View style={styles.statusTop}>
        <View style={styles.statusIcon}>
          <Feather name="shield" size={18} color={colors.forest} />
        </View>
        <View style={styles.statusCopy}>
          <Text style={styles.statusLabel}>Retur {statusMeta.label}</Text>
          <Text style={styles.statusDesc}>{statusMeta.desc}</Text>
        </View>
      </View>

      <View style={styles.requestData}>
        <Data label="Nomor retur" value={request.id} />
        <Data label="Tanggal" value={request.createdAtLabel} />
        <Data label="Alasan" value={request.reasonLabel} />
      </View>

      <Text style={styles.requestNotes}>{request.notes}</Text>

      {!!request.evidencePhotos?.length && (
        <View style={styles.existingPhotos}>
          {request.evidencePhotos.map((photoUri) => (
            <Image key={photoUri} source={{ uri: photoUri }} style={styles.existingPhoto} />
          ))}
        </View>
      )}

      <View style={styles.timelineMini}>
        {(request.timeline ?? []).map((item) => (
          <View key={`${item.label}-${item.title}`} style={styles.timelineMiniRow}>
            <View style={styles.timelineMiniDot} />
            <View style={styles.timelineMiniCopy}>
              <Text style={styles.timelineMiniTitle}>{item.title}</Text>
              <Text style={styles.timelineMiniDesc}>{item.label} - {item.desc}</Text>
            </View>
          </View>
        ))}
      </View>

      <AnimatedPressable style={styles.backButton} onPress={onBack}>
        <Text style={styles.backButtonText}>Kembali ke Pesanan</Text>
      </AnimatedPressable>
    </View>
  );
}

function Data({ label, value }) {
  return (
    <View style={styles.dataRow}>
      <Text style={styles.dataLabel}>{label}</Text>
      <Text style={styles.dataValue}>{value}</Text>
    </View>
  );
}

function ChecklistItem({ done, text }) {
  return (
    <View style={styles.checkItem}>
      <View style={[styles.checkIcon, done && styles.checkIconDone]}>
        {done && <Feather name="check" size={12} color={colors.white} />}
      </View>
      <Text style={[styles.checkText, done && styles.checkTextDone]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.ivory,
  },
  content: {
    padding: 20,
  },
  centerState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  emptyIcon: {
    width: 78,
    height: 78,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.sand,
    marginBottom: 18,
  },
  emptyTitle: {
    color: colors.charcoal,
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 6,
  },
  emptyDesc: {
    color: colors.warmGray,
    fontSize: 13,
    textAlign: 'center',
  },
  hero: {
    flexDirection: 'row',
    gap: 14,
    padding: 18,
    borderRadius: 28,
    backgroundColor: colors.forest,
    marginBottom: 14,
    overflow: 'hidden',
    ...shadows.forest,
  },
  heroIcon: {
    width: 52,
    height: 52,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(232,220,200,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(232,220,200,0.24)',
  },
  heroCopy: {
    flex: 1,
  },
  heroKicker: {
    color: colors.sand,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 5,
  },
  heroTitle: {
    color: colors.white,
    fontSize: 18,
    lineHeight: 23,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  heroDesc: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 8,
  },
  orderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 22,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.lightGray,
    marginBottom: 20,
    ...shadows.sm,
  },
  orderImage: {
    width: 68,
    height: 82,
    borderRadius: 16,
    backgroundColor: colors.sand,
  },
  orderInfo: {
    flex: 1,
  },
  orderLabel: {
    color: colors.warmGray,
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  orderTitle: {
    color: colors.charcoal,
    fontSize: 15,
    fontWeight: '900',
    marginTop: 4,
  },
  orderMeta: {
    color: colors.warmGray,
    fontSize: 11,
    marginTop: 5,
  },
  sectionTitle: {
    color: colors.charcoal,
    fontSize: 15,
    fontWeight: '900',
    marginBottom: 10,
  },
  reasonGrid: {
    gap: 10,
    marginBottom: 20,
  },
  reasonCard: {
    minHeight: 86,
    borderRadius: 20,
    padding: 14,
    paddingLeft: 52,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.lightGray,
  },
  reasonCardActive: {
    backgroundColor: colors.successLight,
    borderColor: colors.forest,
  },
  reasonCheck: {
    position: 'absolute',
    top: 16,
    left: 14,
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.sandLight,
    borderWidth: 1,
    borderColor: colors.lightGray,
  },
  reasonCheckActive: {
    backgroundColor: colors.forest,
    borderColor: colors.forest,
  },
  reasonLabel: {
    color: colors.charcoal,
    fontSize: 13,
    fontWeight: '900',
    marginBottom: 5,
  },
  reasonLabelActive: {
    color: colors.forest,
  },
  reasonDesc: {
    color: colors.warmGray,
    fontSize: 11,
    lineHeight: 16,
  },
  inputSection: {
    marginBottom: 18,
  },
  inputHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 9,
  },
  sectionTitleInline: {
    color: colors.charcoal,
    fontSize: 15,
    fontWeight: '900',
  },
  inputCounter: {
    color: colors.warmGrayLight,
    fontSize: 10,
    fontWeight: '800',
  },
  textArea: {
    minHeight: 132,
    borderRadius: 20,
    padding: 15,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.lightGray,
    color: colors.charcoal,
    fontSize: 13,
    lineHeight: 19,
  },
  inputHint: {
    color: colors.forest,
    fontSize: 10,
    fontWeight: '800',
    marginTop: 8,
  },
  photoSection: {
    marginBottom: 18,
  },
  photoHelp: {
    color: colors.warmGray,
    fontSize: 11,
    lineHeight: 16,
    marginBottom: 12,
  },
  photoRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  photoWrap: {
    width: 94,
    height: 94,
    borderRadius: 18,
  },
  photo: {
    width: '100%',
    height: '100%',
    borderRadius: 18,
    backgroundColor: colors.sand,
  },
  removePhoto: {
    position: 'absolute',
    top: -7,
    right: -7,
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.error,
    borderWidth: 2,
    borderColor: colors.ivory,
  },
  addPhoto: {
    width: 124,
    height: 94,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    backgroundColor: colors.sandLight,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.sandDark,
  },
  addPhotoText: {
    color: colors.forest,
    fontSize: 11,
    fontWeight: '900',
  },
  checklist: {
    gap: 8,
    padding: 13,
    borderRadius: 18,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.lightGray,
    marginBottom: 14,
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  checkIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.lightGray,
  },
  checkIconDone: {
    backgroundColor: colors.forest,
  },
  checkText: {
    color: colors.warmGray,
    fontSize: 11,
    fontWeight: '700',
  },
  checkTextDone: {
    color: colors.forest,
  },
  submit: {
    minHeight: 58,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: colors.forest,
    ...shadows.forest,
  },
  submitDisabled: {
    opacity: 0.45,
  },
  submitText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '900',
  },
  policyCard: {
    flexDirection: 'row',
    gap: 13,
    padding: 16,
    borderRadius: 22,
    backgroundColor: colors.sandLight,
    borderWidth: 1,
    borderColor: colors.sandDark,
  },
  policyIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
  },
  policyTextWrap: {
    flex: 1,
  },
  policyTitle: {
    color: colors.charcoal,
    fontSize: 13,
    fontWeight: '900',
    marginBottom: 5,
  },
  policyDesc: {
    color: colors.warmGray,
    fontSize: 11,
    lineHeight: 16,
  },
  existingCard: {
    borderRadius: 24,
    padding: 16,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.lightGray,
    ...shadows.sm,
  },
  statusTop: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
  },
  statusIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.successLight,
  },
  statusCopy: {
    flex: 1,
  },
  statusLabel: {
    color: colors.forest,
    fontSize: 14,
    fontWeight: '900',
  },
  statusDesc: {
    color: colors.warmGray,
    fontSize: 11,
    lineHeight: 16,
    marginTop: 5,
  },
  requestData: {
    gap: 8,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.lightGray,
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  dataLabel: {
    color: colors.warmGray,
    fontSize: 11,
  },
  dataValue: {
    flex: 1,
    color: colors.charcoal,
    fontSize: 11,
    fontWeight: '900',
    textAlign: 'right',
  },
  requestNotes: {
    color: colors.charcoal,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 13,
  },
  existingPhotos: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
  },
  existingPhoto: {
    width: 72,
    height: 72,
    borderRadius: 15,
    backgroundColor: colors.sand,
  },
  timelineMini: {
    gap: 10,
    marginTop: 15,
  },
  timelineMiniRow: {
    flexDirection: 'row',
    gap: 9,
  },
  timelineMiniDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.forest,
    marginTop: 4,
  },
  timelineMiniCopy: {
    flex: 1,
  },
  timelineMiniTitle: {
    color: colors.charcoal,
    fontSize: 11,
    fontWeight: '900',
  },
  timelineMiniDesc: {
    color: colors.warmGray,
    fontSize: 10,
    lineHeight: 15,
    marginTop: 2,
  },
  backButton: {
    minHeight: 50,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.forest,
    marginTop: 16,
  },
  backButtonText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '900',
  },
});
