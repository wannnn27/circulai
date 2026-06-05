import React from 'react';
import { ImageBackground, Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

import { cardShadow, colors } from '../theme/colors';
import { formatCurrency } from '../data/appData';

export default function ProductCard({
  product,
  compact = false,
  grid = false,
  favorite = false,
  onPress,
  onToggleFavorite
}) {
  return (
    <Pressable style={[styles.card, grid && styles.gridCard, compact && styles.compact]} onPress={onPress}>
      <ImageBackground source={{ uri: product.image }} style={[styles.image, grid && styles.gridImage]} imageStyle={styles.imageRadius}>
        <View style={styles.imageShade} />
        <Pressable style={styles.favoriteButton} onPress={onToggleFavorite} hitSlop={8}>
          <Feather
            name="heart"
            size={16}
            color={favorite ? colors.terracotta : colors.warmGray}
            style={favorite && styles.favoriteFill}
          />
        </Pressable>
        <View style={styles.savedBadge}>
          <MaterialCommunityIcons name="leaf" size={12} color={colors.forest} />
          <Text style={styles.savedText}>{product.savedFabric} hemat</Text>
        </View>
      </ImageBackground>

      <View style={styles.info}>
        <View style={styles.badges}>
          {product.badges.slice(0, grid ? 1 : 2).map((badge) => (
            <View key={badge} style={styles.badge}>
              <Text style={styles.badgeText}>{badge}</Text>
            </View>
          ))}
        </View>
        <Text style={styles.title} numberOfLines={grid ? 2 : 1}>{product.name}</Text>
        <Text style={styles.desc} numberOfLines={1}>by {product.tailor}</Text>
        <View style={styles.metaRow}>
          <Text style={styles.price}>{formatCurrency(product.price)}</Text>
          <Text style={styles.eta}>{product.eta}</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 22,
    backgroundColor: colors.white,
    marginBottom: 14,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: colors.lightGray,
    ...cardShadow
  },
  gridCard: {
    width: '48%'
  },
  compact: {
    shadowOpacity: 0.04,
    elevation: 2
  },
  image: {
    minHeight: 172,
    padding: 12,
    justifyContent: 'space-between'
  },
  gridImage: {
    minHeight: 172
  },
  imageRadius: {
    backgroundColor: colors.sand
  },
  imageShade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.08)'
  },
  favoriteButton: {
    alignSelf: 'flex-end',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.92)'
  },
  favoriteFill: {
    textShadowColor: colors.terracotta,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 1
  },
  savedBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 5,
    backgroundColor: 'rgba(255,255,255,0.9)'
  },
  savedText: {
    color: colors.forest,
    fontSize: 10,
    fontWeight: '800'
  },
  info: {
    padding: 13
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
    marginBottom: 8
  },
  badge: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: 'rgba(47,79,58,0.1)'
  },
  badgeText: {
    color: colors.forest,
    fontSize: 10,
    fontWeight: '800'
  },
  title: {
    color: colors.charcoal,
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 19
  },
  desc: {
    color: colors.warmGray,
    fontSize: 11,
    marginTop: 2
  },
  metaRow: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8
  },
  price: {
    color: colors.forest,
    fontSize: 14,
    fontWeight: '900'
  },
  eta: {
    color: colors.warmGray,
    fontSize: 10
  }
});
