import React, { useState } from 'react';
import { Alert, Linking, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import AnimatedPressable from '../components/AnimatedPressable';
import FlowHeader from '../components/FlowHeader';
import { formatCurrency } from '../data/appData';
import { useAppState } from '../state/AppContext';
import { colors, shadows } from '../theme/colors';

export default function PaymentScreen({ address, onBack, onComplete }) {
  const insets = useSafeAreaInsets();
  const { cart, cartSummary, paymentMethods, placeOrder, createMidtransPayment, userVouchers = [] } = useAppState();
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedVoucherId, setSelectedVoucherId] = useState(null);
  const [loading, setLoading] = useState(false);

  const activeVoucher = userVouchers.find((v) => v.id === selectedVoucherId && !v.used);
  const voucherDiscount = activeVoucher
    ? activeVoucher.type === 'shipping'
      ? Math.min(cartSummary.shipping, activeVoucher.value)
      : activeVoucher.value
    : 0;

  const finalTotal = Math.max(0, cartSummary.total - voucherDiscount);

  const availableMethods = [
    paymentMethods.find((item) => item.id === 'MIDTRANS_SNAP') ?? {
      id: 'MIDTRANS_SNAP',
      label: 'Midtrans Checkout',
      desc: 'QRIS, e-wallet, kartu, dan virtual account',
      icon: 'credit-card'
    }
  ];
  const selectedMethod = availableMethods.find((item) => item.id === selectedId);

  const handlePay = async () => {
    if (!selectedMethod || loading) return;
    setLoading(true);
    try {
      const order = await placeOrder({ address, paymentMethod: selectedMethod, total: finalTotal });
      if (!order) {
        Alert.alert('Checkout gagal', 'Keranjang, alamat, atau metode pembayaran tidak valid.');
        return;
      }
      if (selectedMethod.id === 'MIDTRANS_SNAP') {
        try {
          const payment = await createMidtransPayment(order.id);
          if (payment?.redirectUrl) await Linking.openURL(payment.redirectUrl);
        } catch (error) {
          Alert.alert(
            'Pesanan sudah dibuat',
            error?.message ?? 'Midtrans belum dapat dibuka. Kamu dapat mencoba pembayaran lagi dari detail pesanan.'
          );
        }
      }
      onComplete(order);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.screen}>
      <FlowHeader title="Pembayaran" subtitle="Ringkasan final tidak dapat diubah" onBack={onBack} />
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: Math.max(insets.bottom, 16) + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.finalCard}>
          <Text style={styles.sectionTitle}>Ringkasan Order</Text>
          <Info label="Item" value={`${itemCount} item made-to-order`} />
          <Info label="Dikirim ke" value={`${address.label} - ${address.receiver}`} />
          <Info label="Alamat" value={address.detail} />
          {activeVoucher && (
            <Info label="Voucher" value={`${activeVoucher.label} (-${formatCurrency(voucherDiscount)})`} strong />
          )}
          <View style={styles.divider} />
          <Info label="Total Pembayaran" value={formatCurrency(finalTotal)} strong />
        </View>

        {userVouchers.length > 0 && (
          <>
            <Text style={styles.sectionHeader}>Gunakan Voucher Circular Points</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
              <AnimatedPressable
                style={[styles.voucherChip, !selectedVoucherId && styles.voucherChipActive]}
                onPress={() => setSelectedVoucherId(null)}
              >
                <Text style={[styles.voucherChipText, !selectedVoucherId && styles.voucherChipTextActive]}>
                  Tanpa Voucher
                </Text>
              </AnimatedPressable>
              {userVouchers.filter((v) => !v.used).map((voucher) => {
                const active = selectedVoucherId === voucher.id;
                return (
                  <AnimatedPressable
                    key={voucher.id}
                    style={[styles.voucherChip, active && styles.voucherChipActive]}
                    onPress={() => setSelectedVoucherId(active ? null : voucher.id)}
                  >
                    <Feather name="tag" size={12} color={active ? colors.white : colors.forest} />
                    <Text style={[styles.voucherChipText, active && styles.voucherChipTextActive]}>
                      {voucher.label}
                    </Text>
                  </AnimatedPressable>
                );
              })}
            </ScrollView>
          </>
        )}
        <Text style={styles.sectionHeader}>Pilih Metode Pembayaran</Text>
        {availableMethods.map((method) => {
          const active = selectedId === method.id;
          return (
            <AnimatedPressable key={method.id} style={[styles.method, active && styles.methodActive]} onPress={() => setSelectedId(method.id)}>
              <View style={styles.methodIcon}><Feather name={method.icon} size={18} color={colors.forest} /></View>
              <View style={styles.methodInfo}><Text style={styles.methodName}>{method.label}</Text><Text style={styles.methodDesc}>{method.desc}</Text></View>
              <View style={[styles.radio, active && styles.radioActive]}>{active && <View style={styles.dot} />}</View>
            </AnimatedPressable>
          );
        })}
        <View style={styles.timer}>
          <Feather name="clock" size={15} color={colors.warning} />
          <View><Text style={styles.timerLabel}>Batas pembayaran setelah order dibuat</Text><Text style={styles.timerValue}>24 jam</Text></View>
        </View>
        <AnimatedPressable style={[styles.primary, !selectedMethod && styles.disabled]} disabled={!selectedMethod || loading} onPress={handlePay}>
          <Text style={styles.primaryText}>{loading ? 'Memproses...' : 'Buat Pesanan & Bayar'}</Text>
          <Feather name="lock" size={16} color={colors.white} />
        </AnimatedPressable>
      </ScrollView>
    </View>
  );
}

