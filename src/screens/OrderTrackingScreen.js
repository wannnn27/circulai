import React, { useEffect, useState } from 'react';
import { Alert, Image, Linking, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import AnimatedPressable from '../components/AnimatedPressable';
import FlowHeader from '../components/FlowHeader';
import { canRequestReturn, getOrderTimeline, orderStatusIndex, returnStatusMeta } from '../data/appData';
import { useAppState } from '../state/AppContext';
import { colors, shadows } from '../theme/colors';

export default function OrderTrackingScreen({ orderId, onBack, onViewDetails, onChatTailor, onRequestReturn }) {
  const insets = useSafeAreaInsets();
  const { orders, updateOrderStatus, createMidtransPayment, backend } = useAppState();
  const [now, setNow] = useState(Date.now());
  const [openingPayment, setOpeningPayment] = useState(false);
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);
  const order = orders.find((item) => item.id === orderId);
  if (!order) return <View style={styles.screen}><FlowHeader title="Tracking Pesanan" onBack={onBack} /><Text style={styles.notFound}>Pesanan tidak ditemukan.</Text></View>;

  const timeline = getOrderTimeline(order);
  const currentIndex = orderStatusIndex(order.status);
  const current = timeline[currentIndex];
  const shipped = ['SHIPPED', 'DELIVERED', 'COMPLETED'].includes(order.status);
  const returnable = canRequestReturn(order);
  const returnMeta = order.returnRequest
    ? returnStatusMeta[order.returnRequest.status] ?? returnStatusMeta.REVIEWING
    : null;
  const paymentExpired =
    order.status === 'WAITING_PAYMENT' &&
    order.paymentData?.expiresAt &&
    new Date(order.paymentData.expiresAt).getTime() <= now;
  const continuePayment = async () => {
    if (openingPayment) return;
    setOpeningPayment(true);
    try {
      const payment = await createMidtransPayment(order.id);
      if (payment?.redirectUrl) await Linking.openURL(payment.redirectUrl);
      await backend.refresh({ silent: true });
    } catch (error) {
      Alert.alert('Midtrans belum dapat dibuka', error?.message ?? 'Silakan coba lagi beberapa saat.');
    } finally {
      setOpeningPayment(false);
    }
  };

  return (
    <View style={styles.screen}>
      <FlowHeader title="Tracking Pesanan" subtitle={order.id} onBack={onBack} />
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: Math.max(insets.bottom, 16) + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <Image source={{ uri: order.image }} style={styles.image} />
          <View style={styles.heroInfo}><Text style={styles.product}>{order.product}</Text><Text style={styles.tailor}>oleh {order.tailor}</Text><Text style={styles.status}>{current.label}</Text></View>
          <Text style={styles.percent}>{Math.round(((currentIndex + 1) / timeline.length) * 100)}%</Text>
        </View>
        <View style={styles.estimateCard}><Feather name="clock" size={16} color={colors.forest} /><View><Text style={styles.estimateLabel}>Estimasi tahap sekarang</Text><Text style={styles.estimateValue}>{current.estimate}</Text></View></View>

        <Text style={styles.sectionTitle}>Timeline Made-to-Order</Text>
        <View style={styles.timelineCard}>
          {timeline.map((step, index) => {
            const completed = step.state === 'completed';
            const active = step.state === 'current';
            const history = order.statusHistory?.find((item) => item.status === step.id);
            return (
              <View key={step.id} style={styles.timelineRow}>
                <View style={styles.rail}>
                  <View style={[styles.dot, (completed || active) && styles.dotActive]}>{completed ? <Feather name="check" size={11} color={colors.white} /> : active ? <View style={styles.dotInner} /> : null}</View>
                  {index < timeline.length - 1 && <View style={[styles.line, completed && styles.lineActive]} />}
                </View>
                <View style={styles.stepInfo}>
                  <View style={styles.stepTop}><Text style={[styles.stepTitle, active && styles.stepTitleActive]}>{step.label}</Text><Text style={styles.stepEstimate}>{step.estimate}</Text></View>
                  <Text style={styles.stepDesc}>{step.desc}</Text>
                  {!!history && <Text style={styles.history}>{history.label} - {history.note}</Text>}
                </View>
              </View>
            );
          })}
        </View>

        <Text style={styles.sectionTitle}>Informasi Tailor</Text>
        {(order.tailorProfiles?.length ? order.tailorProfiles : [order.tailorProfile]).map((tailor, index) => (
          <View key={tailor?.id ?? tailor?.name ?? index} style={[styles.tailorCard, index > 0 && styles.tailorSpacing]}>
            <View style={styles.tailorIcon}><Feather name="user" size={20} color={colors.forest} /></View>
            <View style={styles.tailorInfo}><Text style={styles.tailorName}>{tailor?.name ?? order.tailor}</Text><Text style={styles.tailorMeta}>{tailor?.specialty}</Text><Text style={styles.tailorMeta}>{tailor?.city ?? order.tailorCity} - {tailor?.experience}</Text></View>
            <AnimatedPressable
              style={styles.chatTailor}
              onPress={() => onChatTailor(tailor?.name ?? order.tailor, order)}
              scaleDown={0.9}
            >
              <Feather name="message-circle" size={16} color={colors.forest} />
            </AnimatedPressable>
          </View>
        ))}

        {shipped && <><Text style={styles.sectionTitle}>Tracking Paket</Text><View style={styles.shipment}><Data label="Kurir" value={order.courier} /><Data label="Nomor resi" value={order.trackingCode} /><Data label="Status" value={order.shipmentStatus} /></View></>}

        {paymentExpired && <View style={styles.expiredNotice}><Feather name="alert-circle" size={15} color={colors.error} /><Text style={styles.expiredText}>Batas pembayaran telah berakhir.</Text></View>}
        {order.status === 'WAITING_PAYMENT' && !paymentExpired && <AnimatedPressable style={[styles.primary, openingPayment && styles.disabled]} disabled={openingPayment} onPress={continuePayment}><Text style={styles.primaryText}>{openingPayment ? 'Membuka Midtrans...' : 'Lanjutkan Pembayaran'}</Text></AnimatedPressable>}
        {order.status === 'DELIVERED' && <AnimatedPressable style={styles.primary} onPress={() => updateOrderStatus(order.id, 'COMPLETED', 'customer')}><Text style={styles.primaryText}>Konfirmasi Pesanan Diterima</Text></AnimatedPressable>}
        {(returnable || order.returnRequest) && (
          <AnimatedPressable
            style={styles.returnButton}
            onPress={() => onRequestReturn(order.id)}
            scaleDown={0.97}
          >
            <View style={styles.returnButtonIcon}>
              <Feather name="rotate-ccw" size={17} color={colors.forest} />
            </View>
            <View style={styles.returnButtonCopy}>
              <Text style={styles.returnButtonTitle}>
                {order.returnRequest ? `Retur ${returnMeta.label}` : 'Ajukan Pengembalian'}
              </Text>
              <Text style={styles.returnButtonDesc}>
                {order.returnRequest
                  ? `${order.returnRequest.reasonLabel} - ${order.returnRequest.id}`
                  : 'Upload foto bukti dan alasan kalau produk tidak sesuai.'}
              </Text>
            </View>
            <Feather name="chevron-right" size={18} color={colors.warmGrayLight} />
          </AnimatedPressable>
        )}
        <AnimatedPressable style={styles.secondary} onPress={() => onViewDetails(order)}><Text style={styles.secondaryText}>Detail & Circular Passport</Text></AnimatedPressable>
      </ScrollView>
    </View>
  );
}

