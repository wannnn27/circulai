import React, { useEffect, useRef, useState } from 'react';
import { Animated, Image, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { computeEcoScore, formatCurrency, getOrderTimeline, orderStatusIndex, orderSteps } from '../data/appData';
import { colors, shadows } from '../theme/colors';

const tabs = [
  { id: 'detail', label: 'Detail', icon: 'file-text' },
  { id: 'tracking', label: 'Tracking', icon: 'map-pin' },
  { id: 'passport', label: 'Passport', icon: 'shield' },
];

export default function PassportModal({ order, initialTab = 'detail', onClose }) {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState(initialTab);
  const slideAnim = useRef(new Animated.Value(500)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!order) return;
    setActiveTab(initialTab);
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        speed: 18,
        bounciness: 2,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, initialTab, order, slideAnim]);

  if (!order) return null;

  return (
    <Modal transparent animationType="none" visible onRequestClose={onClose}>
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <Pressable style={StyleSheet.absoluteFillObject} onPress={onClose} />
        <Animated.View
          style={[
            styles.sheet,
            {
              paddingBottom: Math.max(insets.bottom, 16),
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.handle} />
          <View style={styles.header}>
            <View>
              <Text style={styles.kicker}>{order.id}</Text>
              <Text style={styles.title}>Detail Pesanan</Text>
            </View>
            <Pressable style={styles.closeBtn} onPress={onClose} hitSlop={10}>
              <Feather name="x" size={17} color={colors.warmGray} />
            </Pressable>
          </View>

          <View style={styles.tabs}>
            {tabs.map((tab) => {
              const selected = activeTab === tab.id;
              return (
                <Pressable
                  key={tab.id}
                  style={[styles.tab, selected && styles.tabActive]}
                  onPress={() => setActiveTab(tab.id)}
                >
                  <Feather name={tab.icon} size={13} color={selected ? colors.white : colors.forest} />
                  <Text style={[styles.tabText, selected && styles.tabTextActive]}>{tab.label}</Text>
                </Pressable>
              );
            })}
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
            {activeTab === 'detail' && <OrderDetail order={order} />}
            {activeTab === 'tracking' && <TrackingDetail order={order} />}
            {activeTab === 'passport' && <PassportDetail order={order} />}
          </ScrollView>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

function OrderDetail({ order }) {
  const measurementSummary = order.measurements
    ? Object.entries(order.measurements).map(([key, value]) => `${key}: ${value} cm`).join(', ')
    : null;
  const designRows = order.design
    ? [
        ['Model', order.design.model],
        ['Kain', order.design.fabric],
        ['Kerah', order.design.collar],
        ['Lengan', order.design.sleeve],
        ['Ukuran', order.design.size],
      ]
    : [
        ['Warna', order.color],
        ['Ukuran', order.size],
        ['Detail ukuran', measurementSummary],
        ['Material', order.material],
        ['Catatan', order.notes],
      ];

  return (
    <>
      <View style={styles.productCard}>
        <Image source={{ uri: order.image }} style={styles.productImage} />
        <View style={styles.productInfo}>
          <View style={styles.typePill}>
            <Text style={styles.typeText}>{order.orderType === 'custom' ? 'CUSTOM DESIGN' : 'KATALOG'}</Text>
          </View>
          <Text style={styles.productName}>{order.product}</Text>
          <Text style={styles.productPrice}>{order.price ?? formatCurrency(order.rawPrice)}</Text>
          <Text style={styles.productMeta}>Dipesan {order.placedAtLabel}</Text>
        </View>
      </View>

      <SectionTitle icon="sliders" title={order.orderType === 'custom' ? 'Spesifikasi Desain' : 'Spesifikasi Pesanan'} />
      <View style={styles.dataCard}>
        {designRows.map(([label, value], index) => (
          <DataRow key={label} label={label} value={value} last={index === designRows.length - 1} />
        ))}
      </View>

      {!!order.items?.length && (
        <>
          <SectionTitle icon="shopping-bag" title={`Item Pesanan (${order.items.length})`} />
          <View style={styles.dataCard}>
            {order.items.map((item, index) => (
              <DataRow
                key={item.cartItemId}
                label={item.product.name}
                value={`${item.quantity}x / ${item.product.tailor} / ${item.customization?.color?.label ?? 'Warna asli'} / ${item.customization?.fabric?.label ?? item.product.material} / ${item.customization?.sizeType === 'custom' ? 'Custom size' : item.customization?.size ?? 'M'}`}
                last={index === order.items.length - 1}
              />
            ))}
          </View>
        </>
      )}

      <SectionTitle icon="user" title="Tailor yang Mengerjakan" />
      {(order.tailorProfiles?.length ? order.tailorProfiles : [order.tailorProfile]).map((tailor, index) => (
        <View key={tailor?.id ?? tailor?.name ?? index} style={index > 0 && styles.tailorSpacing}>
          <TailorCard order={{ ...order, tailor: tailor?.name ?? order.tailor, tailorCity: tailor?.city ?? order.tailorCity, tailorProfile: tailor }} />
        </View>
      ))}

      <SectionTitle icon="credit-card" title="Pembayaran" />
      <View style={styles.dataCard}>
        <DataRow label="Metode" value={order.paymentMethod?.label ?? 'Pembayaran lama'} />
        <DataRow label="Status" value={orderSteps[orderStatusIndex(order.status)]?.label} last />
      </View>

      <SectionTitle icon="truck" title="Pengiriman" />
      <View style={styles.dataCard}>
        <DataRow label="Penerima" value={order.shippingAddress} />
        <DataRow label="Estimasi" value={order.eta} last />
      </View>
    </>
  );
}

function TrackingDetail({ order }) {
  const timeline = getOrderTimeline(order);
  const currentIndex = orderStatusIndex(order.status);

  return (
    <>
      <View style={styles.trackingHero}>
        <View style={styles.trackingHeroIcon}>
          <Feather name={['SHIPPED', 'DELIVERED', 'COMPLETED'].includes(order.status) ? 'truck' : 'tool'} size={22} color={colors.white} />
        </View>
        <View style={styles.trackingHeroText}>
          <Text style={styles.trackingLabel}>STATUS TERKINI</Text>
          <Text style={styles.trackingTitle}>{timeline[currentIndex].label}</Text>
          <Text style={styles.trackingDesc}>{timeline[currentIndex].desc}</Text>
        </View>
        <Text style={styles.trackingPercent}>
          {Math.round(((currentIndex + 1) / timeline.length) * 100)}%
        </Text>
      </View>

      <SectionTitle icon="activity" title="Progress Produksi" />
      <View style={styles.timelineCard}>
        {timeline.map((step, index) => {
          const completed = step.state === 'completed';
          const current = step.state === 'current';
          return (
            <View key={step.id} style={styles.timelineRow}>
              <View style={styles.timelineRail}>
                <View style={[styles.timelineDot, (completed || current) && styles.timelineDotActive]}>
                  {completed ? (
                    <Feather name="check" size={11} color={colors.white} />
                  ) : current ? (
                    <View style={styles.timelineDotInner} />
                  ) : null}
                </View>
                {index < timeline.length - 1 && (
                  <View style={[styles.timelineLine, completed && styles.timelineLineActive]} />
                )}
              </View>
              <View style={styles.timelineText}>
                <Text style={[styles.timelineTitle, current && styles.timelineTitleCurrent]}>{step.label}</Text>
                <Text style={styles.timelineDesc}>{step.desc}</Text>
                <Text style={styles.timelineState}>
                  {completed ? 'Selesai' : current ? 'Sedang berlangsung' : 'Menunggu'}
                </Text>
              </View>
            </View>
          );
        })}
      </View>

      <SectionTitle icon="navigation" title="Tracking Paket" />
      <View style={styles.dataCard}>
        <DataRow label="Kurir" value={order.courier} />
        <DataRow label="Nomor tracking" value={order.trackingCode} />
        <DataRow label="Status paket" value={order.shipmentStatus} last />
      </View>
    </>
  );
}

function PassportDetail({ order }) {
  const passports = order.passports?.length ? order.passports : [order.passport].filter(Boolean);
  const [selectedPassportId, setSelectedPassportId] = useState(passports[0]?.id);
  const passport = passports.find((item) => item.id === selectedPassportId) ?? passports[0] ?? {};
  const isActive = passport.status === 'ACTIVE';
  const ecoScore = computeEcoScore(order);

  useEffect(() => {
    setSelectedPassportId(passports[0]?.id);
  }, [order.id]);

  const passportRows = [
    ['ID Passport', passport.id],
    ['Nomor serial', passport.serialNumber],
    ['Produk', passport.productName ?? order.product],
    ['Tailor', passport.tailor ?? order.tailor],
    ['Asal produksi', passport.productionLocation ?? order.tailorCity],
    ['Material', passport.materialOrigin ?? order.material],
    ['Kain diselamatkan', passport.impact?.savedFabric ?? order.savedFabric],
    ['Estimasi CO2 dihindari', passport.impact?.estimatedCo2],
    ['Kode verifikasi', passport.verificationCode],
    ['Diterbitkan', passport.issuedAt],
    ['Diaktifkan', passport.activatedAt],
  ];

  const ecoColor = ecoScore >= 70 ? colors.success : ecoScore >= 40 ? colors.warning : colors.error;
  const ecoLabel = ecoScore >= 70 ? 'Sangat Baik' : ecoScore >= 40 ? 'Baik' : 'Standar';

  return (
    <>
      {passports.length > 1 && (
        <>
          <SectionTitle icon="layers" title={`Passport Produk (${passports.length})`} />
          <View style={styles.passportSelector}>
            {passports.map((item, index) => {
              const selected = item.id === passport.id;
              return (
                <Pressable
                  key={item.id}
                  style={[styles.passportChip, selected && styles.passportChipActive]}
                  onPress={() => setSelectedPassportId(item.id)}
                >
                  <Text style={[styles.passportChipIndex, selected && styles.passportChipIndexActive]}>
                    {String(index + 1).padStart(2, '0')}
                  </Text>
                  <Text style={[styles.passportChipText, selected && styles.passportChipTextActive]} numberOfLines={1}>
                    {item.productName}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </>
      )}

      <View style={styles.passportHero}>
        <View style={styles.qrBox}>
          <View style={styles.qrGrid}>
            {Array.from({ length: 64 }).map((_, index) => (
              <View
                key={index}
                style={[styles.qrDot, passportQrCell(passport.qrSeed, index) && styles.qrDotFilled]}
              />
            ))}
          </View>
          <View style={styles.qrCenter}>
            <MaterialCommunityIcons name="leaf" size={16} color={colors.white} />
          </View>
        </View>
        <View style={[styles.verifiedPill, !isActive && styles.pendingPill]}>
          <Feather name={isActive ? 'check-circle' : 'clock'} size={13} color={isActive ? colors.success : colors.warning} />
          <Text style={[styles.verifiedText, !isActive && styles.pendingText]}>{passport.verification}</Text>
        </View>
        <Text style={styles.passportCopy}>
          Digital Product Passport mencatat jejak asal material, pembuat, dan dampak lingkungan setiap produk — langkah awal menuju transparansi rantai pasok fashion yang penuh.
        </Text>
      </View>

      <SectionTitle icon="shield" title="Skor Keberlanjutan (Eco-Score)" />
      <View style={styles.ecoCard}>
        <View style={styles.ecoCardHeader}>
          <View style={styles.ecoScoreBadge}>
            <MaterialCommunityIcons name="leaf" size={16} color={ecoColor} />
            <Text style={[styles.ecoScoreNum, { color: ecoColor }]}>{ecoScore}</Text>
            <Text style={styles.ecoScoreMax}>/ 100</Text>
          </View>
          <Text style={[styles.ecoScoreCategory, { color: ecoColor }]}>{ecoLabel}</Text>
        </View>
        <View style={styles.ecoTrack}>
          <View style={[styles.ecoFill, { width: `${ecoScore}%`, backgroundColor: ecoColor }]} />
        </View>
        <Text style={styles.ecoDesc}>
          Dihitung berdasarkan pemanfaatan kain sisa, skema made-to-order, dan estimasi pengurangan limbah tekstil.
        </Text>
      </View>

      <SectionTitle icon="file-text" title="Spesifikasi Traceability" />
      <View style={styles.dataCard}>
        {passportRows.map(([label, value], index) => (
          <DataRow key={label} label={label} value={value} last={index === passportRows.length - 1} />
        ))}
      </View>

      <Text style={styles.passportFooterNote}>
        Versi 1.0 — Data bersumber dari pendaftaran tailor yang terverifikasi. Integrasi sensor IoT dan verifikasi pihak ketiga tersedia di roadmap pengemabangan.
      </Text>
    </>
  );
}

function passportQrCell(seed = 0, index) {
  const row = Math.floor(index / 8);
  const column = index % 8;
  const finder =
    ((row <= 2 && column <= 2) ||
      (row <= 2 && column >= 5) ||
      (row >= 5 && column <= 2)) &&
    (row % 2 === 0 || column % 2 === 0);
  const mixed = (Math.imul((seed >>> 0) ^ (index + 17), 2654435761) >>> 0);
  return finder || ((mixed >>> (index % 13)) & 1) === 1;
}

function TailorCard({ order }) {
  const tailor = order.tailorProfile ?? {};
  return (
    <View style={styles.tailorCard}>
      {tailor.image ? (
        <Image source={{ uri: tailor.image }} style={styles.tailorImage} />
      ) : (
        <View style={styles.tailorFallback}>
          <Feather name="user" size={20} color={colors.forest} />
        </View>
      )}
      <View style={styles.tailorInfo}>
        <View style={styles.tailorNameRow}>
          <Text style={styles.tailorName}>{order.tailor}</Text>
          {tailor.verified && <Feather name="check-circle" size={13} color={colors.success} />}
        </View>
        <Text style={styles.tailorSpecialty}>{tailor.specialty}</Text>
        <View style={styles.tailorStats}>
          <Text style={styles.tailorStat}>★ {tailor.rating}</Text>
          <Text style={styles.tailorStat}>{tailor.experience}</Text>
          <Text style={styles.tailorStat}>{tailor.sold} selesai</Text>
        </View>
      </View>
    </View>
  );
}

function SectionTitle({ icon, title }) {
  return (
    <View style={styles.sectionTitle}>
      <Feather name={icon} size={14} color={colors.forest} />
      <Text style={styles.sectionTitleText}>{title}</Text>
    </View>
  );
}

function DataRow({ label, value, last = false }) {
  return (
    <View style={[styles.dataRow, !last && styles.dataRowBorder]}>
      <Text style={styles.dataLabel}>{label}</Text>
      <Text style={styles.dataValue}>{value || '-'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: colors.overlay,
  },
  sheet: {
    width: '100%',
    maxWidth: 520,
    maxHeight: '92%',
    alignSelf: 'center',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 20,
    paddingTop: 10,
    backgroundColor: colors.ivory,
    ...shadows.xl,
  },
  handle: {
    width: 42,
    height: 4,
    borderRadius: 9999,
    alignSelf: 'center',
    backgroundColor: colors.lightGrayDark,
    marginBottom: 15,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  kicker: {
    color: colors.warmGray,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  title: {
    color: colors.charcoal,
    fontSize: 21,
    fontWeight: '900',
    marginTop: 2,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.lightGray,
  },
  tabs: {
    flexDirection: 'row',
    gap: 7,
    marginBottom: 14,
  },
  tab: {
    flex: 1,
    minHeight: 38,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.lightGray,
  },
  tabActive: {
    backgroundColor: colors.forest,
    borderColor: colors.forest,
  },
  tabText: {
    color: colors.forest,
    fontSize: 11,
    fontWeight: '800',
  },
  tabTextActive: {
    color: colors.white,
  },
  content: {
    paddingBottom: 16,
  },
  productCard: {
    flexDirection: 'row',
    gap: 14,
    padding: 14,
    borderRadius: 20,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.lightGray,
    ...shadows.sm,
  },
  productImage: {
    width: 92,
    height: 112,
    borderRadius: 16,
    backgroundColor: colors.sand,
  },
  productInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  typePill: {
    alignSelf: 'flex-start',
    borderRadius: 9999,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: colors.successLight,
    marginBottom: 6,
  },
  typeText: {
    color: colors.forest,
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  productName: {
    color: colors.charcoal,
    fontSize: 16,
    fontWeight: '900',
  },
  productPrice: {
    color: colors.forest,
    fontSize: 16,
    fontWeight: '900',
    marginTop: 5,
  },
  productMeta: {
    color: colors.warmGray,
    fontSize: 10,
    marginTop: 4,
  },
  sectionTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginTop: 18,
    marginBottom: 9,
  },
  sectionTitleText: {
    color: colors.charcoal,
    fontSize: 13,
    fontWeight: '900',
  },
  dataCard: {
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.lightGray,
  },
  dataRow: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  dataRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  dataLabel: {
    width: 105,
    color: colors.warmGray,
    fontSize: 11,
    fontWeight: '600',
  },
  dataValue: {
    flex: 1,
    color: colors.charcoal,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '800',
    textAlign: 'right',
  },
  tailorCard: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    padding: 14,
    borderRadius: 18,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.lightGray,
  },
  tailorSpacing: {
    marginTop: 8,
  },
  tailorImage: {
    width: 54,
    height: 54,
    borderRadius: 16,
    backgroundColor: colors.sand,
  },
  tailorFallback: {
    width: 54,
    height: 54,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.sand,
  },
  tailorInfo: {
    flex: 1,
  },
  tailorNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  tailorName: {
    color: colors.charcoal,
    fontSize: 14,
    fontWeight: '900',
  },
  tailorSpecialty: {
    color: colors.warmGray,
    fontSize: 10,
    marginTop: 2,
  },
  tailorStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 7,
  },
  tailorStat: {
    color: colors.forest,
    fontSize: 9,
    fontWeight: '800',
    backgroundColor: colors.successLight,
    borderRadius: 9999,
    paddingHorizontal: 7,
    paddingVertical: 4,
  },
  trackingHero: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 20,
    padding: 16,
    backgroundColor: colors.forest,
  },
  trackingHeroIcon: {
    width: 46,
    height: 46,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  trackingHeroText: {
    flex: 1,
  },
  trackingLabel: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  trackingTitle: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '900',
    marginTop: 2,
  },
  trackingDesc: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: 10,
    marginTop: 2,
  },
  trackingPercent: {
    color: colors.sand,
    fontSize: 18,
    fontWeight: '900',
  },
  timelineCard: {
    borderRadius: 18,
    padding: 14,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.lightGray,
  },
  timelineRow: {
    flexDirection: 'row',
    minHeight: 68,
  },
  timelineRail: {
    width: 28,
    alignItems: 'center',
  },
  timelineDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.lightGray,
  },
  timelineDotActive: {
    backgroundColor: colors.forest,
  },
  timelineDotInner: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.white,
  },
  timelineLine: {
    flex: 1,
    width: 2,
    backgroundColor: colors.lightGray,
  },
  timelineLineActive: {
    backgroundColor: colors.forest,
  },
  timelineText: {
    flex: 1,
    paddingLeft: 9,
    paddingBottom: 13,
  },
  timelineTitle: {
    color: colors.warmGray,
    fontSize: 12,
    fontWeight: '800',
  },
  timelineTitleCurrent: {
    color: colors.forest,
    fontWeight: '900',
  },
  timelineDesc: {
    color: colors.warmGray,
    fontSize: 10,
    marginTop: 2,
  },
  timelineState: {
    color: colors.warmGrayLight,
    fontSize: 9,
    fontWeight: '700',
    marginTop: 4,
  },
  passportHero: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  passportSelector: {
    gap: 7,
    marginBottom: 14,
  },
  passportChip: {
    minHeight: 46,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    paddingHorizontal: 11,
    borderRadius: 14,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.lightGray,
  },
  passportChipActive: {
    backgroundColor: colors.forest,
    borderColor: colors.forest,
  },
  passportChipIndex: {
    color: colors.forest,
    fontSize: 10,
    fontWeight: '900',
  },
  passportChipIndexActive: {
    color: colors.sand,
  },
  passportChipText: {
    flex: 1,
    color: colors.charcoal,
    fontSize: 11,
    fontWeight: '800',
  },
  passportChipTextActive: {
    color: colors.white,
  },
  qrBox: {
    width: 150,
    height: 150,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.lightGray,
    ...shadows.md,
  },
  qrGrid: {
    width: 104,
    height: 104,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 2,
  },
  qrDot: {
    width: 11,
    height: 11,
    borderRadius: 2,
  },
  qrDotFilled: {
    backgroundColor: colors.charcoal,
  },
  qrCenter: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.forest,
    borderWidth: 2,
    borderColor: colors.white,
  },
  verifiedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 10,
    borderRadius: 9999,
    paddingHorizontal: 11,
    paddingVertical: 5,
    backgroundColor: colors.successLight,
  },
  verifiedText: {
    color: colors.success,
    fontSize: 10,
    fontWeight: '800',
  },
  pendingPill: {
    backgroundColor: colors.warningLight,
  },
  pendingText: {
    color: colors.warning,
  },
  passportCopy: {
    maxWidth: 310,
    color: colors.warmGray,
    fontSize: 10,
    lineHeight: 15,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 4,
  },
  ecoCard: {
    borderRadius: 18,
    padding: 14,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.lightGray,
    marginBottom: 4,
  },
  ecoCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  ecoScoreBadge: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  ecoScoreNum: {
    fontSize: 22,
    fontWeight: '900',
  },
  ecoScoreMax: {
    fontSize: 11,
    color: colors.warmGray,
    fontWeight: '700',
  },
  ecoScoreCategory: {
    fontSize: 12,
    fontWeight: '800',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 9999,
    backgroundColor: colors.ivory,
  },
  ecoTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.lightGray,
    overflow: 'hidden',
    marginBottom: 8,
  },
  ecoFill: {
    height: '100%',
    borderRadius: 4,
  },
  ecoDesc: {
    fontSize: 10,
    color: colors.warmGray,
    lineHeight: 14,
  },
  passportFooterNote: {
    fontSize: 9,
    color: colors.warmGrayLight,
    lineHeight: 13,
    textAlign: 'center',
    marginTop: 12,
    fontStyle: 'italic',
    paddingHorizontal: 8,
  },
});
