import React, { useEffect, useState } from 'react';
import { Alert, Linking, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import AnimatedPressable from '../components/AnimatedPressable';
import { useAppState } from '../state/AppContext';
import { colors, shadows } from '../theme/colors';

export default function OrderConfirmationScreen({ order, onTrack, onOrders }) {
  const insets = useSafeAreaInsets();
  const { createMidtransPayment } = useAppState();
  const [loading, setLoading] = useState(false);
  const [remaining, setRemaining] = useState(() => getRemainingTime(order?.paymentData?.expiresAt));

  useEffect(() => {
    const timer = setInterval(() => {
      setRemaining(getRemainingTime(order?.paymentData?.expiresAt));
    }, 1000);
    return () => clearInterval(timer);
  }, [order?.paymentData?.expiresAt]);

  if (!order) return null;
  const isTransfer = order.paymentMethod?.id === 'BANK_TRANSFER';
  const expired = remaining === '00:00:00';

  const continuePayment = async () => {
    if (expired) {
      Alert.alert('Waktu pembayaran habis', 'Pesanan tidak dapat dibayar setelah batas pembayaran berakhir.');
      return;
    }
    if (loading) return;
    setLoading(true);
    try {
      const payment = await createMidtransPayment(order.id);
      if (payment?.redirectUrl) await Linking.openURL(payment.redirectUrl);
    } catch (error) {
      Alert.alert('Midtrans belum dapat dibuka', error?.message ?? 'Silakan coba lagi beberapa saat.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingBottom: Math.max(insets.bottom, 20) + 28 }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.successIcon}><Feather name="check" size={32} color={colors.white} /></View>
      <Text style={styles.title}>Pesanan Berhasil Dibuat</Text>
      <Text style={styles.subtitle}>Detail pesanan sudah dikirim ke sistem CIRCULAI dan menunggu pembayaran.</Text>
      <View style={styles.orderIdCard}>
        <Text style={styles.orderIdLabel}>ORDER ID</Text>
        <Text style={styles.orderId}>{order.id}</Text>
        <Text style={styles.orderProduct}>{order.product}</Text>
      </View>
      <View style={styles.paymentCard}>
        <View style={styles.paymentHeader}><Feather name={isTransfer ? 'credit-card' : 'maximize'} size={18} color={colors.forest} /><Text style={styles.paymentTitle}>Instruksi Pembayaran</Text></View>
        <Data label="Metode" value={order.paymentMethod?.label} />
        {isTransfer && <Data label="Nomor Virtual Account" value={order.paymentData?.vaNumber} />}
        <Data label="Jumlah" value={order.paymentData?.amount} strong />
        <Data label="Sisa waktu" value={remaining} />
      </View>
      <View style={styles.notice}><Feather name="info" size={15} color={colors.info} /><Text style={styles.noticeText}>Produksi baru dimulai setelah pembayaran dikonfirmasi.</Text></View>
      <AnimatedPressable style={[styles.primary, (expired || loading) && styles.disabled]} disabled={expired || loading} onPress={continuePayment}>
        <Feather name="external-link" size={17} color={colors.white} />
        <Text style={styles.primaryText}>{loading ? 'Membuka Midtrans...' : 'Lanjutkan Pembayaran'}</Text>
      </AnimatedPressable>
      <AnimatedPressable style={styles.secondary} onPress={() => onTrack(order.id)}><Text style={styles.secondaryText}>Lihat Status Pesanan</Text></AnimatedPressable>
      <AnimatedPressable style={styles.secondary} onPress={onOrders}><Text style={styles.secondaryText}>Lihat Semua Pesanan</Text></AnimatedPressable>
    </ScrollView>
  );
}

function getRemainingTime(expiresAt) {
  if (!expiresAt) return '23:59:59';
  const totalSeconds = Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000));
  const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
  const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
  const seconds = String(totalSeconds % 60).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
}

function Data({ label, value, strong }) {
  return <View style={styles.data}><Text style={styles.dataLabel}>{label}</Text><Text style={[styles.dataValue, strong && styles.strong]}>{value || '-'}</Text></View>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.ivory },
  content: { alignItems: 'center', padding: 24, paddingTop: 48, paddingBottom: 40 },
  successIcon: { width: 72, height: 72, borderRadius: 24, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.success, ...shadows.lg },
  title: { color: colors.charcoal, fontSize: 22, fontWeight: '900', textAlign: 'center', marginTop: 20 },
  subtitle: { maxWidth: 310, color: colors.warmGray, fontSize: 12, lineHeight: 18, textAlign: 'center', marginTop: 7 },
  orderIdCard: { width: '100%', alignItems: 'center', padding: 17, borderRadius: 20, backgroundColor: colors.forest, marginTop: 24 },
  orderIdLabel: { color: 'rgba(255,255,255,0.55)', fontSize: 8, fontWeight: '900', letterSpacing: 1 },
  orderId: { color: colors.white, fontSize: 22, fontWeight: '900', marginTop: 3 },
  orderProduct: { color: colors.sand, fontSize: 10, marginTop: 4 },
  paymentCard: { width: '100%', padding: 16, borderRadius: 20, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.lightGray, marginTop: 14, ...shadows.sm },
  paymentHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  paymentTitle: { color: colors.charcoal, fontSize: 14, fontWeight: '900' },
  data: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, marginBottom: 10 },
  dataLabel: { color: colors.warmGray, fontSize: 10 },
  dataValue: { flex: 1, color: colors.charcoal, fontSize: 11, fontWeight: '800', textAlign: 'right' },
  strong: { color: colors.forest, fontSize: 15, fontWeight: '900' },
  notice: { width: '100%', flexDirection: 'row', gap: 8, padding: 12, borderRadius: 15, backgroundColor: colors.infoLight, marginTop: 12 },
  noticeText: { flex: 1, color: colors.info, fontSize: 10, lineHeight: 15, fontWeight: '700' },
  primary: { width: '100%', minHeight: 56, flexDirection: 'row', gap: 9, alignItems: 'center', justifyContent: 'center', borderRadius: 18, paddingHorizontal: 20, paddingVertical: 14, backgroundColor: colors.forest, marginTop: 16, ...shadows.forest },
  primaryText: { color: colors.white, fontSize: 13, lineHeight: 18, fontWeight: '900', textAlign: 'center' },
  disabled: { opacity: 0.4 },
  secondary: { width: '100%', minHeight: 52, alignItems: 'center', justifyContent: 'center', borderRadius: 17, paddingHorizontal: 20, paddingVertical: 13, borderWidth: 1.5, borderColor: colors.forest, marginTop: 10 },
  secondaryText: { color: colors.forest, fontSize: 12, lineHeight: 17, fontWeight: '900', textAlign: 'center' },
});
