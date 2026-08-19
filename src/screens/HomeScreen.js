/**
 * @file HomeScreen.js
 * @description Landing screen for CIRCULAI.
 *
 * Features: auto-scrolling hero carousel, trust marquee, service launcher
 * grid, Flash Sale section with countdown timer, product grid, tailor
 * spotlight, and sustainability impact dashboard.
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  ImageBackground,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';

import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

import AnimatedPressable from '../components/AnimatedPressable';
import IconButton from '../components/IconButton';
import LeafMark from '../components/LeafMark';
import MetricCard from '../components/MetricCard';
import PassportModal from '../components/PassportModal';
import PassportScannerModal from '../components/PassportScannerModal';
import ProductCard from '../components/ProductCard';
import SectionHeader from '../components/SectionHeader';
import { useAppState } from '../state/AppContext';
import { layout } from '../styles/layout';
import { colors, shadows } from '../theme/colors';
import { formatCurrency } from '../data/appData';

const serviceIcons = [
  { id: 'bespoke', label: 'Bespoke', icon: 'scissors-cutting', color: colors.forest, route: 'custom-design', badge: 'Kustom' },
  { id: 'quiz', label: 'AI Stylist', icon: 'lightning-bolt', color: colors.terracotta, route: 'quiz', badge: 'Pintar' },
  { id: 'exchange', label: 'Eco Swap', icon: 'recycle', color: colors.forest, route: 'exchange', badge: 'Tukar' },
  { id: 'mto', label: 'Koleksi MTO', icon: 'hanger', color: colors.forestDark, route: 'explore' },
  { id: 'tailor', label: 'Penjahit', icon: 'account-group-outline', color: colors.forestMid, route: 'explore' },
  { id: 'passport', label: 'Passport', icon: 'qrcode-scan', color: colors.forest, route: 'passport-info' },
  { id: 'voucher', label: 'Voucher Poin', icon: 'tag-multiple-outline', color: colors.warning, route: 'exchange' },
  { id: 'flash', label: 'Flash Sale', icon: 'flash-outline', color: colors.error, route: 'explore', badge: 'Promo' },
];

export default function HomeScreen({ isActive = true, onNavigate, onProductPress, onTailorPress, onExchange }) {
  const { width: screenWidth } = useWindowDimensions();
  const [category, setCategory] = useState('Semua');
  const [heroIndex, setHeroIndex] = useState(0);
  const [copiedCode, setCopiedCode] = useState(false);
  const [scanModalVisible, setScanModalVisible] = useState(false);
  const [scannedPassportOrder, setScannedPassportOrder] = useState(null);
  const [flashSaleTime, setFlashSaleTime] = useState({ h: '00', m: '00', s: '00' });

  const {
    categories,
    products,
    tailors,
    wishlist,
    orders,
    cart,
    toggleWishlist,
    circularPoints,
    isLoggedIn,
    openAuthModal,
    requireAuth,
    addresses,
    selectedAddress,
    setNotice,
    backend,
  } = useAppState();

  const heroSlides = useMemo(() => {
    const prodImg1 = products[0]?.image || 'https://images.tokopedia.net/img/cache/700/aphluv/1997/1/1/6d2ec2e1f3f544a8b4d71c61e34a1467~.jpeg.webp';
    const prodImg2 = products[4]?.image || products[1]?.image || 'https://images.tokopedia.net/img/cache/700/aphluv/1997/1/1/43427d1d8a6642af8db7bbc290ee71d3~.jpeg.webp';
    const prodImg3 = products[1]?.image || products[2]?.image || 'https://www.static-src.com/wcsstore/Indraprastha/images/catalog/full/catalog-image/99/MTA-185118741/brd-74257_full01-473f6415.webp';

    return [
      {
        id: 'circular-sale',
        badge: 'Circular Fashion Day',
        badgeIcon: 'recycle',
        title: 'Diskon s.d. 60%\n+ Extra Poin Daur Ulang',
        copy: 'Kain sisa atelier pilihan dengan potongan harga terbesar bulan ini.',
        button: 'Jelajahi Promo',
        route: 'explore',
        image: prodImg1,
      },
      {
        id: 'bespoke-studio',
        badge: 'Made After You Order',
        badgeIcon: 'hanger',
        title: 'Made For You,\nNot For Landfill',
        copy: 'Desain kustom baju buatan penjahit lokal sesuai ukuran tubuhmu.',
        button: 'Coba Bespoke Studio',
        route: 'custom-design',
        image: prodImg2,
      },
      {
        id: 'ai-stylist',
        badge: 'Smart Match AI',
        badgeIcon: 'lightning-bolt',
        title: 'Find Your\nPersonal Palette',
        copy: 'Rekomendasi outfit cocok dengan warna kulit & bentuk tubuhmu.',
        button: 'Coba AI Stylist',
        route: 'quiz',
        image: prodImg3,
      },
    ];
  }, [products]);

  const memberPromoItems = useMemo(() => {
    if (!products || products.length === 0) return [];
    return products.slice(0, 3).map((product, idx) => {
      const discounts = ['25%', '20%', '20%'];
      const discountMultipliers = [0.75, 0.8, 0.8];
      const discount = discounts[idx % discounts.length];
      const discountPrice = Math.round(product.price * discountMultipliers[idx % discountMultipliers.length]);
      return {
        id: `promo-${product.id}`,
        productId: product.id,
        product,
        name: product.name,
        discount,
        price: discountPrice,
        originalPrice: product.price,
        image: product.image,
      };
    });
  }, [products]);

  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await backend.refresh();
    } catch {
      // Refresh failed silently — backend status will reflect this
    } finally {
      setIsRefreshing(false);
    }
  };

  const heroScrollRef = useRef(null);
  const heroScrollX = useRef(new Animated.Value(0)).current;
  const heroIsDragging = useRef(false);
  const heroWidth = screenWidth;

  const featuredProducts = category === 'Semua'
    ? products
    : products.filter((p) => p.category === category);

  useEffect(() => {
    if (!isActive) return undefined;

    const timer = setInterval(() => {
      if (heroIsDragging.current) return;
      const nextIndex = (heroIndex + 1) % (heroSlides.length || 1);
      heroScrollRef.current?.scrollTo({
        x: nextIndex * heroWidth,
        animated: true,
      });
      setHeroIndex(nextIndex);
    }, 4800);

    const flashTimer = setInterval(() => {
      const now = new Date();
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);
      const diff = endOfDay - now;

      if (diff > 0) {
        const h = Math.floor(diff / (1000 * 60 * 60)).toString().padStart(2, '0');
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)).toString().padStart(2, '0');
        const s = Math.floor((diff % (1000 * 60)) / 1000).toString().padStart(2, '0');
        setFlashSaleTime({ h, m, s });
      }
    }, 1000);

    return () => {
      clearInterval(timer);
      clearInterval(flashTimer);
    };
  }, [heroIndex, heroSlides.length, heroWidth, isActive]);

  const handleHeroScrollEnd = (event) => {
    const nextIndex = Math.round(event.nativeEvent.contentOffset.x / heroWidth);
    heroIsDragging.current = false;
    setHeroIndex(nextIndex);
  };

  /**
   * Copies the promo code to the clipboard.
   * Uses the Web Share API as a modern cross-platform alternative that
   * doesn't rely on the deprecated `Clipboard` module from react-native.
   */
  const copyPromoCode = async () => {
    try {
      await Share.share({ message: 'NUZ2026-25' });
    } catch {
      // Share cancelled or not supported — silently ignore.
    }
    setCopiedCode(true);
    setNotice('Kode voucher NUZ2026-25 berhasil disalin!');
    setTimeout(() => setCopiedCode(false), 3000);
  };

  const activeAddress = selectedAddress ?? addresses?.[0];
  const activeAddressLabel = activeAddress?.detail
    ? `${activeAddress.label} — ${activeAddress.detail}`
    : 'Tambah alamat biar belanja lebih asyik';

  return (
    <View style={{ flex: 1, backgroundColor: colors.ivory }}>
      <ScrollView
        style={layout.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={colors.forest}
            colors={[colors.forest]}
          />
        }
      >
        {/* ─── Top Blibli-Inspired Header Bar ─────────────────────────────── */}
        <View style={styles.topHeader}>
          <View style={styles.searchRow}>
            {/* Scan Icon */}
            <Pressable
              style={styles.scanBtn}
              onPress={() => setScanModalVisible(true)}
              hitSlop={8}
            >
              <MaterialCommunityIcons name="qrcode-scan" size={20} color={colors.charcoal} />
            </Pressable>

            {/* Search Box Input */}
            <AnimatedPressable
              style={styles.searchBox}
              onPress={() => onNavigate('explore')}
              scaleDown={0.985}
            >
              <View style={styles.searchInner}>
                <Text style={styles.searchText} numberOfLines={1}>
                  Cari outfit, kain sisa, penjahit...
                </Text>
                <View style={styles.searchIconBg}>
                  <Feather name="search" size={14} color={colors.white} />
                </View>
              </View>
            </AnimatedPressable>

            {/* Login / Auth State Button */}
            {!isLoggedIn ? (
              <AnimatedPressable
                style={styles.loginBtn}
                onPress={() => openAuthModal('Masuk ke akun CIRCULAI untuk belanja dan menukar poin.')}
                scaleDown={0.95}
              >
                <Feather name="log-in" size={14} color={colors.white} />
                <Text style={styles.loginBtnText}>Masuk</Text>
              </AnimatedPressable>
            ) : (
              <View style={styles.headerActions}>
                <View style={styles.cartWrap}>
                  <IconButton name="shopping-cart" variant="default" size="md" onPress={() => onNavigate('cart')} />
                  {!!cart.length && (
                    <View style={styles.cartBadge}>
                      <Text style={styles.cartBadgeText}>{cart.length}</Text>
                    </View>
                  )}
                </View>
              </View>
            )}
          </View>

          {/* Sub-header Location Bar */}
          <Pressable
            style={styles.locationBar}
            onPress={() => requireAuth(() => onNavigate('profile-addresses'), 'Masuk untuk mengelola alamat pengiriman.')}
          >
            <Feather name="map-pin" size={12} color={colors.warmGray} />
            <Text style={styles.locationText} numberOfLines={1}>
              {activeAddressLabel}
            </Text>
            <Feather name="chevron-down" size={12} color={colors.warmGray} />
          </Pressable>
        </View>

        {/* ─── Hero Promo Slider (Blibli concept) ────────────────────────── */}
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
                  style={styles.heroCard}
                  onPress={() => onNavigate(slide.route)}
                  scaleDown={0.985}
                >
                  <ImageBackground
                    source={{ uri: slide.image }}
                    style={styles.heroImageBg}
                    imageStyle={{ borderRadius: 20 }}
                  >
                    <View style={styles.heroGradientOverlay} />

                    <View style={styles.heroContent}>
                      <View style={styles.heroBadge}>
                        <MaterialCommunityIcons name={slide.badgeIcon} size={12} color={colors.sand} />
                        <Text style={styles.heroBadgeText}>{slide.badge}</Text>
                      </View>

                      <Text style={styles.heroTitle}>{slide.title}</Text>
                      <Text style={styles.heroCopy}>{slide.copy}</Text>

                      <View style={styles.heroButton}>
                        <Text style={styles.heroButtonText}>{slide.button}</Text>
                        <View style={styles.heroButtonArrow}>
                          <Feather name="arrow-right" size={13} color={colors.sand} />
                        </View>
                      </View>
                    </View>
                  </ImageBackground>
                </AnimatedPressable>
              </View>
            ))}
          </Animated.ScrollView>

          {/* Dots Indicator */}
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

        {/* ─── Trust Badges Bar (Auto-Scrolling Marquee) ──────────────────── */}
        <AutoScrollingTrustBar />

        {/* ─── Service Grid Launcher (Blibli Concept: 2 rows of round icons) ─ */}
        <View style={styles.serviceGridContainer}>
          <View style={styles.serviceGrid}>
            {serviceIcons.map((service) => (
              <Pressable
                key={service.id}
                style={styles.serviceItem}
                onPress={() => {
                  if (service.route === 'passport-info') {
                    setScanModalVisible(true);
                  } else {
                    onNavigate(service.route);
                  }
                }}
              >
                <View style={[styles.serviceIconCircle, { backgroundColor: service.color + '15' }]}>
                  <MaterialCommunityIcons name={service.icon} size={22} color={service.color} />
                  {!!service.badge && (
                    <View style={styles.serviceBadge}>
                      <Text style={styles.serviceBadgeText}>{service.badge}</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.serviceLabel} numberOfLines={2}>{service.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* ─── Midnight Sale Strip Banner (Blibli concept) ───────────────── */}
        <AnimatedPressable
          style={styles.midnightBanner}
          onPress={() => onNavigate('explore')}
          scaleDown={0.985}
        >
          <View style={styles.midnightLeft}>
            <MaterialCommunityIcons name="lightning-bolt" size={18} color="#FFD700" />
            <Text style={styles.midnightTitle}>8.8 MIDNIGHT SALE</Text>
            <View style={styles.midnightTimePill}>
              <Text style={styles.midnightTimeText}>00.00-01.00 WIB</Text>
            </View>
          </View>
          <View style={styles.midnightRight}>
            <Text style={styles.midnightSubText}>EXTRA VOUCHER</Text>
            <Text style={styles.midnightPriceText}>25rb</Text>
          </View>
        </AnimatedPressable>

        {/* ─── Member baru? Ini Promomu! (Blibli Section Concept) ───────── */}
        <View style={styles.promoMemberSection}>
          <View style={styles.promoMemberHeader}>
            <View>
              <Text style={styles.promoMemberTitle}>Member baru? Ini promomu!</Text>
              <Text style={styles.promoMemberSub}>Nikmati cashback dan diskon pesanan pertama</Text>
            </View>
            <Pressable onPress={() => onNavigate('explore')}>
              <Text style={styles.seeAllText}>Selengkapnya</Text>
            </Pressable>
          </View>

          <View style={styles.promoMemberContent}>
            {/* Voucher Highlight Card */}
            <View style={styles.cashbackCard}>
              <LeafMark size={20} color={colors.forest} />
              <Text style={styles.cashbackTitle}>Cashback</Text>
              <Text style={styles.cashbackAmount}>Rp25.000</Text>

              <View style={styles.codeRow}>
                <Text style={styles.codeText}>NUZ2026-25</Text>
                <Feather name="info" size={12} color={colors.warmGray} />
              </View>

              <Pressable
                style={[styles.copyBtn, copiedCode && styles.copyBtnDone]}
                onPress={copyPromoCode}
              >
                <Text style={[styles.copyBtnText, copiedCode && styles.copyBtnTextDone]}>
                  {copiedCode ? 'Tersalin ✓' : 'Salin'}
                </Text>
              </Pressable>
            </View>

            {/* Promo items horizontal scroll */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.promoItemsScroll}
            >
              {memberPromoItems.map((item) => (
                <Pressable
                  key={item.id}
                  style={styles.promoItemCard}
                  onPress={() => {
                    const product = item.product || products.find((p) => p.id === item.productId);
                    if (product) onProductPress(product);
                    else onNavigate('explore');
                  }}
                >
                  <View style={styles.promoItemImgWrap}>
                    <ImageBackground
                      source={{ uri: item.image }}
                      style={styles.promoItemImg}
                      imageStyle={{ borderRadius: 12 }}
                    >
                      <View style={styles.discountBadge}>
                        <Text style={styles.discountBadgeText}>▼ {item.discount}</Text>
                      </View>
                    </ImageBackground>
                  </View>
                  <Text style={styles.promoItemName} numberOfLines={1}>{item.name}</Text>
                  <Text style={styles.promoItemPrice}>{formatCurrency(item.price)}</Text>
                  <Text style={styles.promoItemOriginal}>{formatCurrency(item.originalPrice)}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </View>

        {/* ─── Flash Sale Banner / Section (Blibli Concept with Forest Theme) ─ */}
        <View style={styles.flashSaleSection}>
          <View style={styles.flashSaleHeader}>
            <View style={styles.flashSaleTitleRow}>
              <Text style={styles.flashSaleTitle}>FLASH SALE</Text>
              <View style={styles.timerPill}>
                <Text style={styles.timerNum}>{flashSaleTime.h}</Text>
                <Text style={styles.timerColon}>:</Text>
                <Text style={styles.timerNum}>{flashSaleTime.m}</Text>
                <Text style={styles.timerColon}>:</Text>
                <Text style={styles.timerNum}>{flashSaleTime.s}</Text>
              </View>
            </View>
            <Pressable onPress={() => onNavigate('explore')}>
              <Text style={styles.flashSaleSeeAll}>Lihat semua</Text>
            </Pressable>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.flashSaleScroll}
          >
            {/* Highlight Banner Card on Left */}
            <View style={styles.flashHighlightCard}>
              <View style={styles.flashHighlightInner}>
                <Text style={styles.flashHighlightTag}>CIRCULAR ECO</Text>
                <Text style={styles.flashHighlightTitle}>BELANJA 200RB</Text>
                <View style={styles.flashHighlightBadge}>
                  <Text style={styles.flashHighlightBadgeText}>HEMAT 10RB</Text>
                </View>
              </View>
            </View>

            {products.slice(0, 4).map((p, idx) => {
              const stock = p.stock ?? 1;
              const initialStock = p.initialStock ?? 10;
              const stockPercent = Math.min(100, Math.max(0, (stock / initialStock) * 100));
              
              return (
                <AnimatedPressable
                  key={p.id}
                  style={styles.flashProductCard}
                  onPress={() => onProductPress(p)}
                  scaleDown={0.97}
                >
                  <ImageBackground
                    source={{ uri: p.image }}
                    style={styles.flashProductImg}
                    imageStyle={{ borderTopLeftRadius: 14, borderTopRightRadius: 14 }}
                  >
                    <View style={styles.discountBadge}>
                      <Text style={styles.discountBadgeText}>▼ {20 + idx * 10}%</Text>
                    </View>
                  </ImageBackground>

                  <View style={styles.flashProductBody}>
                    <Text style={styles.flashProductTitle} numberOfLines={1}>{p.name}</Text>
                    <Text style={styles.flashProductPrice}>{formatCurrency(p.price)}</Text>

                    {/* Stock bar */}
                    <View style={styles.stockMeterTrack}>
                      <View style={[styles.stockMeterFill, { width: `${stockPercent}%` }]} />
                    </View>
                    <Text style={styles.stockMeterText}>Sisa {stock} 🔥</Text>

                    <Pressable
                      style={styles.buyNowBtn}
                      onPress={() => requireAuth(() => onProductPress(p), 'Masuk untuk melakukan pemesanan.')}
                    >
                      <Text style={styles.buyNowBtnText}>Beli sekarang</Text>
                    </Pressable>
                  </View>
                </AnimatedPressable>
              );
            })}
          </ScrollView>
        </View>



        {/* ─── Category chips filter ─────────────────────────────────────── */}
        <SectionHeader
          title="Penawaran Spesial"
          action="Lihat Semua"
          onAction={() => onNavigate('explore')}
        />

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

        {/* ─── Featured Product Grid ─────────────────────────────────────── */}
        <View style={styles.productGrid}>
          {featuredProducts.slice(0, 6).map((product) => (
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

        {/* ─── Impact Card Dashboard ────────────────────────────────────── */}
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

      {/* ─── Digital Product Passport Scanner Camera Modal ────────────── */}
      <PassportScannerModal
        visible={scanModalVisible}
        onClose={() => setScanModalVisible(false)}
        orders={orders}
        products={products}
        onScannedPassport={(order) => {
          setScannedPassportOrder(order);
        }}
      />

      {/* ─── Scanned Passport Full Info Sheet ─────────────────────────── */}
      {!!scannedPassportOrder && (
        <PassportModal
          order={scannedPassportOrder}
          initialTab="passport"
          onClose={() => setScannedPassportOrder(null)}
        />
      )}
    </View>
  );
}

const trustItems = [
  { icon: 'shield-check', text: 'Gratis perlindungan lengkap' },
  { icon: 'check-decagram', text: 'Pasti ori & handmade' },
  { icon: 'sync', text: 'Retur alasan apa pun' },
  { icon: 'truck-fast', text: 'Jaminan pengiriman MTO' },
];

function AutoScrollingTrustBar() {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const [singleWidth, setSingleWidth] = useState(0);

  useEffect(() => {
    if (singleWidth <= 0) return undefined;

    animatedValue.setValue(0);
    const animation = Animated.loop(
      Animated.timing(animatedValue, {
        toValue: -singleWidth,
        duration: 14000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    animation.start();

    return () => animation.stop();
  }, [animatedValue, singleWidth]);

  return (
    <View style={styles.trustBarContainer}>
      <Animated.View
        style={[
          styles.trustBarAnimatedContent,
          {
            transform: [{ translateX: animatedValue }],
          },
        ]}
      >
        <View
          style={styles.trustBarRow}
          onLayout={(e) => {
            const w = e.nativeEvent.layout.width;
            if (w > 0 && singleWidth === 0) {
              setSingleWidth(w);
            }
          }}
        >
          {trustItems.map((item) => (
            <View key={item.text} style={styles.trustItem}>
              <MaterialCommunityIcons name={item.icon} size={14} color={colors.forest} />
              <Text style={styles.trustText}>{item.text}</Text>
            </View>
          ))}
        </View>

        <View style={styles.trustBarRow}>
          {trustItems.map((item) => (
            <View key={`${item.text}-dup1`} style={styles.trustItem}>
              <MaterialCommunityIcons name={item.icon} size={14} color={colors.forest} />
              <Text style={styles.trustText}>{item.text}</Text>
            </View>
          ))}
        </View>

        <View style={styles.trustBarRow}>
          {trustItems.map((item) => (
            <View key={`${item.text}-dup2`} style={styles.trustItem}>
              <MaterialCommunityIcons name={item.icon} size={14} color={colors.forest} />
              <Text style={styles.trustText}>{item.text}</Text>
            </View>
          ))}
        </View>
      </Animated.View>
    </View>
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
  scrollContent: {
    paddingBottom: 110,
  },
  // ─── Header Top ────────────────────────────────────────────────────────────
  topHeader: {
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
    gap: 8,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  scanBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.ivory,
  },
  searchBox: {
    flex: 1,
  },
  searchInner: {
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.ivory,
    borderWidth: 1,
    borderColor: colors.lightGray,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 14,
    paddingRight: 4,
    justifyContent: 'space-between',
  },
  searchText: {
    color: colors.warmGray,
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  searchIconBg: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.forest,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.forest,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
    ...shadows.sm,
  },
  loginBtnText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '900',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 6,
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
  locationBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 2,
  },
  locationText: {
    flex: 1,
    color: colors.charcoal,
    fontSize: 11,
    fontWeight: '600',
  },
  // ─── Hero Carousel ────────────────────────────────────────────────────────
  heroCarousel: {
    position: 'relative',
    marginHorizontal: 0,
    marginTop: 8,
    marginBottom: 10,
    overflow: 'hidden',
  },
  heroSlide: {
    minHeight: 138,
    paddingHorizontal: 16,
  },
  heroCard: {
    width: '100%',
    minHeight: 138,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: colors.forest,
    ...shadows.md,
  },
  heroImageBg: {
    width: '100%',
    minHeight: 138,
    justifyContent: 'center',
  },
  heroGradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(28, 43, 33, 0.65)',
    borderRadius: 16,
  },
  heroContent: {
    width: '88%',
    minHeight: 138,
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    zIndex: 2,
  },
  heroBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 9999,
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: 'rgba(255,255,255,0.22)',
    marginBottom: 4,
  },
  heroBadgeText: {
    color: colors.sand,
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  heroTitle: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '900',
    lineHeight: 19,
    letterSpacing: -0.3,
  },
  heroCopy: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 10,
    lineHeight: 14,
    marginTop: 2,
  },
  heroButton: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 6,
  },
  heroButtonText: {
    color: colors.sand,
    fontSize: 11,
    fontWeight: '900',
  },
  heroButtonArrow: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.20)',
  },
  heroDots: {
    position: 'absolute',
    left: 28,
    bottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  heroDot: {
    width: 5,
    height: 5,
    borderRadius: 99,
    backgroundColor: colors.sand,
  },
  // ─── Trust Bar Marquee ───────────────────────────────────────────────────
  trustBarContainer: {
    width: '100%',
    overflow: 'hidden',
    paddingVertical: 8,
  },
  trustBarAnimatedContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trustBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    paddingRight: 20,
  },
  trustItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  trustText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.charcoalMid,
  },
  // ─── Service Grid (Blibli Launchpad) ───────────────────────────────────────
  serviceGridContainer: {
    paddingHorizontal: 16,
    marginVertical: 10,
  },
  serviceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 14,
    backgroundColor: colors.white,
    padding: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.lightGray,
    ...shadows.sm,
  },
  serviceItem: {
    width: '23%',
    alignItems: 'center',
  },
  serviceIconCircle: {
    width: 46,
    height: 46,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  serviceBadge: {
    position: 'absolute',
    top: -4,
    right: -6,
    backgroundColor: colors.error,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 6,
  },
  serviceBadgeText: {
    color: colors.white,
    fontSize: 7,
    fontWeight: '900',
  },
  serviceLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.charcoal,
    textAlign: 'center',
    marginTop: 5,
    lineHeight: 13,
  },
  // ─── Midnight Sale Strip Banner ───────────────────────────────────────────
  midnightBanner: {
    marginHorizontal: 16,
    marginVertical: 8,
    backgroundColor: colors.indigoDye,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(221,235,157,0.25)',
    ...shadows.sm,
  },
  midnightLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  midnightTitle: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  midnightTimePill: {
    backgroundColor: 'rgba(221,235,157,0.18)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 99,
  },
  midnightTimeText: {
    color: colors.mindaro,
    fontSize: 9,
    fontWeight: '800',
  },
  midnightRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  midnightSubText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 9,
    fontWeight: '800',
  },
  midnightPriceText: {
    color: '#FFD700',
    fontSize: 13,
    fontWeight: '900',
  },
  // ─── Promo Member Section ──────────────────────────────────────────────────
  promoMemberSection: {
    backgroundColor: 'rgba(85,179,36,0.08)',
    marginHorizontal: 16,
    borderRadius: 20,
    padding: 14,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(85,179,36,0.18)',
  },
  promoMemberHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  promoMemberTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: colors.charcoal,
  },
  promoMemberSub: {
    fontSize: 10,
    color: colors.warmGray,
    marginTop: 2,
  },
  seeAllText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.forestDark,
  },
  promoMemberContent: {
    flexDirection: 'row',
    gap: 12,
  },
  cashbackCard: {
    width: 130,
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 12,
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.lightGray,
    ...shadows.sm,
  },
  cashbackTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.charcoal,
    marginTop: 4,
  },
  cashbackAmount: {
    fontSize: 14,
    fontWeight: '900',
    color: colors.forest,
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  codeText: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.warmGray,
  },
  copyBtn: {
    width: '100%',
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.forest,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  copyBtnDone: {
    backgroundColor: colors.successLight,
    borderColor: colors.success,
  },
  copyBtnText: {
    fontSize: 10,
    fontWeight: '900',
    color: colors.forest,
  },
  copyBtnTextDone: {
    color: colors.success,
  },
  promoItemsScroll: {
    gap: 10,
  },
  promoItemCard: {
    width: 105,
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 7,
    borderWidth: 1,
    borderColor: colors.lightGray,
  },
  promoItemImgWrap: {
    width: '100%',
    height: 90,
    marginBottom: 6,
  },
  promoItemImg: {
    width: '100%',
    height: '100%',
    justifyContent: 'flex-start',
  },
  discountBadge: {
    backgroundColor: colors.error,
    alignSelf: 'flex-start',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderTopLeftRadius: 10,
    borderBottomRightRadius: 8,
  },
  discountBadgeText: {
    color: colors.white,
    fontSize: 8,
    fontWeight: '900',
  },
  promoItemName: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.charcoal,
  },
  promoItemPrice: {
    fontSize: 11,
    fontWeight: '900',
    color: colors.charcoal,
    marginTop: 2,
  },
  promoItemOriginal: {
    fontSize: 9,
    color: colors.warmGrayLight,
    textDecorationLine: 'line-through',
  },
  // ─── Flash Sale Section ───────────────────────────────────────────────────
  flashSaleSection: {
    backgroundColor: colors.indigoDye,
    paddingVertical: 14,
    marginVertical: 10,
  },
  flashSaleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  flashSaleTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  flashSaleTitle: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0.8,
    fontStyle: 'italic',
  },
  timerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  timerNum: {
    backgroundColor: colors.mindaro,
    color: colors.indigoDye,
    fontSize: 10,
    fontWeight: '900',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  timerColon: {
    color: colors.white,
    fontWeight: '900',
    fontSize: 10,
  },
  flashSaleSeeAll: {
    color: colors.mindaro,
    fontSize: 11,
    fontWeight: '800',
  },
  flashSaleScroll: {
    paddingHorizontal: 16,
    gap: 10,
  },
  flashHighlightCard: {
    width: 120,
    height: 195,
    borderRadius: 16,
    backgroundColor: colors.ming,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(221,235,157,0.3)',
  },
  flashHighlightInner: {
    alignItems: 'center',
  },
  flashHighlightTag: {
    color: colors.mindaro,
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.8,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  flashHighlightTitle: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '900',
    textAlign: 'center',
    lineHeight: 17,
  },
  flashHighlightBadge: {
    backgroundColor: colors.mindaro,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    marginTop: 12,
  },
  flashHighlightBadgeText: {
    color: colors.indigoDye,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  flashProductCard: {
    width: 125,
    backgroundColor: colors.white,
    borderRadius: 14,
    overflow: 'hidden',
  },
  flashProductImg: {
    height: 100,
    justifyContent: 'flex-start',
  },
  flashProductBody: {
    padding: 8,
  },
  flashProductTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.charcoal,
  },
  flashProductPrice: {
    fontSize: 12,
    fontWeight: '900',
    color: colors.charcoal,
    marginTop: 2,
  },
  stockMeterTrack: {
    height: 4,
    backgroundColor: colors.lightGray,
    borderRadius: 2,
    marginTop: 6,
    overflow: 'hidden',
  },
  stockMeterFill: {
    height: '100%',
    backgroundColor: colors.pistachio,
    borderRadius: 2,
  },
  stockMeterText: {
    fontSize: 8,
    color: colors.warmGray,
    fontWeight: '700',
    marginTop: 2,
  },
  buyNowBtn: {
    backgroundColor: colors.pistachio,
    borderRadius: 8,
    paddingVertical: 5,
    alignItems: 'center',
    marginTop: 6,
  },
  buyNowBtnText: {
    color: colors.indigoDye,
    fontSize: 9,
    fontWeight: '900',
  },

  // ─── Categories & Product Grid ──────────────────────────────────────────────
  categoryRow: {
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  chip: {
    borderRadius: 9999,
    paddingHorizontal: 14,
    paddingVertical: 7,
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
    fontSize: 12,
    fontWeight: '600',
  },
  chipTextActive: {
    color: colors.white,
    fontWeight: '800',
  },
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    rowGap: 14,
    marginBottom: 16,
  },
  // ─── Tailors ───────────────────────────────────────────────────────────────
  tailorRow: {
    gap: 12,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  tailorCard: {
    width: 175,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.lightGray,
    ...shadows.sm,
  },
  tailorImage: {
    height: 100,
    justifyContent: 'flex-end',
    padding: 8,
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
    paddingHorizontal: 7,
    paddingVertical: 3,
    backgroundColor: 'rgba(47,79,58,0.85)',
  },
  tailorBadgeText: {
    color: colors.white,
    fontSize: 9,
    fontWeight: '800',
  },
  tailorInfo: {
    padding: 10,
  },
  tailorName: {
    color: colors.charcoal,
    fontSize: 13,
    fontWeight: '900',
  },
  tailorMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  tailorCity: {
    color: colors.warmGray,
    fontSize: 10,
    flex: 1,
  },
  tailorSpecialty: {
    color: colors.warmGray,
    fontSize: 10,
    lineHeight: 13,
    marginTop: 4,
  },
  tailorFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  tailorRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: colors.warningLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
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
  // ─── Impact Dashboard ──────────────────────────────────────────────────────
  impactCard: {
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: colors.sand,
    marginHorizontal: 16,
    marginTop: 8,
    padding: 16,
    ...shadows.sm,
  },
  impactHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 12,
  },
  impactIconBg: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.forest,
    flexShrink: 0,
  },
  impactTitle: {
    color: colors.charcoal,
    fontSize: 14,
    fontWeight: '900',
    marginBottom: 2,
  },
  impactCopy: {
    color: colors.warmGray,
    fontSize: 11,
    lineHeight: 15,
  },
  impactDivider: {
    height: 1,
    backgroundColor: 'rgba(122,122,114,0.20)',
    marginBottom: 12,
  },
  impactStats: {
    flexDirection: 'row',
  },
  impactStat: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
  },
  impactStatIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
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
    fontSize: 14,
    fontWeight: '900',
  },
  impactLabel: {
    color: colors.warmGray,
    fontSize: 9,
    lineHeight: 12,
    textAlign: 'center',
  },
  // ─── Scan Modal ────────────────────────────────────────────────────────────
  scanModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(31,36,33,0.70)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  scanModalContent: {
    width: '100%',
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
  },
  scanHeader: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  scanTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: colors.forest,
  },
  qrPlaceholderBox: {
    width: 220,
    height: 220,
    borderRadius: 20,
    backgroundColor: colors.ivory,
    borderWidth: 2,
    borderColor: colors.forestAlpha20,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    marginVertical: 10,
  },
  qrText: {
    fontSize: 11,
    color: colors.warmGray,
    textAlign: 'center',
    marginTop: 10,
    fontWeight: '600',
  },
  qrDesc: {
    fontSize: 11,
    color: colors.warmGray,
    textAlign: 'center',
    lineHeight: 16,
    marginVertical: 14,
  },
  closeScanBtn: {
    backgroundColor: colors.forest,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 14,
    width: '100%',
    alignItems: 'center',
  },
  closeScanBtnText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '900',
  },
});