function Info({ label, value, strong }) {
  return <View style={styles.infoRow}><Text style={styles.infoLabel}>{label}</Text><Text style={[styles.infoValue, strong && styles.strong]}>{value}</Text></View>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.ivory },
  content: { padding: 20, paddingBottom: 40 },
  finalCard: { padding: 16, borderRadius: 20, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.lightGray, ...shadows.sm },
  sectionTitle: { color: colors.charcoal, fontSize: 14, fontWeight: '900', marginBottom: 12 },
  sectionHeader: { color: colors.charcoal, fontSize: 14, fontWeight: '900', marginTop: 22, marginBottom: 10 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 14, marginBottom: 10 },
  infoLabel: { width: 92, color: colors.warmGray, fontSize: 10 },
  infoValue: { flex: 1, color: colors.charcoal, fontSize: 10, lineHeight: 15, fontWeight: '800', textAlign: 'right' },
  strong: { color: colors.forest, fontSize: 17, fontWeight: '900' },
  divider: { height: 1, backgroundColor: colors.lightGray, marginBottom: 12 },
  voucherChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.lightGray, marginRight: 8 },
  voucherChipActive: { backgroundColor: colors.forest, borderColor: colors.forest },
  voucherChipText: { fontSize: 11, fontWeight: '700', color: colors.charcoal },
  voucherChipTextActive: { color: colors.white },
  method: { flexDirection: 'row', alignItems: 'center', gap: 11, padding: 13, borderRadius: 17, backgroundColor: colors.white, borderWidth: 1.5, borderColor: colors.lightGray, marginBottom: 9 },
  methodActive: { borderColor: colors.forest, backgroundColor: colors.successLight },
  methodIcon: { width: 40, height: 40, borderRadius: 13, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.sand },
  methodInfo: { flex: 1, minWidth: 0 },
  methodName: { color: colors.charcoal, fontSize: 12, fontWeight: '900' },
  methodDesc: { color: colors.warmGray, fontSize: 9, marginTop: 2 },
  radio: { width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: colors.lightGrayDark },
  radioActive: { borderColor: colors.forest },
  dot: { width: 9, height: 9, borderRadius: 5, backgroundColor: colors.forest },
  timer: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 13, borderRadius: 16, backgroundColor: colors.warningLight, marginTop: 12 },
  timerLabel: { color: colors.warmGray, fontSize: 9 },
  timerValue: { color: colors.warning, fontSize: 14, fontWeight: '900', marginTop: 1 },
  primary: { minHeight: 56, flexDirection: 'row', gap: 9, alignItems: 'center', justifyContent: 'center', borderRadius: 18, paddingHorizontal: 20, paddingVertical: 14, backgroundColor: colors.forest, marginTop: 14, ...shadows.forest },
  disabled: { opacity: 0.4 },
  primaryText: { color: colors.white, fontSize: 13, lineHeight: 18, fontWeight: '900', textAlign: 'center' },
});
