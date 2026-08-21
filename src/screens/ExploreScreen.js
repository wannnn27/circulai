/**
 * @file ExploreScreen.js
 * @description Product catalogue screen with search, sort, and category filter.
 *
 * Search is debounced (250ms) so the expensive filter + sort computation only
 * runs after the user pauses typing, not on every keystroke.
 */

import React, { useMemo, useRef, useState } from 'react';
import { Animated, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

import ProductCard from '../components/ProductCard';
import { useDebounce } from '../hooks/useDebounce';
import { useAppState } from '../state/AppContext';
import { layout } from '../styles/layout';
import { colors, shadows } from '../theme/colors';

export default function ExploreScreen({ onProductPress, onNavigate, onBack, wishlistOnly = false }) {
  const [category, setCategory] = useState('Semua');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('Terbaru');
  const [filterOpen, setFilterOpen] = useState(false);
  const { categories, products, sortOptions, wishlist, cart, toggleWishlist, requireAuth } = useAppState();

  // Debounce the raw search query so the filter memo only re-runs
  // after 250ms of user idle time (not on every single keystroke).
  const debouncedQuery = useDebounce(query, 250);

  // Filter panel slide animation
  const filterHeight = useRef(new Animated.Value(0)).current;
  const filterOpacity = useRef(new Animated.Value(0)).current;

  const toggleFilter = () => {
    const opening = !filterOpen;
    setFilterOpen(opening);
    Animated.parallel([
      Animated.spring(filterHeight, {
        toValue: opening ? 120 : 0,
        useNativeDriver: false,
        speed: 16,
        bounciness: 2,
      }),
      Animated.timing(filterOpacity, {
        toValue: opening ? 1 : 0,
        duration: 180,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const filteredProducts = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase();
    return products
      .filter((p) => {
        const catMatch = category === 'Semua' || p.category === category;
        const searchMatch = !q || p.name.toLowerCase().includes(q) || p.tailor.toLowerCase().includes(q);
        const wishlistMatch = !wishlistOnly || wishlist.includes(p.id);
        return catMatch && searchMatch && wishlistMatch;
      })
      .sort((a, b) => {
        if (sort === 'Harga Terendah') return a.price - b.price;
        if (sort === 'Harga Tertinggi') return b.price - a.price;
        if (sort === 'Rating') return b.rating - a.rating;
        return a.id - b.id;
      });
  }, [category, products, debouncedQuery, sort, wishlist, wishlistOnly]);

  return (
    <ScrollView
      style={layout.scroll}
      contentContainerStyle={layout.scrollContent}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {/* ─── Header ─────────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          {wishlistOnly && (
            <Pressable style={styles.headerBack} onPress={onBack}>
              <Feather name="chevron-left" size={18} color={colors.forest} />
            </Pressable>
          )}
          <View>
            <Text style={styles.kicker}>{wishlistOnly ? 'Koleksi tersimpan' : 'Temukan'}</Text>
            <Text style={styles.title}>{wishlistOnly ? 'Wishlist Saya' : 'Circular Market'}</Text>
          </View>
        </View>
        <Pressable style={styles.headerCart} onPress={() => onNavigate('cart')}>
          <Feather name="shopping-bag" size={17} color={colors.forest} />
          <Text style={styles.headerBadgeText}>{cart.length}</Text>
        </Pressable>
      </View>

      {/* ─── Search + Filter row ────────────────────────────────────────── */}
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Feather name="search" size={16} color={colors.warmGray} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Cari produk atau penjahit..."
            placeholderTextColor={colors.warmGrayLight}
            style={styles.searchInput}
          />
          {!!query && (
            <Pressable onPress={() => setQuery('')} hitSlop={8}>
              <View style={styles.clearButton}>
                <Feather name="x" size={12} color={colors.warmGray} />
              </View>
            </Pressable>
          )}
        </View>
        <Pressable
          style={[styles.filterButton, filterOpen && styles.filterButtonActive]}
          onPress={toggleFilter}
        >
          <Feather name="sliders" size={16} color={filterOpen ? colors.white : colors.forest} />
        </Pressable>
      </View>

      {/* ─── Animated filter panel ──────────────────────────────────────── */}
      <Animated.View
        style={[
          styles.filterPanel,
          {
            maxHeight: filterHeight,
            opacity: filterOpacity,
            marginBottom: filterOpen ? 14 : 0,
          },
        ]}
      >
        <Text style={styles.filterTitle}>Urutkan berdasarkan</Text>
        <View style={styles.sortRow}>
          {sortOptions.map((item) => (
            <Pressable
              key={item}
              style={[styles.sortChip, sort === item && styles.sortChipActive]}
              onPress={() => setSort(item)}
            >
              <Text style={[styles.sortText, sort === item && styles.sortTextActive]}>
                {item}
              </Text>
            </Pressable>
          ))}
        </View>
      </Animated.View>

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

      {/* ─── Result count ───────────────────────────────────────────────── */}
      <View style={styles.resultRow}>
        <View style={styles.resultBadge}>
          <Text style={styles.resultText}>{filteredProducts.length} produk</Text>
        </View>
        {debouncedQuery !== '' && (
          <Text style={styles.resultQuery}>untuk "{debouncedQuery}"</Text>
        )}
      </View>

      {/* ─── Product grid or empty state ────────────────────────────────── */}
      {filteredProducts.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIconBg}>
            <MaterialCommunityIcons name="tshirt-crew-outline" size={36} color={colors.forest} />
          </View>
          <Text style={styles.emptyTitle}>{wishlistOnly ? 'Wishlist masih kosong' : 'Produk tidak ditemukan'}</Text>
          <Text style={styles.emptyDesc}>
            {wishlistOnly ? 'Simpan produk favoritmu agar muncul di sini' : 'Coba kata kunci atau kategori lain'}
          </Text>
          <Pressable
            style={styles.emptyReset}
            onPress={() => {
              if (wishlistOnly) {
                onNavigate('explore');
                return;
              }
              setQuery('');
              setCategory('Semua');
            }}
          >
            <Text style={styles.emptyResetText}>{wishlistOnly ? 'Jelajahi Produk' : 'Reset Filter'}</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.grid}>
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              grid
              favorite={wishlist.includes(product.id)}
              onToggleFavorite={() => requireAuth(() => toggleWishlist(product.id), 'Masuk ke akun untuk menyimpan produk ke Wishlist.')}
              onPress={() => onProductPress(product)}
            />
          ))}
        </View>
      )}
    </ScrollView>
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
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerBack: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.lightGray,
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
  headerCart: {
    minWidth: 46,
    height: 40,
    paddingHorizontal: 11,
    flexDirection: 'row',
    gap: 5,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 13,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.lightGray,
  },
  headerBadgeText: {
    color: colors.forest,
    fontSize: 11,
    fontWeight: '800',
  },
  // ─── Search ───────────────────────────────────────────────────────────────
  searchRow: {
    flexDirection: 'row',
    gap: 9,
    marginBottom: 14,
  },
  searchBox: {
    flex: 1,
    minHeight: 50,
    borderRadius: 16,
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.lightGray,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    gap: 9,
    ...shadows.sm,
  },
  searchInput: {
    flex: 1,
    color: colors.charcoal,
    fontSize: 14,
    paddingVertical: 0,
    fontWeight: '500',
  },
  clearButton: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.lightGray,
  },
  filterButton: {
    width: 50,
    height: 50,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.lightGray,
    ...shadows.sm,
  },
  filterButtonActive: {
    backgroundColor: colors.forest,
    borderColor: colors.forest,
  },
  // ─── Filter panel ─────────────────────────────────────────────────────────
  filterPanel: {
    overflow: 'hidden',
    borderRadius: 18,
    backgroundColor: colors.sandLight,
    borderWidth: 1,
    borderColor: colors.lightGray,
    paddingHorizontal: 14,
  },
  filterTitle: {
    color: colors.charcoal,
    fontSize: 11,
    fontWeight: '800',
    marginTop: 10,
    marginBottom: 8,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  sortRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
    paddingBottom: 12,
  },
  sortChip: {
    borderRadius: 9999,
    paddingHorizontal: 12,
    paddingVertical: 7,
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.lightGray,
  },
  sortChipActive: {
    backgroundColor: colors.forest,
    borderColor: colors.forest,
  },
  sortText: {
    color: colors.charcoal,
    fontSize: 12,
    fontWeight: '700',
  },
  sortTextActive: {
    color: colors.white,
  },
  // ─── Categories ───────────────────────────────────────────────────────────
  categoryRow: {
    gap: 8,
    paddingBottom: 14,
  },
  chip: {
    borderRadius: 9999,
    paddingHorizontal: 15,
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
  // ─── Result ───────────────────────────────────────────────────────────────
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  resultBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
    backgroundColor: colors.successLight,
  },
  resultText: {
    color: colors.success,
    fontSize: 11,
    fontWeight: '800',
  },
  resultQuery: {
    color: colors.warmGray,
    fontSize: 12,
    fontStyle: 'italic',
  },
  // ─── Grid ─────────────────────────────────────────────────────────────────
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 16,
  },
  // ─── Empty state ──────────────────────────────────────────────────────────
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyIconBg: {
    width: 80,
    height: 80,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.sand,
    marginBottom: 18,
  },
  emptyTitle: {
    color: colors.charcoal,
    fontSize: 17,
    fontWeight: '900',
    marginBottom: 6,
  },
  emptyDesc: {
    color: colors.warmGray,
    fontSize: 13,
    marginBottom: 20,
  },
  emptyReset: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 15,
    backgroundColor: colors.forest,
  },
  emptyResetText: {
    color: colors.white,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '800',
    textAlign: 'center',
  },
});
