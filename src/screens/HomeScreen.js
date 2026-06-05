import React, { useState } from 'react';
import { ImageBackground, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

import IconButton from '../components/IconButton';
import MetricCard from '../components/MetricCard';
import ProductCard from '../components/ProductCard';
import SectionHeader from '../components/SectionHeader';
import { categories, products, tailors } from '../data/appData';
import { useAppState } from '../state/AppContext';
import { layout } from '../styles/layout';
import { cardShadow, colors } from '../theme/colors';

export default function HomeScreen({ onNavigate, onProductPress }) {
  const [category, setCategory] = useState('Semua');
  const { wishlist, orders, styleProfile, toggleWishlist } = useAppState();
  const featuredProducts = category === 'Semua'
    ? products.slice(0, 4)
    : products.filter((product) => product.category === category).slice(0, 4);

  return (
    <ScrollView
      style={layout.scroll}
      contentContainerStyle={layout.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.welcome}>Selamat datang kembali</Text>
          <Text style={styles.title}>Hi, Adi</Text>
        </View>
        <IconButton name="bell" />
      </View>

      <Pressable style={styles.searchBox} onPress={() => onNavigate('explore')}>
        <Feather name="search" size={17} color={colors.warmGray} />
        <Text style={styles.searchText}>Cari outfit impianmu...</Text>
      </Pressable>

      <View style={styles.heroCard}>
        <View style={styles.heroOrbOne} />
        <View style={styles.heroOrbTwo} />
        <View style={styles.heroContent}>
          <View style={styles.heroBadge}>
            <MaterialCommunityIcons name="recycle" size={13} color={colors.sand} />
            <Text style={styles.heroBadgeText}>Circular Fashion</Text>
          </View>
          <Text style={styles.heroTitle}>Find Your{'\n'}Circular Style</Text>
          <Text style={styles.heroCopy}>Outfit cocok, kain sisa berkurang, UMKM lokal berkembang.</Text>
          <Pressable style={styles.heroButton} onPress={() => onNavigate('quiz')}>
            <Text style={styles.heroButtonText}>
              {styleProfile ? 'Lihat Profil AI' : 'Coba AI Stylist'}
            </Text>
            <Feather name="chevron-right" size={16} color={colors.forest} />
          </Pressable>
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryRow}>
        {categories.map((item) => (
          <Pressable
            key={item}
            style={[styles.categoryChip, category === item && styles.categoryChipActive]}
            onPress={() => setCategory(item)}
          >
            <Text style={[styles.categoryText, category === item && styles.categoryTextActive]}>{item}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <View style={styles.metricRow}>
        <MetricCard value={`${wishlist.length}`} label="Wishlist" />
        <MetricCard value={`${orders.length}`} label="Pesanan" />
        <MetricCard value="320" label="Impact points" />
      </View>

      <SectionHeader title="Made-to-Order Picks" action="Lihat Semua" onAction={() => onNavigate('explore')} />
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

      <SectionHeader title="Local Tailor Spotlight" action="Lihat Semua" />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tailorRow}>
        {tailors.map((tailor) => (
          <View key={tailor.id} style={styles.tailorCard}>
            <ImageBackground source={{ uri: tailor.image }} style={styles.tailorImage} imageStyle={styles.tailorImageRadius}>
              <View style={styles.tailorBadge}>
                <MaterialCommunityIcons name="leaf" size={11} color={colors.white} />
                <Text style={styles.tailorBadgeText}>Local Tailor</Text>
              </View>
            </ImageBackground>
            <View style={styles.tailorInfo}>
              <Text style={styles.tailorName}>{tailor.name}</Text>
              <View style={styles.tailorMeta}>
                <Feather name="map-pin" size={12} color={colors.warmGray} />
                <Text style={styles.tailorMetaText}>{tailor.city}</Text>
              </View>
              <Text style={styles.tailorSpecialty}>{tailor.specialty}</Text>
              <View style={styles.tailorFooter}>
                <View style={styles.tailorMeta}>
                  <Feather name="star" size={12} color={colors.warning} />
                  <Text style={styles.rating}>{tailor.rating}</Text>
                </View>
                <Text style={styles.tailorMetaText}>{tailor.sold} terjual</Text>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.impactCard}>
        <View style={styles.impactTitleRow}>
          <MaterialCommunityIcons name="recycle" size={20} color={colors.forest} />
          <Text style={styles.impactTitle}>Your Style, Less Waste</Text>
        </View>
        <Text style={styles.impactCopy}>
          Setiap pesanan membantu mengurangi kain sisa dan mendukung UMKM fashion lokal.
        </Text>
        <View style={styles.impactStats}>
          <ImpactStat icon="scissors-cutting" value="2.4 ton" label="Kain sisa dimanfaatkan" />
          <ImpactStat icon="account-group-outline" value="134" label="Penjahit lokal terlibat" />
          <ImpactStat icon="package-variant" value="1,280" label="Produk made-to-order" />
        </View>
      </View>
    </ScrollView>
  );
}

function ImpactStat({ icon, value, label }) {
  return (
    <View style={styles.impactStat}>
      <MaterialCommunityIcons name={icon} size={22} color={colors.forest} />
      <Text style={styles.impactValue}>{value}</Text>
      <Text style={styles.impactLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14
  },
  welcome: {
    color: colors.warmGray,
    fontSize: 13
  },
  title: {
    color: colors.charcoal,
    fontSize: 24,
    fontWeight: '900',
    marginTop: 2
  },
  searchBox: {
    minHeight: 48,
    borderRadius: 16,
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.lightGray,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    gap: 10,
    marginBottom: 18
  },
  searchText: {
    color: colors.warmGray,
    fontSize: 14
  },
  heroCard: {
    minHeight: 182,
    borderRadius: 28,
    overflow: 'hidden',
    backgroundColor: colors.forest,
    marginBottom: 18
  },
  heroOrbOne: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    right: -64,
    top: -64,
    backgroundColor: 'rgba(232,220,200,0.10)'
  },
  heroOrbTwo: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    left: 18,
    bottom: -42,
    backgroundColor: 'rgba(201,123,99,0.18)'
  },
  heroContent: {
    padding: 22
  },
  heroBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(232,220,200,0.2)',
    marginBottom: 12
  },
  heroBadgeText: {
    color: colors.sand,
    fontSize: 11,
    fontWeight: '800'
  },
  heroTitle: {
    color: colors.white,
    fontSize: 24,
    fontWeight: '900',
    lineHeight: 30
  },
  heroCopy: {
    color: 'rgba(255,255,255,0.76)',
    fontSize: 13,
    lineHeight: 18,
    marginTop: 8,
    maxWidth: 260
  },
  heroButton: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: colors.sand,
    marginTop: 16
  },
  heroButtonText: {
    color: colors.forest,
    fontSize: 13,
    fontWeight: '900'
  },
  categoryRow: {
    gap: 8,
    paddingBottom: 18
  },
  categoryChip: {
    borderRadius: 999,
    paddingHorizontal: 15,
    paddingVertical: 9,
    backgroundColor: colors.sand
  },
  categoryChipActive: {
    backgroundColor: colors.forest
  },
  categoryText: {
    color: colors.charcoal,
    fontSize: 13,
    fontWeight: '600'
  },
  categoryTextActive: {
    color: colors.white,
    fontWeight: '900'
  },
  metricRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 22
  },
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 10
  },
  tailorRow: {
    gap: 12,
    paddingBottom: 18
  },
  tailorCard: {
    width: 184,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: colors.white,
    ...cardShadow
  },
  tailorImage: {
    height: 104,
    justifyContent: 'flex-end',
    padding: 10
  },
  tailorImageRadius: {
    backgroundColor: colors.sand
  },
  tailorBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: 'rgba(47,79,58,0.88)'
  },
  tailorBadgeText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: '800'
  },
  tailorInfo: {
    padding: 12
  },
  tailorName: {
    color: colors.charcoal,
    fontSize: 14,
    fontWeight: '900'
  },
  tailorMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4
  },
  tailorMetaText: {
    color: colors.warmGray,
    fontSize: 11
  },
  tailorSpecialty: {
    color: colors.warmGray,
    fontSize: 11,
    lineHeight: 16,
    marginTop: 6
  },
  tailorFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8
  },
  rating: {
    color: colors.charcoal,
    fontSize: 12,
    fontWeight: '800'
  },
  impactCard: {
    borderRadius: 28,
    padding: 18,
    backgroundColor: colors.sand,
    marginTop: 4
  },
  impactTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8
  },
  impactTitle: {
    color: colors.charcoal,
    fontSize: 16,
    fontWeight: '900'
  },
  impactCopy: {
    color: colors.warmGray,
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 16
  },
  impactStats: {
    flexDirection: 'row',
    gap: 10
  },
  impactStat: {
    flex: 1,
    alignItems: 'center'
  },
  impactValue: {
    color: colors.forest,
    fontSize: 14,
    fontWeight: '900',
    marginTop: 8
  },
  impactLabel: {
    color: colors.warmGray,
    fontSize: 10,
    lineHeight: 14,
    textAlign: 'center',
    marginTop: 3
  }
});
