/**
 * @file ImpactDashboardScreen.js
 * @description Personal Impact Dashboard — menampilkan dampak lingkungan dan sosial
 * dari aktivitas circular fashion pengguna CIRCULAI.
 *
 * Fitur:
 * - CO₂ saved counter dengan animasi
 * - Kain terselamatkan progress gauge
 * - Penjahit lokal yang didukung (avatar grid)
 * - Achievement badges sistem (Eco Champion, dll)
 * - Circular Points history timeline
 * - Shareable impact card CTA
 * - Ringkasan dampak komunitas CIRCULAI secara keseluruhan
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Image,
  ImageBackground,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import AnimatedPressable from '../components/AnimatedPressable';
import { useAppState } from '../state/AppContext';
import { tailors, exchangePointTiers, getPointTier, products } from '../data/appData';
import { colors, shadows } from '../theme/colors';

// ─── Achievement Badge Definitions ────────────────────────────────────────────
const ACHIEVEMENTS = [
  {
    id: 'first_order',
    icon: 'star-shooting',
    title: 'Circular Starter',
    desc: 'Pesanan pertama dibuat!',
    color: '#D99A3D',
    unlocked: true,
  },
  {
    id: 'eco_swap',
    icon: 'recycle',
    title: 'Eco Swapper',
    desc: 'Tukar barang bekas pertama',
    color: '#2C6842',
    unlocked: true,
  },
  {
    id: 'tailor_support',
    icon: 'account-heart-outline',
    title: 'UMKM Hero',
    desc: 'Dukung 3+ penjahit lokal',
    color: '#27667B',
    unlocked: true,
  },
  {
    id: 'mto_champion',
    icon: 'hanger',
    title: 'MTO Champion',
    desc: 'Made-to-order pertama kali',
    color: '#C97B63',
    unlocked: true,
  },
  {
    id: 'carbon_saver',
    icon: 'leaf',
    title: 'Carbon Saver',
    desc: 'Hemat 10+ kg CO₂',
    color: '#4F8A5B',
    unlocked: false,
  },
  {
    id: 'circular_elite',
    icon: 'crown-outline',
    title: 'Circular Elite',
    desc: 'Kumpulkan 1000 poin',
    color: '#8E5C9A',
    unlocked: false,
  },
];

// ─── Community Impact Numbers ──────────────────────────────────────────────────
const COMMUNITY_STATS = [
  { icon: 'account-group', value: '134', label: 'Penjahit UMKM\nDiberdayakan', color: colors.forest },
  { icon: 'scissors-cutting', value: '2.4 ton', label: 'Kain Sisa\nDimanfaatkan', color: colors.terracotta },
  { icon: 'factory', value: '1.280', label: 'Made-to-Order\nDiproduksi', color: colors.ming },
];

// ─── Animated Number Counter ────────────────────────────────────────────────
function AnimatedNumber({ value, suffix = '', duration = 1200, style }) {
  const animVal = useRef(new Animated.Value(0)).current;
  const [displayed, setDisplayed] = useState(0);

  useEffect(() => {
    const numericValue = parseFloat(String(value).replace(/[^0-9.]/g, '')) || 0;
    Animated.timing(animVal, {
      toValue: numericValue,
      duration,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();

    const listenerId = animVal.addListener(({ value: v }) => {
      setDisplayed(Math.round(v * 10) / 10);
    });

    return () => animVal.removeListener(listenerId);
  }, [animVal, value, duration]);

  return (
    <Text style={style}>
      {displayed % 1 === 0 ? displayed.toFixed(0) : displayed.toFixed(1)}{suffix}
    </Text>
  );
}

// ─── Circular Progress Ring ─────────────────────────────────────────────────
function CircularRing({ percent, size = 100, strokeWidth = 10, color = colors.forest, children }) {
  const animPercent = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animPercent, {
      toValue: percent,
      duration: 1400,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [animPercent, percent]);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      {/* Background ring */}
      <View
        style={{
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: strokeWidth,
          borderColor: colors.lightGray,
        }}
      />
      {/* Progress indicator using simple visual */}
      <View
        style={{
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: strokeWidth,
          borderColor: color,
          borderTopColor: percent > 75 ? color : 'transparent',
          borderRightColor: percent > 50 ? color : 'transparent',
          borderBottomColor: percent > 25 ? color : 'transparent',
          borderLeftColor: 'transparent',
          transform: [{ rotate: `${(percent / 100) * 360 - 90}deg` }],
        }}
      />
      <View style={{ alignItems: 'center', justifyContent: 'center' }}>
        {children}
      </View>
    </View>
  );
}

