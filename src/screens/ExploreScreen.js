import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

import ProductCard from '../components/ProductCard';
import { categories, products, sortOptions } from '../data/appData';
import { useAppState } from '../state/AppContext';
import { layout } from '../styles/layout';
import { colors } from '../theme/colors';

export default function ExploreScreen({ onProductPress }) {
  const [category, setCategory] = useState('Semua');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('Terbaru');
  const [filterOpen, setFilterOpen] = useState(false);
  const { wishlist, toggleWishlist } = useAppState();

  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return products
      .filter((product) => {
        const categoryMatch = category === 'Semua' || product.category === category;
        const searchMatch =
          !normalizedQuery ||
          product.name.toLowerCase().includes(normalizedQuery) ||
          product.tailor.toLowerCase().includes(normalizedQuery);
        return categoryMatch && searchMatch;
      })
      .sort((first, second) => {
        if (sort === 'Harga Terendah') return first.price - second.price;
        if (sort === 'Harga Tertinggi') return second.price - first.price;
        if (sort === 'Rating') return second.rating - first.rating;
        return first.id - second.id;
      });
  }, [category, query, sort]);

  return (
    <ScrollView
      style={layout.scroll}
      contentContainerStyle={layout.scrollContent}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.header}>
        <Text style={styles.title}>Circular Market</Text>
        <View style={styles.searchRow}>
          <View style={styles.searchBox}>
            <Feather name="search" size={17} color={colors.warmGray} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Cari produk atau penjahit..."
              placeholderTextColor={colors.warmGray}
              style={styles.searchInput}
            />
            {!!query && (
              <Pressable onPress={() => setQuery('')} hitSlop={8}>
                <Feather name="x" size={17} color={colors.warmGray} />
              </Pressable>
            )}
          </View>
          <Pressable
            style={[styles.filterButton, filterOpen && styles.filterButtonActive]}
            onPress={() => setFilterOpen((current) => !current)}
          >
            <Feather name="sliders" size={17} color={filterOpen ? colors.white : colors.forest} />
          </Pressable>
        </View>
      </View>

      {filterOpen && (
        <View style={styles.filterPanel}>
          <Text style={styles.filterTitle}>Urutkan</Text>
          <View style={styles.sortRow}>
            {sortOptions.map((item) => (
              <Pressable
                key={item}
                style={[styles.sortChip, sort === item && styles.sortChipActive]}
                onPress={() => setSort(item)}
              >
                <Text style={[styles.sortText, sort === item && styles.sortTextActive]}>{item}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      )}

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

      <Text style={styles.resultText}>{filteredProducts.length} produk ditemukan</Text>

      {filteredProducts.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIcon}>
            <MaterialCommunityIcons name="tshirt-crew-outline" size={32} color={colors.forest} />
          </View>
          <Text style={styles.emptyTitle}>Produk tidak ditemukan</Text>
          <Text style={styles.emptyDesc}>Coba kata kunci atau kategori lain</Text>
        </View>
      ) : (
        <View style={styles.grid}>
          {filteredProducts.map((product) => (
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
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: 14
  },
  title: {
    color: colors.charcoal,
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 16
  },
  searchRow: {
    flexDirection: 'row',
    gap: 9
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
    gap: 9
  },
  searchInput: {
    flex: 1,
    color: colors.charcoal,
    fontSize: 14,
    paddingVertical: 0
  },
  filterButton: {
    width: 50,
    height: 50,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.lightGray
  },
  filterButtonActive: {
    backgroundColor: colors.forest,
    borderColor: colors.forest
  },
  filterPanel: {
    borderRadius: 20,
    padding: 14,
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.lightGray,
    marginBottom: 14
  },
  filterTitle: {
    color: colors.charcoal,
    fontSize: 13,
    fontWeight: '900',
    marginBottom: 10
  },
  sortRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  sortChip: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: colors.sand
  },
  sortChipActive: {
    backgroundColor: colors.forest
  },
  sortText: {
    color: colors.charcoal,
    fontSize: 12,
    fontWeight: '700'
  },
  sortTextActive: {
    color: colors.white
  },
  categoryRow: {
    gap: 8,
    paddingBottom: 16
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
  resultText: {
    color: colors.warmGray,
    fontSize: 13,
    marginBottom: 12
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.sand,
    marginBottom: 14
  },
  emptyTitle: {
    color: colors.charcoal,
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 6
  },
  emptyDesc: {
    color: colors.warmGray,
    fontSize: 13
  }
});