function Data({ label, value }) {
  return <View style={styles.data}><Text style={styles.dataLabel}>{label}</Text><Text style={styles.dataValue}>{value}</Text></View>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.ivory },
  content: { padding: 20, paddingBottom: 40 },
  notFound: { color: colors.warmGray, textAlign: 'center', marginTop: 80 },
  hero: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 20, backgroundColor: colors.forest, ...shadows.md },
  image: { width: 64, height: 76, borderRadius: 14, backgroundColor: colors.sand },
  heroInfo: { flex: 1 },
  product: { color: colors.white, fontSize: 14, fontWeight: '900' },
  tailor: { color: 'rgba(255,255,255,0.65)', fontSize: 9, marginTop: 2 },
  status: { color: colors.sand, fontSize: 10, fontWeight: '900', marginTop: 9 },
  percent: { color: colors.white, fontSize: 19, fontWeight: '900' },
  estimateCard: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 13, borderRadius: 16, backgroundColor: colors.sand, marginTop: 10 },
  estimateLabel: { color: colors.warmGray, fontSize: 9 },
  estimateValue: { color: colors.forest, fontSize: 12, fontWeight: '900', marginTop: 1 },
  sectionTitle: { color: colors.charcoal, fontSize: 14, fontWeight: '900', marginTop: 22, marginBottom: 10 },
  timelineCard: { padding: 14, borderRadius: 20, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.lightGray },
  timelineRow: { flexDirection: 'row', minHeight: 82 },
  rail: { width: 28, alignItems: 'center' },
  dot: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.lightGray },
  dotActive: { backgroundColor: colors.forest },
  dotInner: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.white },
  line: { flex: 1, width: 2, backgroundColor: colors.lightGray },
  lineActive: { backgroundColor: colors.forest },
  stepInfo: { flex: 1, paddingLeft: 8, paddingBottom: 14 },
  stepTop: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  stepTitle: { flex: 1, color: colors.warmGray, fontSize: 11, fontWeight: '800' },
  stepTitleActive: { color: colors.forest, fontWeight: '900' },
  stepEstimate: { color: colors.warmGrayLight, fontSize: 8, fontWeight: '700' },
  stepDesc: { color: colors.warmGray, fontSize: 9, lineHeight: 13, marginTop: 3 },
  history: { color: colors.success, fontSize: 8, fontWeight: '700', marginTop: 5 },
  tailorCard: { flexDirection: 'row', alignItems: 'center', gap: 11, padding: 14, borderRadius: 18, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.lightGray },
  tailorSpacing: { marginTop: 8 },
  tailorIcon: { width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.sand },
  tailorInfo: { flex: 1 },
  tailorName: { color: colors.charcoal, fontSize: 12, fontWeight: '900' },
  tailorMeta: { color: colors.warmGray, fontSize: 9, marginTop: 2 },
  chatTailor: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.successLight },
  shipment: { padding: 14, borderRadius: 18, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.lightGray },
  data: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, marginBottom: 9 },
  dataLabel: { color: colors.warmGray, fontSize: 10 },
  dataValue: { flex: 1, color: colors.charcoal, fontSize: 10, fontWeight: '800', textAlign: 'right' },
  primary: { minHeight: 56, alignItems: 'center', justifyContent: 'center', borderRadius: 18, paddingHorizontal: 20, paddingVertical: 14, backgroundColor: colors.forest, marginTop: 18, ...shadows.forest },
  primaryText: { color: colors.white, fontSize: 12, lineHeight: 17, fontWeight: '900', textAlign: 'center' },
  returnButton: { minHeight: 68, flexDirection: 'row', alignItems: 'center', gap: 12, padding: 13, borderRadius: 18, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.lightGray, marginTop: 10, ...shadows.sm },
  returnButtonIcon: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.successLight },
  returnButtonCopy: { flex: 1 },
  returnButtonTitle: { color: colors.charcoal, fontSize: 12, fontWeight: '900' },
  returnButtonDesc: { color: colors.warmGray, fontSize: 9, lineHeight: 13, marginTop: 3 },
  secondary: { minHeight: 52, alignItems: 'center', justifyContent: 'center', borderRadius: 17, paddingHorizontal: 20, paddingVertical: 13, borderWidth: 1.5, borderColor: colors.forest, marginTop: 10 },
  secondaryText: { color: colors.forest, fontSize: 12, lineHeight: 17, fontWeight: '900', textAlign: 'center' },
  expiredNotice: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, borderRadius: 15, backgroundColor: colors.errorLight, marginTop: 18 },
  expiredText: { color: colors.error, fontSize: 10, fontWeight: '800' },
  disabled: { opacity: 0.45 },
});
