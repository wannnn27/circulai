import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

import AnimatedPressable from '../components/AnimatedPressable';
import IconButton from '../components/IconButton';
import MetricCard from '../components/MetricCard';
import ProductCard from '../components/ProductCard';
import SectionHeader from '../components/SectionHeader';
import { useAppState } from '../state/AppContext';
import { layout } from '../styles/layout';
import { colors, shadows } from '../theme/colors';

const heroSlides = [
  {
    id: 'stylist',
    badge: 'Circular Fashion',
    badgeIcon: 'recycle',
    title: 'Find Your\nCircular Style',
    copy: 'Outfit cocok, kain sisa berkurang, UMKM lokal berkembang.',
    button: 'Coba AI Stylist',
    route: 'quiz',
    icon: 'lightning-bolt',
    visualLabel: 'AI Style Match',
    background: colors.forest,
    orbOne: 'rgba(232,220,200,0.08)',
    orbTwo: 'rgba(201,123,99,0.15)',
  },
  {
    id: 'made-to-order',
    badge: 'Made After You Order',
    badgeIcon: 'hanger',
    title: 'Made For You,\nNot For Landfill',
    copy: 'Kami mulai membuat setelah kamu memesan. Lebih personal, lebih sedikit limbah.',
    button: 'Jelajahi Koleksi',
    route: 'explore',
    icon: 'tshirt-crew-outline',
    visualLabel: 'On Demand',
    background: '#7A4A3C',
    orbOne: 'rgba(250,247,240,0.10)',
    orbTwo: 'rgba(232,220,200,0.13)',
  },
  {
    id: 'local',
    badge: 'Crafted Locally',
    badgeIcon: 'map-marker-radius-outline',
    title: 'Local Hands,\nBig Impact',
    copy: 'Setiap pesanan mendukung keterampilan dan pertumbuhan penjahit lokal.',
    button: 'Temukan Produk',
    route: 'explore',
    icon: 'account-group-outline',
    visualLabel: '134 Makers',
    background: '#31485B',
    orbOne: 'rgba(232,220,200,0.10)',
    orbTwo: 'rgba(201,123,99,0.14)',
  },
];