// ─── Main Screen ────────────────────────────────────────────────────────────
export default function ImpactDashboardScreen({ onNavigate }) {
  const insets = useSafeAreaInsets();
  const { circularPoints, orders, isLoggedIn, openAuthModal, exchangeHistory } = useAppState();

  const headerAnim = useRef(new Animated.Value(0)).current;
  const cardsAnim = useRef(new Animated.Value(30)).current;
  const cardsOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(headerAnim, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.delay(200),
        Animated.parallel([
          Animated.timing(cardsOpacity, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.spring(cardsAnim, {
            toValue: 0,
            speed: 12,
            bounciness: 4,
            useNativeDriver: true,
          }),
        ]),
      ]),
    ]).start();
  }, [headerAnim, cardsAnim, cardsOpacity]);

  // Calculate personal impact from orders
  const personalImpact = useMemo(() => {
    if (!isLoggedIn) {
      return {
        fabricSaved: 0,
        co2Saved: 0,
        tailorsSupported: 0,
        ordersCount: 0,
        exchangeCount: 0,
      };
    }
    const completedOrders = orders.filter((o) =>
      ['COMPLETED', 'DELIVERED', 'IN_PRODUCTION', 'SHIPPED'].includes(o.status)
    );
    const totalFabricSaved = completedOrders.reduce((sum, o) => {
      const amount = parseFloat(String(o.savedFabric ?? '0').replace(/[^0-9.]/g, '')) || 0;
      return sum + amount;
    }, 0);
    const co2Saved = totalFabricSaved * 2.7; // 1m fabric saved ≈ 2.7 kg CO₂
    const tailorsSupported = [...new Set(completedOrders.map((o) => o.tailor).filter(Boolean))].length;
    const exchangeCount = exchangeHistory.length;

    return {
      fabricSaved: Math.max(1.8, totalFabricSaved),
      co2Saved: Math.max(4.9, co2Saved),
      tailorsSupported: Math.max(2, tailorsSupported),
      ordersCount: Math.max(2, completedOrders.length),
      exchangeCount: Math.max(1, exchangeCount),
    };
  }, [orders, exchangeHistory, isLoggedIn]);

  const tier = getPointTier(circularPoints);
  const nextTier = exchangePointTiers.find((t) => t.minPoints > circularPoints) ?? exchangePointTiers[exchangePointTiers.length - 1];
  const tierProgress = nextTier.minPoints === Infinity
    ? 100
    : Math.min(100, Math.round(((circularPoints - tier.minPoints) / (nextTier.minPoints - tier.minPoints)) * 100));

  const handleShareImpact = async () => {
    try {
      await Share.share({
        message: `Saya telah menghemat ${personalImpact.co2Saved.toFixed(1)} kg CO₂ dan mendukung ${personalImpact.tailorsSupported} penjahit UMKM lokal lewat CIRCULAI! #CircularFashion #SupportUMKM`,
        title: 'Dampak Lingkunganku di CIRCULAI',
      });
    } catch {
      // share cancelled
    }
  };

  return (
    <View style={[styles.screen]}>
      {/* ─── Header ───────────────────────────────────────────────────────── */}
      <Animated.View
        style={[
          styles.header,
          { paddingTop: insets.top + 12, opacity: headerAnim },
        ]}
      >
        <View style={styles.headerBg} />
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerKicker}>DAMPAK KAMU</Text>
            <Text style={styles.headerTitle}>Impact Dashboard</Text>
          </View>
          <Pressable style={styles.shareBtn} onPress={handleShareImpact}>
            <Feather name="share-2" size={16} color={colors.white} />
          </Pressable>
        </View>

        {/* Tier Badge */}
        <View style={styles.tierCard}>
          <View style={[styles.tierIcon, { backgroundColor: tier.color + '22' }]}>
            <MaterialCommunityIcons name={tier.icon} size={22} color={tier.color} />
          </View>
          <View style={styles.tierInfo}>
            <Text style={styles.tierName}>{isLoggedIn ? `${tier.name} Member` : 'Guest Visitor'}</Text>
            <View style={styles.tierProgressRow}>
              <View style={styles.tierTrack}>
                <View style={[styles.tierFill, { width: `${isLoggedIn ? tierProgress : 0}%`, backgroundColor: tier.color }]} />
              </View>
              <Text style={styles.tierPoints}>{circularPoints} poin</Text>
            </View>
            {isLoggedIn ? (
              nextTier.minPoints !== Infinity && (
                <Text style={styles.tierNext}>
                  {nextTier.minPoints - circularPoints} poin lagi menuju {nextTier.name}
                </Text>
              )
            ) : (
              <Text style={styles.tierNext}>Masuk ke akun untuk mengumpulkan poin</Text>
            )}
          </View>
        </View>
      </Animated.View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 90 }]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={{
            opacity: cardsOpacity,
            transform: [{ translateY: cardsAnim }],
          }}
        >
          {/* ─── Personal Impact Metrics ────────────────────────────────── */}
          <Text style={styles.sectionTitle}>Dampak Personalmu</Text>

          <View style={styles.impactGrid}>
            {/* CO2 Card */}
            <View style={[styles.impactCard, styles.impactCardCO2]}>
              <View style={styles.impactCardIcon}>
                <MaterialCommunityIcons name="leaf" size={16} color={colors.forest} />
              </View>
              <AnimatedNumber
                value={personalImpact.co2Saved}
                suffix=" kg"
                style={styles.impactCardValue}
              />
              <Text style={styles.impactCardLabel}>CO₂ Diselamatkan</Text>
              <Text style={styles.impactCardSub}>≈ naik bus 30 km</Text>
            </View>

            {/* Fabric Card */}
            <View style={[styles.impactCard, styles.impactCardFabric]}>
              <View style={[styles.impactCardIcon, { backgroundColor: colors.terracotta + '18' }]}>
                <MaterialCommunityIcons name="scissors-cutting" size={16} color={colors.terracotta} />
              </View>
              <AnimatedNumber
                value={personalImpact.fabricSaved}
                suffix=" m"
                style={[styles.impactCardValue, { color: colors.terracotta }]}
              />
              <Text style={styles.impactCardLabel}>Kain Diselamatkan</Text>
              <Text style={styles.impactCardSub}>dari TPA</Text>
            </View>

            {/* Tailors Card */}
            <View style={[styles.impactCard, styles.impactCardTailor]}>
              <View style={[styles.impactCardIcon, { backgroundColor: colors.terracottaLight + '18' }]}>
                <MaterialCommunityIcons name="account-group-outline" size={16} color={colors.ming} />
              </View>
              <AnimatedNumber
                value={personalImpact.tailorsSupported}
                suffix=""
                style={[styles.impactCardValue, { color: colors.ming }]}
              />
              <Text style={styles.impactCardLabel}>Penjahit UMKM</Text>
              <Text style={styles.impactCardSub}>yang kamu dukung</Text>
            </View>

            {/* Exchange Card */}
            <View style={[styles.impactCard, styles.impactCardExchange]}>
              <View style={[styles.impactCardIcon, { backgroundColor: colors.warning + '18' }]}>
                <MaterialCommunityIcons name="recycle" size={16} color={colors.warning} />
              </View>
              <AnimatedNumber
                value={personalImpact.exchangeCount}
                suffix="×"
                style={[styles.impactCardValue, { color: colors.warning }]}
              />
              <Text style={styles.impactCardLabel}>Eco Swap</Text>
              <Text style={styles.impactCardSub}>dilakukan</Text>
            </View>
          </View>

          {/* ─── Tailor Spotlight — UMKM Didukung ─────────────────────── */}
          <View style={styles.sectionRow}>
            <Text style={styles.sectionTitle}>Penjahit UMKM Tersupport</Text>
            <Pressable onPress={() => onNavigate('explore')}>
              <Text style={styles.seeAll}>Lihat Semua</Text>
            </Pressable>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tailorRow}>
            {tailors.map((tailor) => (
              <AnimatedPressable
                key={tailor.id}
                style={styles.tailorCard}
                onPress={() => onNavigate('explore')}
                scaleDown={0.96}
              >
                <ImageBackground
                  source={{ uri: tailor.image }}
                  style={styles.tailorImage}
                  imageStyle={{ borderRadius: 18 }}
                >
                  <View style={styles.tailorOverlay} />
                  <View style={styles.tailorVerified}>
                    <MaterialCommunityIcons name="check-decagram" size={13} color={colors.white} />
                    <Text style={styles.tailorVerifiedText}>Terverifikasi</Text>
                  </View>
                </ImageBackground>
                <View style={styles.tailorBody}>
                  <Text style={styles.tailorName} numberOfLines={1}>{tailor.name}</Text>
                  <View style={styles.tailorMeta}>
                    <Feather name="map-pin" size={10} color={colors.warmGray} />
                    <Text style={styles.tailorCity}>{tailor.city}</Text>
                  </View>
                  <Text style={styles.tailorSpec} numberOfLines={1}>{tailor.specialty}</Text>
                  <View style={styles.tailorStats}>
                    <Feather name="star" size={10} color={colors.warning} />
                    <Text style={styles.tailorRating}>{tailor.rating}</Text>
                    <Text style={styles.tailorDot}>·</Text>
                    <Text style={styles.tailorSold}>{tailor.sold} terjual</Text>
                  </View>
                </View>
              </AnimatedPressable>
            ))}
          </ScrollView>

          {/* ─── Achievement Badges ─────────────────────────────────────── */}
          <Text style={styles.sectionTitle}>Pencapaianmu</Text>
          <View style={styles.badgeGrid}>
            {ACHIEVEMENTS.map((badge) => {
              const isUnlocked = isLoggedIn && badge.unlocked;
              return (
                <View
                  key={badge.id}
                  style={[
                    styles.badgeCard,
                    !isUnlocked && styles.badgeCardLocked,
                  ]}
                >
                  <View
                    style={[
                      styles.badgeIcon,
                      { backgroundColor: isUnlocked ? badge.color + '18' : colors.lightGray },
                    ]}
                  >
                    <MaterialCommunityIcons
                      name={badge.icon}
                      size={24}
                      color={isUnlocked ? badge.color : colors.warmGrayLight}
                    />
                    {!isUnlocked && (
                      <View style={styles.badgeLockOverlay}>
                        <Feather name="lock" size={10} color={colors.warmGray} />
                      </View>
                    )}
                  </View>
                  <Text
                    style={[
                      styles.badgeTitle,
                      !isUnlocked && styles.badgeTitleLocked,
                    ]}
                    numberOfLines={1}
                  >
                    {badge.title}
                  </Text>
                  <Text style={styles.badgeDesc} numberOfLines={2}>
                    {isUnlocked ? badge.desc : 'Terkunci'}
                  </Text>
                </View>
              );
            })}
          </View>

          {/* ─── Komunitas CIRCULAI Stats ───────────────────────────────── */}
          <View style={styles.communitySection}>
            <View style={styles.communityHeader}>
              <MaterialCommunityIcons name="earth" size={18} color={colors.white} />
              <Text style={styles.communityTitle}>Dampak Komunitas CIRCULAI</Text>
            </View>
            <Text style={styles.communitySub}>
              Bersama ribuan pengguna, kita membangun ekosistem fashion yang lebih adil & berkelanjutan.
            </Text>
            <View style={styles.communityStats}>
              {COMMUNITY_STATS.map((stat) => (
                <View key={stat.label} style={styles.communityStat}>
                  <View style={[styles.communityStatIcon, { backgroundColor: stat.color + '22' }]}>
                    <MaterialCommunityIcons name={stat.icon} size={18} color={stat.color} />
                  </View>
                  <Text style={styles.communityStatValue}>{stat.value}</Text>
                  <Text style={styles.communityStatLabel}>{stat.label}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* ─── CTA — Share Impact Card ────────────────────────────────── */}
          <AnimatedPressable
            style={styles.shareCard}
            onPress={handleShareImpact}
            scaleDown={0.97}
          >
            <View style={styles.shareCardLeft}>
              <MaterialCommunityIcons name="share-variant" size={22} color={colors.forest} />
              <View>
                <Text style={styles.shareCardTitle}>Bagikan Dampakmu!</Text>
                <Text style={styles.shareCardSub}>
                  Inspirasi orang lain untuk ikut circular fashion
                </Text>
              </View>
            </View>
            <Feather name="arrow-right" size={18} color={colors.forest} />
          </AnimatedPressable>

          {/* ─── Quick Actions ──────────────────────────────────────────── */}
          <Text style={styles.sectionTitle}>Tingkatkan Dampakmu</Text>
          <View style={styles.quickActions}>
            <AnimatedPressable
              style={[styles.actionBtn, { backgroundColor: colors.forest }]}
              onPress={() => onNavigate('exchange')}
              scaleDown={0.96}
            >
              <MaterialCommunityIcons name="recycle" size={20} color={colors.white} />
              <View style={styles.actionBtnText}>
                <Text style={styles.actionBtnTitle}>Eco Swap</Text>
                <Text style={styles.actionBtnSub}>Tukar barang bekas</Text>
              </View>
              <Feather name="chevron-right" size={16} color={colors.white} />
            </AnimatedPressable>

            <AnimatedPressable
              style={[styles.actionBtn, { backgroundColor: colors.terracotta }]}
              onPress={() => onNavigate('custom-design')}
              scaleDown={0.96}
            >
              <MaterialCommunityIcons name="hanger" size={20} color={colors.white} />
              <View style={styles.actionBtnText}>
                <Text style={styles.actionBtnTitle}>Bespoke Studio</Text>
                <Text style={styles.actionBtnSub}>Pesan baju custom</Text>
              </View>
              <Feather name="chevron-right" size={16} color={colors.white} />
            </AnimatedPressable>

            <AnimatedPressable
              style={[styles.actionBtn, { backgroundColor: colors.ming }]}
              onPress={() => onNavigate('explore')}
              scaleDown={0.96}
            >
              <MaterialCommunityIcons name="store-outline" size={20} color={colors.white} />
              <View style={styles.actionBtnText}>
                <Text style={styles.actionBtnTitle}>Circular Market</Text>
                <Text style={styles.actionBtnSub}>Belanja produk lokal</Text>
              </View>
              <Feather name="chevron-right" size={16} color={colors.white} />
            </AnimatedPressable>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.ivory,
  },

  // ─── Header ────────────────────────────────────────────────────────────────
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: colors.forest,
  },
  headerBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.forest,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  headerKicker: {
    color: 'rgba(221,235,157,0.75)',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  headerTitle: {
    color: colors.white,
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  shareBtn: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ─── Tier Card ─────────────────────────────────────────────────────────────
  tierCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  tierIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(221,235,157,0.18)',
  },
  tierInfo: {
    flex: 1,
  },
  tierName: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '900',
    marginBottom: 5,
  },
  tierProgressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 3,
  },
  tierTrack: {
    flex: 1,
    height: 5,
    borderRadius: 99,
    backgroundColor: 'rgba(255,255,255,0.22)',
    overflow: 'hidden',
  },
  tierFill: {
    height: '100%',
    borderRadius: 99,
    backgroundColor: colors.sand,
  },
  tierPoints: {
    color: colors.sand,
    fontSize: 11,
    fontWeight: '800',
  },
  tierNext: {
    color: 'rgba(221,235,157,0.68)',
    fontSize: 9,
    fontWeight: '600',
  },

  // ─── Scroll ────────────────────────────────────────────────────────────────
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 20,
  },

  // ─── Section ───────────────────────────────────────────────────────────────
  sectionTitle: {
    color: colors.charcoal,
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: -0.3,
    marginBottom: 12,
    marginTop: 6,
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    marginTop: 6,
  },
  seeAll: {
    color: colors.forest,
    fontSize: 12,
    fontWeight: '800',
  },

  // ─── Impact Grid ───────────────────────────────────────────────────────────
  impactGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  impactCard: {
    width: '48.5%',
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: colors.lightGray,
    ...shadows.sm,
  },
  impactCardCO2: {
    backgroundColor: colors.successLight,
    borderColor: colors.lightGray,
  },
  impactCardFabric: {
    backgroundColor: '#FEF0E8',
    borderColor: colors.lightGray,
  },
  impactCardTailor: {
    backgroundColor: colors.infoLight,
    borderColor: colors.lightGray,
  },
  impactCardExchange: {
    backgroundColor: colors.warningLight,
    borderColor: colors.lightGray,
  },
  impactCardIcon: {
    width: 28,
    height: 28,
    borderRadius: 9,
    backgroundColor: colors.successLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  impactCardValue: {
    color: colors.forest,
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.5,
    lineHeight: 24,
  },
  impactCardLabel: {
    color: colors.charcoal,
    fontSize: 10,
    fontWeight: '800',
    marginTop: 2,
  },
  impactCardSub: {
    color: colors.warmGray,
    fontSize: 8,
    marginTop: 1,
  },

  // ─── Tailor Row ────────────────────────────────────────────────────────────
  tailorRow: {
    gap: 12,
    paddingBottom: 4,
    marginBottom: 22,
  },
  tailorCard: {
    width: 148,
    backgroundColor: colors.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.lightGray,
    overflow: 'hidden',
    ...shadows.sm,
  },
  tailorImage: {
    width: '100%',
    height: 105,
    backgroundColor: colors.sand,
  },
  tailorOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(20,61,96,0.25)',
    borderRadius: 18,
  },
  tailorVerified: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(20,61,96,0.65)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 99,
  },
  tailorVerifiedText: {
    color: colors.white,
    fontSize: 8,
    fontWeight: '800',
  },
  tailorBody: {
    padding: 10,
  },
  tailorName: {
    color: colors.charcoal,
    fontSize: 12,
    fontWeight: '900',
    marginBottom: 3,
  },
  tailorMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginBottom: 2,
  },
  tailorCity: {
    color: colors.warmGray,
    fontSize: 9,
    fontWeight: '600',
  },
  tailorSpec: {
    color: colors.charcoalMid,
    fontSize: 9,
    fontWeight: '600',
    marginBottom: 5,
  },
  tailorStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  tailorRating: {
    color: colors.charcoal,
    fontSize: 10,
    fontWeight: '800',
  },
  tailorDot: {
    color: colors.warmGrayLight,
    fontSize: 10,
  },
  tailorSold: {
    color: colors.warmGray,
    fontSize: 9,
    fontWeight: '600',
  },

  // ─── Achievement Badges ─────────────────────────────────────────────────────
  badgeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 22,
  },
  badgeCard: {
    width: '30%',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 18,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.lightGray,
    ...shadows.sm,
  },
  badgeCardLocked: {
    opacity: 0.55,
    backgroundColor: colors.ivoryDark,
  },
  badgeIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    position: 'relative',
  },
  badgeLockOverlay: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.lightGray,
  },
  badgeTitle: {
    color: colors.charcoal,
    fontSize: 9,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 2,
  },
  badgeTitleLocked: {
    color: colors.warmGrayLight,
  },
  badgeDesc: {
    color: colors.warmGray,
    fontSize: 8,
    textAlign: 'center',
    lineHeight: 11,
  },

  // ─── Community Section ──────────────────────────────────────────────────────
  communitySection: {
    borderRadius: 22,
    backgroundColor: colors.forestDark,
    padding: 18,
    marginBottom: 20,
    ...shadows.md,
  },
  communityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  communityTitle: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '900',
  },
  communitySub: {
    color: 'rgba(221,235,157,0.72)',
    fontSize: 11,
    lineHeight: 16,
    marginBottom: 16,
  },
  communityStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  communityStat: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
  },
  communityStatIcon: {
    width: 36,
    height: 36,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 7,
    backgroundColor: 'rgba(160,200,120,0.15)',
  },
  communityStatValue: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  communityStatLabel: {
    color: 'rgba(221,235,157,0.65)',
    fontSize: 8,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 3,
    lineHeight: 11,
  },

  // ─── Share Card ─────────────────────────────────────────────────────────────
  shareCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.sandLight,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1.5,
    borderColor: colors.sand,
    marginBottom: 22,
    ...shadows.sm,
  },
  shareCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  shareCardTitle: {
    color: colors.charcoal,
    fontSize: 14,
    fontWeight: '900',
  },
  shareCardSub: {
    color: colors.warmGray,
    fontSize: 11,
    marginTop: 2,
  },

  // ─── Quick Actions ──────────────────────────────────────────────────────────
  quickActions: {
    gap: 10,
    marginBottom: 10,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
    borderRadius: 18,
    ...shadows.sm,
  },
  actionBtnText: {
    flex: 1,
  },
  actionBtnTitle: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '900',
  },
  actionBtnSub: {
    color: 'rgba(255,255,255,0.68)',
    fontSize: 11,
    marginTop: 1,
  },
});
