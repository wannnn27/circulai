import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

import AnimatedPressable from '../components/AnimatedPressable';
import OrderCard from '../components/OrderCard';
import PassportModal from '../components/PassportModal';
import { useAppState } from '../state/AppContext';
import { layout } from '../styles/layout';
import { colors, shadows } from '../theme/colors';

export default function OrdersScreen({
  onNavigate,
  onTrackOrder,
  onChatTailor,
  onRequestReturn,
  focusedOrderId,
  onFocusedOrderHandled
}) {
  const [selectedView, setSelectedView] = useState(null);
  const { orders } = useAppState();
  const activeOrders = orders.filter((order) => order.status !== 'COMPLETED').length;

  useEffect(() => {
    if (!focusedOrderId) return;
    const order = orders.find((item) => item.id === focusedOrderId);
    if (!order) return;
    setSelectedView({ order, tab: 'detail' });
    onFocusedOrderHandled?.();
  }, [focusedOrderId, onFocusedOrderHandled, orders]);

  const totalFabricSaved = orders.reduce((acc, o) => {
    const val = parseFloat(o.savedFabric ?? '0');
    return acc + (isNaN(val) ? 0 : val);
  }, 0);

  return (
    <View style={layout.flex}>
      <ScrollView
        style={layout.scroll}
        contentContainerStyle={layout.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ─── Header ─────────────────────────────────────────────────── */}
        <View style={styles.header}>
          <View>
            <Text style={styles.kicker}>Produksi</Text>
            <Text style={styles.title}>Tailor Track</Text>
          </View>
          {orders.length > 0 && (
            <View style={styles.headerBadge}>
              <Feather name="package" size={12} color={colors.forest} />
              <Text style={styles.headerBadgeText}>{activeOrders} aktif</Text>
            </View>
          )}
        </View>

        {/* ─── Summary stats (visible when have orders) ────────────────── */}
        {orders.length > 0 && (
          <View style={styles.summaryCard}>
            <SummaryItem
              icon="package"
              value={String(orders.length)}
              label="Total Pesanan"
            />
            <View style={styles.summaryDivider} />
            <SummaryItem
              icon="leaf"
              value={`${totalFabricSaved.toFixed(1)}m`}
              label="Kain Hemat"
              iconFamily="material"
            />
            <View style={styles.summaryDivider} />
            <SummaryItem
              icon="award"
              value="320"
              label="Impact Pts"
            />
          </View>
        )}

        {/* ─── Order list or empty state ──────────────────────────────── */}
        {orders.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconBg}>
              <Feather name="package" size={34} color={colors.forest} />
            </View>
            <Text style={styles.emptyTitle}>Belum ada pesanan</Text>
            <Text style={styles.emptyDesc}>
              Yuk mulai pesan outfit personal pertamamu dari kain sirkular.
            </Text>
            <AnimatedPressable style={styles.emptyButton} onPress={() => onNavigate('explore')}>
              <Feather name="search" size={16} color={colors.white} />
              <Text style={styles.emptyButtonText}>Mulai Belanja</Text>
            </AnimatedPressable>
          </View>
        ) : (
          orders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onDetail={() => setSelectedView({ order, tab: 'detail' })}
              onTracking={() => onTrackOrder(order.id)}
              onPassport={() => setSelectedView({ order, tab: 'passport' })}
              onChat={() => onChatTailor(order)}
              onReturn={() => onRequestReturn(order.id)}
            />
          ))
        )}
      </ScrollView>

      <PassportModal
        order={selectedView?.order}
        initialTab={selectedView?.tab}
        onClose={() => setSelectedView(null)}
      />
    </View>
  );
}

function SummaryItem({ icon, value, label, iconFamily = 'feather' }) {
  const Icon = iconFamily === 'material' ? MaterialCommunityIcons : Feather;
  return (
    <View style={styles.summaryItem}>
      <View style={styles.summaryIconBg}>
        <Icon name={icon} size={14} color={colors.forest} />
      </View>
      <Text style={styles.summaryValue}>{value}</Text>
      <Text style={styles.summaryLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  // ─── Header ───────────────────────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  kicker: {
    color: colors.warmGray,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  title: {
    color: colors.charcoal,
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  headerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 9999,
    backgroundColor: 'rgba(47,79,58,0.09)',
  },
  headerBadgeText: {
    color: colors.forest,
    fontSize: 11,
    fontWeight: '800',
  },
  // ─── Summary card ─────────────────────────────────────────────────────────
  summaryCard: {
    flexDirection: 'row',
    borderRadius: 20,
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.lightGray,
    paddingVertical: 14,
    marginBottom: 20,
    ...shadows.sm,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  summaryIconBg: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.successLight,
    marginBottom: 2,
  },
  summaryValue: {
    color: colors.forest,
    fontSize: 18,
    fontWeight: '900',
  },
  summaryLabel: {
    color: colors.warmGray,
    fontSize: 10,
    fontWeight: '500',
    textAlign: 'center',
  },
  summaryDivider: {
    width: 1,
    backgroundColor: colors.lightGray,
    marginVertical: 4,
  },
  // ─── Empty state ──────────────────────────────────────────────────────────
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 70,
  },
  emptyIconBg: {
    width: 88,
    height: 88,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.sand,
    marginBottom: 20,
    ...shadows.sm,
  },
  emptyTitle: {
    color: colors.charcoal,
    fontSize: 19,
    fontWeight: '900',
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  emptyDesc: {
    color: colors.warmGray,
    fontSize: 14,
    lineHeight: 20,
    maxWidth: 270,
    textAlign: 'center',
    marginBottom: 28,
  },
  emptyButton: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 16,
    paddingHorizontal: 24,
    paddingVertical: 14,
    backgroundColor: colors.forest,
    ...shadows.forest,
  },
  emptyButtonText: {
    color: colors.white,
    fontSize: 14,
    lineHeight: 19,
    fontWeight: '900',
  },
});