export default function HomeScreen({ isActive = true, onNavigate, onProductPress, onTailorPress, onExchange }) {
  const { width: screenWidth } = useWindowDimensions();
  const [category, setCategory] = useState('Semua');
  const [heroIndex, setHeroIndex] = useState(0);
  const { categories, products, tailors, wishlist, orders, cart, styleProfile, toggleWishlist, circularPoints } = useAppState();
  const heroScrollRef = useRef(null);
  const heroScrollX = useRef(new Animated.Value(0)).current;
  const heroIsDragging = useRef(false);
  const heroWidth = screenWidth;
  const featuredProducts = category === 'Semua'
    ? products.slice(0, 4)
    : products.filter((p) => p.category === category).slice(0, 4);

  useEffect(() => {
    if (!isActive) return undefined;

    const timer = setInterval(() => {
      if (heroIsDragging.current) return;

      const nextIndex = (heroIndex + 1) % heroSlides.length;
      heroScrollRef.current?.scrollTo({
        x: nextIndex * heroWidth,
        animated: true,
      });
      setHeroIndex(nextIndex);
    }, 4800);

    return () => clearInterval(timer);
  }, [heroIndex, heroWidth, isActive]);

  const handleHeroScrollEnd = (event) => {
    const nextIndex = Math.round(event.nativeEvent.contentOffset.x / heroWidth);
    heroIsDragging.current = false;
    setHeroIndex(nextIndex);
  };

  return (
    <ScrollView
      style={layout.scroll}
      contentContainerStyle={layout.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* ─── Header ─────────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <AnimatedPressable
          style={styles.searchBox}
          onPress={() => onNavigate('explore')}
          scaleDown={0.985}
        >
          <View style={styles.searchInner}>
            <Feather name="search" size={18} color={colors.warmGray} />
            <Text style={styles.searchText} numberOfLines={1}>Cari outfit...</Text>
          </View>
        </AnimatedPressable>

        <View style={styles.headerActions}>
          <View style={styles.cartWrap}>
            <IconButton name="shopping-cart" variant="default" size="md" onPress={() => onNavigate('cart')} />
            {!!cart.length && <View style={styles.cartBadge}><Text style={styles.cartBadgeText}>{cart.length}</Text></View>}
          </View>
          <IconButton name="bell" variant="default" size="md" />
        </View>
      </View>

      {/* ─── Animated hero carousel ─────────────────────────────────────── */}
      <View style={styles.heroCarousel}>
        <Animated.ScrollView
          ref={heroScrollRef}
          horizontal
          pagingEnabled
          bounces={false}
          decelerationRate="fast"
          showsHorizontalScrollIndicator={false}
          scrollEventThrottle={16}
          onScrollBeginDrag={() => {
            heroIsDragging.current = true;
          }}
          onScrollEndDrag={() => {
            heroIsDragging.current = false;
          }}
          onMomentumScrollEnd={handleHeroScrollEnd}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: heroScrollX } } }],
            { useNativeDriver: true },
          )}
        >
          {heroSlides.map((slide, slideIndex) => (
            <View key={slide.id} style={[styles.heroSlide, { width: heroWidth }]}>
              <AnimatedPressable
                style={[styles.heroCard, { backgroundColor: slide.background }]}
                onPress={() => onNavigate(slide.route)}
                scaleDown={0.985}
              >
                <View style={[styles.heroOrbOne, { backgroundColor: slide.orbOne }]} />
                <View style={[styles.heroOrbTwo, { backgroundColor: slide.orbTwo }]} />
                <View style={styles.heroOrbThree} />

                <View style={styles.heroContent}>
                  <View style={styles.heroBadge}>
                    <MaterialCommunityIcons name={slide.badgeIcon} size={12} color={colors.sand} />
                    <Text style={styles.heroBadgeText}>{slide.badge}</Text>
                  </View>

                  <Text style={styles.heroTitle}>{slide.title}</Text>
                  <Text style={styles.heroCopy}>{slide.copy}</Text>

                  <View style={styles.heroButton}>
                    <Text style={styles.heroButtonText}>
                      {slideIndex === 0 && styleProfile ? 'Lihat Profil AI' : slide.button}
                    </Text>
                    <View style={styles.heroButtonArrow}>
                      <Feather name="arrow-right" size={13} color={colors.sand} />
                    </View>
                  </View>
                </View>

                <View style={styles.heroRight}>
                  <View style={styles.heroVisualRingOuter} />
                  <View style={styles.heroVisualRingInner} />
                  <View style={styles.heroVisualMark}>
                    <MaterialCommunityIcons
                      name={slide.icon}
                      size={48}
                      color="rgba(232,220,200,0.76)"
                    />
                  </View>
                  <Text style={styles.heroVisualLabel}>{slide.visualLabel}</Text>
                </View>
              </AnimatedPressable>
            </View>
          ))}
        </Animated.ScrollView>

        <View style={styles.heroDots}>
          {heroSlides.map((slide, dotIndex) => {
            const dotScale = heroScrollX.interpolate({
              inputRange: [
                (dotIndex - 1) * heroWidth,
                dotIndex * heroWidth,
                (dotIndex + 1) * heroWidth,
              ],
              outputRange: [1, 2.6, 1],
              extrapolate: 'clamp',
            });
            const dotOpacity = heroScrollX.interpolate({
              inputRange: [
                (dotIndex - 1) * heroWidth,
                dotIndex * heroWidth,
                (dotIndex + 1) * heroWidth,
              ],
              outputRange: [0.35, 1, 0.35],
              extrapolate: 'clamp',
            });

            return (
              <Animated.View
                key={slide.id}
                style={[
                  styles.heroDot,
                  {
                    opacity: dotOpacity,
                    transform: [{ scaleX: dotScale }],
                  },
                ]}
              />
            );
          })}
        </View>
      </View>

      {/* ─── Custom Design Banner ────────────────────────────────────────── */}
      <AnimatedPressable
        style={styles.customBanner}
        onPress={() => onNavigate('custom-design')}
        scaleDown={0.985}
      >
        <View style={styles.customBannerContent}>
          <View style={styles.customBadge}>
            <MaterialCommunityIcons name="scissors-cutting" size={11} color={colors.white} />
            <Text style={styles.customBadgeText}>BESPOKE STUDIO</Text>
          </View>
          <Text style={styles.customBannerTitle}>Design Your Own Outfit</Text>
          <Text style={styles.customBannerDesc}>
            Pilih model, jenis kain sisa atelier, kerah & bentuk lengan kustommu.
          </Text>
        </View>
        <View style={styles.customBannerIcon}>
          <MaterialCommunityIcons name="palette-swatch-outline" size={26} color={colors.forest} />
        </View>
      </AnimatedPressable>

      {/* ─── Circular Exchange Banner ────────────────────────────────────── */}
      <AnimatedPressable
        style={styles.exchangeBanner}
        onPress={() => (onExchange ? onExchange() : onNavigate('exchange'))}
        scaleDown={0.985}
      >
        <View style={styles.exchangeBannerContent}>
          <View style={styles.exchangeBadge}>
            <MaterialCommunityIcons name="recycle" size={11} color={colors.white} />
            <Text style={styles.exchangeBadgeText}>CIRCULAR REWARDS</Text>
          </View>
          <Text style={styles.exchangeBannerTitle}>Tukar Barang Bekas → Poin</Text>
          <Text style={styles.exchangeBannerDesc}>
            Kirim kain perca / baju bekasmu untuk didaur ulang & dapatkan diskon belanja!
          </Text>
        </View>
        <View style={styles.exchangeBannerRight}>
          <View style={styles.exchangePointPill}>
            <Feather name="star" size={12} color={colors.warning} />
            <Text style={styles.exchangePointText}>{(circularPoints ?? 320).toLocaleString('id-ID')} pts</Text>
          </View>
          <View style={styles.exchangeBannerBtn}>
            <Feather name="arrow-right" size={14} color={colors.white} />
          </View>
        </View>
      </AnimatedPressable>

      {/* ─── Category chips ─────────────────────────────────────────────── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryRow}
      >
        {categories.map((item) => (
          <Pressable
            key={item}
            style={[styles.chip, category === item && styles.chipActive]}
            onPress={() => setCategory(item)}
          >
            <Text style={[styles.chipText, category === item && styles.chipTextActive]}>
              {item}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* ─── Metric row ─────────────────────────────────────────────────── */}
      <View style={styles.metricRow}>
        <MetricCard value={`${wishlist.length}`} label="Wishlist" />
        <MetricCard value={`${orders.length}`} label="Pesanan" />
        <MetricCard value="320" label="Impact Pts" accent />
      </View>

      {/* ─── Made-to-Order picks ────────────────────────────────────────── */}
      <SectionHeader
        title="Made-to-Order Picks"
        action="Lihat Semua"
        onAction={() => onNavigate('explore')}
      />
      <View style={styles.productGrid}>
        {featuredProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            grid
            favorite={wishlist.includes(product.id)}
            onToggleFavorite={() => toggleWishlist(product.id)}
            onPress={() => onProductPress(product)}
          />
        ))}
      </View>

      {/* ─── Local Tailor Spotlight ─────────────────────────────────────── */}
      <SectionHeader title="Local Tailor Spotlight" action="Lihat Semua" />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tailorRow}
      >
        {tailors.map((tailor) => (
          <AnimatedPressable
            key={tailor.id}
            style={styles.tailorCard}
            onPress={() => onTailorPress?.(tailor)}
            scaleDown={0.97}
          >
            <ImageBackground
              source={{ uri: tailor.image }}
              style={styles.tailorImage}
              imageStyle={styles.tailorImageStyle}
            >
              {/* Gradient shade */}
              <View style={styles.tailorGradient} />
              <View style={styles.tailorBadge}>
                <MaterialCommunityIcons name="leaf" size={10} color={colors.white} />
                <Text style={styles.tailorBadgeText}>Lokal</Text>
              </View>
            </ImageBackground>
            <View style={styles.tailorInfo}>
              <Text style={styles.tailorName} numberOfLines={1}>{tailor.name}</Text>
              <View style={styles.tailorMeta}>
                <Feather name="map-pin" size={11} color={colors.warmGray} />
                <Text style={styles.tailorCity} numberOfLines={1}>{tailor.city}</Text>
              </View>
              <Text style={styles.tailorSpecialty} numberOfLines={2}>
                {tailor.specialty}
              </Text>
              <View style={styles.tailorFooter}>
                <View style={styles.tailorRating}>
                  <Feather name="star" size={11} color={colors.warning} />
                  <Text style={styles.tailorRatingText}>{tailor.rating}</Text>
                </View>
                <Text style={styles.tailorSold}>{tailor.sold} terjual</Text>
              </View>
            </View>
          </AnimatedPressable>
        ))}
      </ScrollView>

      {/* ─── Impact Card ────────────────────────────────────────────────── */}
      <View style={styles.impactCard}>
        <View style={styles.impactHeader}>
          <View style={styles.impactIconBg}>
            <MaterialCommunityIcons name="recycle" size={20} color={colors.white} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.impactTitle}>Your Style, Less Waste</Text>
            <Text style={styles.impactCopy}>
              Setiap pesanan membantu mengurangi kain sisa & mendukung UMKM fashion lokal.
            </Text>
          </View>
        </View>

        <View style={styles.impactDivider} />

        <View style={styles.impactStats}>
          <ImpactStat icon="scissors-cutting" value="2.4 ton" label="Kain sisa dimanfaatkan" />
          <View style={styles.impactStatDivider} />
          <ImpactStat icon="account-group-outline" value="134" label="Penjahit lokal" />
          <View style={styles.impactStatDivider} />
          <ImpactStat icon="package-variant" value="1,280" label="Made-to-order" />
        </View>
      </View>
    </ScrollView>
  );
}

