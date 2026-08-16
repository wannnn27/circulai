import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

import AnimatedPressable from './AnimatedPressable';
import { colors, shadows } from '../theme/colors';
import { canRequestReturn, orderStatusIndex, orderSteps, returnStatusMeta } from '../data/appData';

// Status icon and color mapping
const statusConfig = {
  WAITING_PAYMENT: { icon: 'clock', color: colors.warning, label: 'Menunggu Bayar' },
  PAYMENT_CONFIRMED: { icon: 'check-circle', color: colors.info, label: 'Dibayar' },
  IN_PRODUCTION: { icon: 'tool', color: colors.warning, label: 'Produksi' },
  QUALITY_CHECK: { icon: 'shield', color: colors.forest, label: 'Quality Check' },
  SHIPPED: { icon: 'truck', color: colors.info, label: 'Dikirim' },
  DELIVERED: { icon: 'package', color: colors.success, label: 'Diterima' },
  COMPLETED: { icon: 'award', color: colors.success, label: 'Selesai' },
};

export default function OrderCard({ order, onDetail, onTracking, onPassport, onChat, onReturn, onPayOrder }) {
  const currentIndex = orderStatusIndex(order.status);
  const currentStep = orderSteps[currentIndex];
  const statusCfg = statusConfig[order.status] ?? statusConfig.WAITING_PAYMENT;
  const isUnpaid = order.status === 'WAITING_PAYMENT';
  const returnable = canRequestReturn(order);
  const returnMeta = order.returnRequest
    ? returnStatusMeta[order.returnRequest.status] ?? returnStatusMeta.REVIEWING
    : null;

  const handlePrimaryPress = () => {
    if (isUnpaid && onPayOrder) {
      onPayOrder(order);
    } else {
      onTracking();
    }
  };

  return (
    <View style={styles.card}>
      {/* ─── Order Summary Row ─────────────────────────────────────────── */}
      <View style={styles.top}>
        <Image source={{ uri: order.image }} style={styles.image} />
        <View style={styles.titleArea}>
          <View style={styles.titleRow}>
            <Text style={styles.title} numberOfLines={1}>{order.product}</Text>
            {/* Status badge */}
            <View style={[styles.statusBadge, { backgroundColor: `${statusCfg.color}18` }]}>
              <Feather name={statusCfg.icon} size={10} color={statusCfg.color} />
              <Text style={[styles.statusText, { color: statusCfg.color }]}>
                {statusCfg.label}
              </Text>
            </View>
          </View>

          <View style={styles.tailorRow}>
            <Text style={styles.tailor}>by {order.tailor}</Text>
            <View style={styles.orderTypeBadge}>
              <Text style={styles.orderTypeText}>
                {order.orderType === 'custom' ? 'CUSTOM' : 'KATALOG'}
              </Text>
            </View>
          </View>

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Feather name="map-pin" size={11} color={colors.warmGray} />
              <Text style={styles.metaText}>{order.tailorCity}</Text>
            </View>
            <View style={styles.metaItem}>
              <Feather name="clock" size={11} color={colors.warmGray} />
              <Text style={styles.metaText}>{order.eta}</Text>
            </View>
          </View>

          <View style={styles.priceRow}>
            <Text style={styles.price}>{order.price}</Text>
            <Text style={styles.orderId}># {order.id}</Text>
          </View>
        </View>
      </View>

      {/* ─── Production Timeline ───────────────────────────────────────── */}
      <View style={styles.timeline}>
        {/* Current step indicator */}
        <View style={styles.currentStep}>
          <View style={[styles.stepIconCircle, { backgroundColor: statusCfg.color }]}>
            <Feather name={statusCfg.icon} size={13} color={colors.white} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.currentStepTitle, { color: statusCfg.color }]}>
              {currentStep.label}
            </Text>
            <Text style={styles.currentStepDesc}>{currentStep.desc}</Text>
          </View>
          {/* Fabric saved badge */}
          <View style={styles.fabricBadge}>
            <MaterialCommunityIcons name="leaf" size={10} color={colors.forest} />
            <Text style={styles.fabricText}>{order.savedFabric}</Text>
          </View>
        </View>

        {/* Segmented progress bar */}
        <View style={styles.progressBar}>
          {orderSteps.map((step, index) => (
            <View
              key={step.id}
              style={[
                styles.progressSegment,
                index <= currentIndex && { backgroundColor: statusCfg.color },
                index === currentIndex && styles.progressSegmentCurrent,
              ]}
            />
          ))}
        </View>
        <View style={styles.progressLabels}>
          <Text style={styles.progressLabel}>Pembayaran</Text>
          <Text style={styles.progressLabel}>
            {Math.round(((currentIndex + 1) / orderSteps.length) * 100)}% selesai
          </Text>
          <Text style={styles.progressLabel}>Selesai</Text>
        </View>
      </View>

      {/* ─── Action Buttons ────────────────────────────────────────────── */}


      {!!order.returnRequest && (
        <AnimatedPressable style={styles.returnNotice} onPress={onReturn} scaleDown={0.98}>
          <View style={styles.returnNoticeIcon}>
            <Feather name="rotate-ccw" size={13} color={colors.forest} />
          </View>
          <View style={styles.returnNoticeCopy}>
            <Text style={styles.returnNoticeTitle}>Retur {returnMeta.label}</Text>
            <Text style={styles.returnNoticeDesc} numberOfLines={1}>
              {order.returnRequest.reasonLabel} - {order.returnRequest.id}
            </Text>
          </View>
          <Feather name="chevron-right" size={16} color={colors.warmGrayLight} />
        </AnimatedPressable>
      )}

      <View style={styles.actions}>
        <AnimatedPressable
          style={[styles.primaryAction, isUnpaid && styles.unpaidPrimaryAction]}
          onPress={handlePrimaryPress}
          scaleDown={0.97}
        >
          <Feather name={isUnpaid ? 'credit-card' : 'navigation'} size={15} color={colors.white} />
          <Text style={styles.primaryActionText}>{isUnpaid ? 'Bayar Sekarang' : 'Lacak Pesanan'}</Text>
        </AnimatedPressable>

        <AnimatedPressable style={styles.iconAction} onPress={onDetail} scaleDown={0.92}>
          <Feather name="file-text" size={17} color={colors.forest} />
        </AnimatedPressable>

        <AnimatedPressable style={styles.iconAction} onPress={onPassport} scaleDown={0.92}>
          <MaterialCommunityIcons name="qrcode-scan" size={17} color={colors.forest} />
        </AnimatedPressable>

        <AnimatedPressable style={styles.iconAction} onPress={onChat} scaleDown={0.92}>
          <Feather name="message-circle" size={17} color={colors.forest} />
        </AnimatedPressable>

        {(returnable || order.returnRequest) && (
          <AnimatedPressable style={styles.iconAction} onPress={onReturn} scaleDown={0.92}>
            <Feather name="rotate-ccw" size={17} color={colors.forest} />
          </AnimatedPressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 28,
    backgroundColor: colors.white,
    marginBottom: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
    paddingBottom: 6,
    ...shadows.md,
  },
  top: {
    flexDirection: 'row',
    gap: 16,
    padding: 18,
    paddingBottom: 16,
  },
  image: {
    width: 96,
    height: 118,
    borderRadius: 20,
    backgroundColor: colors.sand,
  },
  titleArea: {
    flex: 1,
    minWidth: 0,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 3,
  },
  title: {
    flex: 1,
    color: colors.charcoal,
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: 9999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  statusText: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  tailor: {
    color: colors.warmGray,
    fontSize: 11,
    fontWeight: '500',
  },
  tailorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  orderTypeBadge: {
    borderRadius: 9999,
    paddingHorizontal: 6,
    paddingVertical: 3,
    backgroundColor: colors.successLight,
  },
  orderTypeText: {
    color: colors.forest,
    fontSize: 7,
    fontWeight: '900',
    letterSpacing: 0.4,
  },
  metaRow: {
    gap: 5,
    marginBottom: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  metaText: {
    color: colors.warmGray,
    fontSize: 11,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  price: {
    color: colors.forest,
    fontSize: 14,
    fontWeight: '900',
  },
  orderId: {
    color: colors.warmGrayLight,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  // ─── Timeline ──────────────────────────────────────────────────────────────
  timeline: {
    marginHorizontal: 18,
    marginBottom: 8,
    borderRadius: 20,
    padding: 16,
    backgroundColor: colors.sandLight,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
  },
  currentStep: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 13,
  },
  stepIconCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  currentStepTitle: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.1,
  },
  currentStepDesc: {
    color: colors.warmGray,
    fontSize: 11,
    marginTop: 2,
    fontWeight: '500',
  },
  fabricBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.successLight,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 9999,
  },
  fabricText: {
    color: colors.success,
    fontSize: 9,
    fontWeight: '800',
  },
  progressBar: {
    flexDirection: 'row',
    gap: 3,
  },
  progressSegment: {
    flex: 1,
    height: 5,
    borderRadius: 9999,
    backgroundColor: colors.lightGray,
  },
  progressSegmentCurrent: {
    opacity: 0.7,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  progressLabel: {
    color: colors.warmGray,
    fontSize: 9,
    fontWeight: '500',
  },
  // ─── Actions ───────────────────────────────────────────────────────────────
  returnNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: 18,
    marginBottom: 4,
    paddingHorizontal: 12,
    paddingVertical: 11,
    borderRadius: 17,
    backgroundColor: colors.successLight,
    borderWidth: 1,
    borderColor: 'rgba(47,79,58,0.12)',
  },
  returnNoticeIcon: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
  },
  returnNoticeCopy: {
    flex: 1,
  },
  returnNoticeTitle: {
    color: colors.forest,
    fontSize: 11,
    fontWeight: '900',
  },
  returnNoticeDesc: {
    color: colors.warmGray,
    fontSize: 9,
    marginTop: 2,
    fontWeight: '700',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 18,
    paddingBottom: 16,
    paddingTop: 8,
  },
  primaryAction: {
    flex: 1,
    minHeight: 48,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: colors.forest,
    ...shadows.forest,
  },
  unpaidPrimaryAction: {
    backgroundColor: colors.warning,
  },
  primaryActionText: {
    flexShrink: 1,
    color: colors.white,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '800',
    textAlign: 'center',
  },
  iconAction: {
    width: 44,
    height: 48,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.sandLight,
    borderWidth: 1,
    borderColor: colors.lightGray,
  },
});