function ImpactStat({ icon, value, label }) {
  return (
    <View style={styles.impactStat}>
      <View style={styles.impactStatIcon}>
        <MaterialCommunityIcons name={icon} size={18} color={colors.forest} />
      </View>
      <Text style={styles.impactValue}>{value}</Text>
      <Text style={styles.impactLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  // ─── Header ───────────────────────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    marginBottom: 18,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 7,
  },
  cartWrap: {
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    right: -3,
    top: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.terracotta,
    borderWidth: 2,
    borderColor: colors.ivory,
  },
  cartBadgeText: {
    color: colors.white,
    fontSize: 8,
    fontWeight: '900',
  },
  // ─── Search bar ───────────────────────────────────────────────────────────
  searchBox: {
    flex: 1,
    minWidth: 0,
  },
  searchInner: {
    minHeight: 42,
    borderRadius: 14,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.lightGray,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 13,
    gap: 9,
    ...shadows.sm,
  },
  searchText: {
    flex: 1,
    color: colors.warmGray,
    fontSize: 12,
    fontWeight: '600',
  },
  // ─── Full-width hero banner ───────────────────────────────────────────────
  heroCarousel: {
    position: 'relative',
    marginHorizontal: -20,
    marginBottom: 20,
    overflow: 'hidden',
  },
  heroSlide: {
    minHeight: 224,
  },
  heroCard: {
    width: '100%',
    minHeight: 224,
    overflow: 'hidden',
    backgroundColor: colors.forest,
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroOrbOne: {
    position: 'absolute',
    width: 250,
    height: 250,
    borderRadius: 125,
    right: -90,
    top: -100,
    backgroundColor: 'rgba(232,220,200,0.08)',
  },
  heroOrbTwo: {
    position: 'absolute',
    width: 170,
    height: 170,
    borderRadius: 85,
    left: -72,
    bottom: -96,
    backgroundColor: 'rgba(201,123,99,0.15)',
  },
  heroOrbThree: {
    position: 'absolute',
    width: 110,
    height: 110,
    borderRadius: 55,
    right: 18,
    bottom: -40,
    backgroundColor: 'rgba(232,220,200,0.05)',
  },
  heroContent: {
    width: '64%',
    minHeight: 224,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 30,
    zIndex: 2,
  },
  heroBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: 9999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: 'rgba(232,220,200,0.18)',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(232,220,200,0.15)',
  },
  heroBadgeText: {
    color: colors.sand,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  heroTitle: {
    color: colors.white,
    fontSize: 23,
    fontWeight: '900',
    lineHeight: 28,
    letterSpacing: -0.5,
  },
  heroCopy: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: 11,
    lineHeight: 16,
    marginTop: 6,
    maxWidth: 210,
  },
  heroButton: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingVertical: 3,
    marginTop: 12,
  },
  heroButtonText: {
    color: colors.sand,
    fontSize: 11,
    fontWeight: '900',
  },
  heroButtonArrow: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(232,220,200,0.18)',
  },
  heroRight: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: '42%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 10,
  },
  heroVisualRingOuter: {
    position: 'absolute',
    width: 164,
    height: 164,
    borderRadius: 82,
    borderWidth: 1,
    borderColor: 'rgba(232,220,200,0.16)',
  },
  heroVisualRingInner: {
    position: 'absolute',
    width: 108,
    height: 108,
    borderRadius: 54,
    borderWidth: 1,
    borderColor: 'rgba(232,220,200,0.20)',
  },
  heroVisualMark: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroVisualLabel: {
    color: 'rgba(255,255,255,0.52)',
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    textAlign: 'center',
    marginTop: 12,
  },
  heroDots: {
    position: 'absolute',
    left: 20,
    bottom: 13,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  heroDot: {
    width: 6,
    height: 6,
    borderRadius: 99,
    backgroundColor: colors.sand,
  },
  // ─── Categories ───────────────────────────────────────────────────────────
  categoryRow: {
    gap: 8,
    paddingBottom: 20,
  },
  chip: {
    borderRadius: 9999,
    paddingHorizontal: 16,
    paddingVertical: 9,
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.lightGray,
  },
  chipActive: {
    backgroundColor: colors.forest,
    borderColor: colors.forest,
  },
  chipText: {
    color: colors.charcoal,
    fontSize: 13,
    fontWeight: '600',
  },
  chipTextActive: {
    color: colors.white,
    fontWeight: '800',
  },
  // ─── Metrics ──────────────────────────────────────────────────────────────
  metricRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  // ─── Product grid ─────────────────────────────────────────────────────────
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 16,
    marginBottom: 6,
  },
  // ─── Tailor cards ─────────────────────────────────────────────────────────
  tailorRow: {
    gap: 12,
    paddingBottom: 20,
  },
  tailorCard: {
    width: 188,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: colors.white,
    ...shadows.md,
  },
  tailorImage: {
    height: 110,
    justifyContent: 'flex-end',
    padding: 10,
  },
  tailorImageStyle: {
    backgroundColor: colors.sand,
  },
  tailorGradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(31,36,33,0.25)',
  },
  tailorBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 9999,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: 'rgba(47,79,58,0.85)',
  },
  tailorBadgeText: {
    color: colors.white,
    fontSize: 9,
    fontWeight: '800',
  },
  tailorInfo: {
    padding: 12,
  },
  tailorName: {
    color: colors.charcoal,
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: -0.2,
  },
  tailorMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  tailorCity: {
    color: colors.warmGray,
    fontSize: 11,
    flex: 1,
  },
  tailorSpecialty: {
    color: colors.warmGray,
    fontSize: 10,
    lineHeight: 14,
    marginTop: 5,
  },
  tailorFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 9,
  },
  tailorRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: colors.warningLight,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 9999,
  },
  tailorRatingText: {
    color: colors.warning,
    fontSize: 10,
    fontWeight: '800',
  },
  tailorSold: {
    color: colors.warmGray,
    fontSize: 10,
  },
  // ─── Impact card ──────────────────────────────────────────────────────────
  impactCard: {
    borderRadius: 28,
    overflow: 'hidden',
    backgroundColor: colors.sand,
    marginTop: 4,
    padding: 18,
    ...shadows.sm,
  },
  impactHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 14,
  },
  impactIconBg: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.forest,
    flexShrink: 0,
  },
  impactTitle: {
    color: colors.charcoal,
    fontSize: 15,
    fontWeight: '900',
    marginBottom: 4,
  },
  impactCopy: {
    color: colors.warmGray,
    fontSize: 12,
    lineHeight: 17,
  },
  impactDivider: {
    height: 1,
    backgroundColor: 'rgba(122,122,114,0.20)',
    marginBottom: 14,
  },
  impactStats: {
    flexDirection: 'row',
    gap: 0,
  },
  impactStat: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  impactStatIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(47,79,58,0.10)',
    marginBottom: 2,
  },
  impactStatDivider: {
    width: 1,
    backgroundColor: 'rgba(122,122,114,0.20)',
  },
  impactValue: {
    color: colors.forest,
    fontSize: 15,
    fontWeight: '900',
  },
  impactLabel: {
    color: colors.warmGray,
    fontSize: 9,
    lineHeight: 13,
    textAlign: 'center',
  },
  // ─── Custom Design Banner Styles ───────────────────────────────────────────
  customBanner: {
    borderRadius: 24,
    backgroundColor: colors.sandLight,
    borderWidth: 1.5,
    borderColor: colors.lightGray,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    ...shadows.sm,
  },
  customBannerContent: {
    flex: 1,
    paddingRight: 12,
  },
  customBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.forest,
    borderRadius: 9999,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginBottom: 8,
  },
  customBadgeText: {
    color: colors.white,
    fontSize: 9,
    fontWeight: '850',
    letterSpacing: 0.4,
  },
  customBannerTitle: {
    color: colors.charcoal,
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  customBannerDesc: {
    color: colors.warmGray,
    fontSize: 12,
    lineHeight: 16,
    marginTop: 4,
  },
  customBannerIcon: {
    width: 50,
    height: 50,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.lightGray,
    ...shadows.sm,
  },
  // ─── Exchange Banner Styles ───────────────────────────────────────────────
  exchangeBanner: {
    borderRadius: 24,
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: 'rgba(201,123,99,0.3)',
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    ...shadows.sm,
  },
  exchangeBannerContent: {
    flex: 1,
    paddingRight: 12,
  },
  exchangeBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.terracotta,
    borderRadius: 9999,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginBottom: 8,
  },
  exchangeBadgeText: {
    color: colors.white,
    fontSize: 9,
    fontWeight: '850',
    letterSpacing: 0.4,
  },
  exchangeBannerTitle: {
    color: colors.charcoal,
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  exchangeBannerDesc: {
    color: colors.warmGray,
    fontSize: 12,
    lineHeight: 16,
    marginTop: 4,
  },
  exchangeBannerRight: {
    alignItems: 'center',
    gap: 8,
  },
  exchangePointPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.warningLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  exchangePointText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.warning,
  },
  exchangeBannerBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.terracotta,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
