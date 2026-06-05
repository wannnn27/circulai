import React, { useState } from 'react';
import { Alert, ImageBackground, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

import { formatCurrency } from '../data/appData';
import { useAppState } from '../state/AppContext';
import { layout } from '../styles/layout';
import { cardShadow, colors } from '../theme/colors';

const sizes = ['XS', 'S', 'M', 'L', 'Custom'];

export default function ProductDetailScreen({ product, onBack, onOrderCreated }) {
  const [size, setSize] = useState('M');
  const [notes, setNotes] = useState('');
  const { wishlist, toggleWishlist, addOrder } = useAppState();
  const favorite = wishlist.includes(product.id);

  const handleOrder = () => {
    addOrder({
      ...product,
      size,
      notes
    });
    onOrderCreated();
  };

  return (
    <ScrollView
      style={layout.scroll}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <ImageBackground source={{ uri: product.image }} style={styles.hero} imageStyle={styles.heroImage}>
        <View style={styles.heroShade} />
        <View style={styles.topBar}>
          <Pressable style={styles.iconButton} onPress={onBack}>
            <Feather name="chevron-left" size={22} color={colors.charcoal} />
          </Pressable>
          <Pressable style={styles.iconButton} onPress={() => toggleWishlist(product.id)}>
            <Feather name="heart" size={19} color={favorite ? colors.terracotta : colors.charcoal} />
          </Pressable>
        </View>
        <View style={styles.heroBadge}>
          <MaterialCommunityIcons name="leaf" size={13} color={colors.forest} />
          <Text style={styles.heroBadgeText}>{product.savedFabric} kain terselamatkan</Text>
        </View>
      </ImageBackground>

      <View style={styles.body}>
        <View style={styles.titleRow}>
          <View style={styles.titleArea}>
            <Text style={styles.name}>{product.name}</Text>
            <Text style={styles.tailor}>by {product.tailor} - {product.tailorCity}</Text>
          </View>
          <View style={styles.ratingPill}>
            <Feather name="star" size={13} color={colors.warning} />
            <Text style={styles.ratingText}>{product.rating}</Text>
          </View>
        </View>

        <View style={styles.badges}>
          {product.badges.map((badge) => (
            <View key={badge} style={styles.badge}>
              <Text style={styles.badgeText}>{badge}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.price}>{formatCurrency(product.price)}</Text>
        <Text style={styles.description}>{product.description}</Text>

        <View style={styles.infoCard}>
          <InfoRow icon="clock" label="Estimasi Produksi" value={product.eta} />
          <InfoRow icon="scissors-cutting" label="Material" value={product.material} family="material" />
          <InfoRow icon="map-pin" label="Penjahit" value={product.tailorCity} />
        </View>

        <Text style={styles.sectionTitle}>Pilih ukuran</Text>
        <View style={styles.sizeRow}>
          {sizes.map((item) => (
            <Pressable
              key={item}
              style={[styles.sizeChip, size === item && styles.sizeChipActive]}
              onPress={() => setSize(item)}
            >
              <Text style={[styles.sizeText, size === item && styles.sizeTextActive]}>{item}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Ukuran yang dibutuhkan</Text>
        <View style={styles.measureList}>
          {product.measurements.map((item) => (
            <View key={item} style={styles.measureItem}>
              <Feather name="check" size={14} color={colors.forest} />
              <Text style={styles.measureText}>{item}</Text>
            </View>
          ))}
        </View>

        <TextInput
          value={notes}
          onChangeText={setNotes}
          placeholder="Catatan ukuran, request panjang lengan, atau preferensi fit..."
          placeholderTextColor={colors.warmGray}
          multiline
          style={styles.notesInput}
        />

        <View style={styles.recommendCard}>
          <Text style={styles.recommendTitle}>Cocok untuk</Text>
          <View style={styles.recommendWrap}>
            {product.recommendations.map((item) => (
              <View key={item} style={styles.recommendChip}>
                <Text style={styles.recommendText}>{item}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.actions}>
          <Pressable
            style={styles.secondaryButton}
            onPress={() => Alert.alert('Chat Penjahit', `Membuka chat dengan ${product.tailor}.`)}
          >
            <Feather name="message-circle" size={18} color={colors.forest} />
          </Pressable>
          <Pressable style={styles.orderButton} onPress={handleOrder}>
            <Text style={styles.orderButtonText}>Pesan Made-to-Order</Text>
            <Feather name="arrow-right" size={18} color={colors.white} />
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}

function InfoRow({ icon, label, value, family = 'feather' }) {
  const Icon = family === 'material' ? MaterialCommunityIcons : Feather;
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoIcon}>
        <Icon name={icon} size={16} color={colors.forest} />
      </View>
      <View style={styles.infoTextArea}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 116
  },
  hero: {
    height: 340,
    justifyContent: 'space-between',
    padding: 20
  },
  heroImage: {
    backgroundColor: colors.sand
  },
  heroShade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(31,36,33,0.18)'
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.92)'
  },
  heroBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
    backgroundColor: 'rgba(255,255,255,0.92)'
  },
  heroBadgeText: {
    color: colors.forest,
    fontSize: 12,
    fontWeight: '900'
  },
  body: {
    marginTop: -24,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
    backgroundColor: colors.ivory
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 12
  },
  titleArea: {
    flex: 1
  },
  name: {
    color: colors.charcoal,
    fontSize: 24,
    fontWeight: '900',
    lineHeight: 30
  },
  tailor: {
    color: colors.warmGray,
    fontSize: 13,
    marginTop: 4
  },
  ratingPill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7,
    backgroundColor: colors.white
  },
  ratingText: {
    color: colors.charcoal,
    fontSize: 12,
    fontWeight: '900'
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
    marginBottom: 12
  },
  badge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: 'rgba(47,79,58,0.1)'
  },
  badgeText: {
    color: colors.forest,
    fontSize: 11,
    fontWeight: '900'
  },
  price: {
    color: colors.forest,
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 8
  },
  description: {
    color: colors.warmGray,
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 16
  },
  infoCard: {
    borderRadius: 20,
    padding: 14,
    backgroundColor: colors.white,
    marginBottom: 20,
    gap: 12,
    ...cardShadow
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  infoIcon: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.sand
  },
  infoTextArea: {
    flex: 1
  },
  infoLabel: {
    color: colors.warmGray,
    fontSize: 11
  },
  infoValue: {
    color: colors.charcoal,
    fontSize: 13,
    fontWeight: '800',
    marginTop: 1
  },
  sectionTitle: {
    color: colors.charcoal,
    fontSize: 15,
    fontWeight: '900',
    marginBottom: 10
  },
  sizeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 18
  },
  sizeChip: {
    flex: 1,
    minHeight: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.lightGray
  },
  sizeChipActive: {
    backgroundColor: colors.forest,
    borderColor: colors.forest
  },
  sizeText: {
    color: colors.charcoal,
    fontSize: 13,
    fontWeight: '800'
  },
  sizeTextActive: {
    color: colors.white
  },
  measureList: {
    gap: 8,
    marginBottom: 12
  },
  measureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  measureText: {
    color: colors.charcoal,
    fontSize: 13,
    fontWeight: '700'
  },
  notesInput: {
    minHeight: 92,
    borderRadius: 18,
    padding: 14,
    textAlignVertical: 'top',
    color: colors.charcoal,
    fontSize: 13,
    lineHeight: 19,
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.lightGray,
    marginBottom: 16
  },
  recommendCard: {
    borderRadius: 20,
    padding: 14,
    backgroundColor: colors.sand,
    marginBottom: 18
  },
  recommendTitle: {
    color: colors.charcoal,
    fontSize: 13,
    fontWeight: '900',
    marginBottom: 10
  },
  recommendWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  recommendChip: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: colors.white
  },
  recommendText: {
    color: colors.forest,
    fontSize: 11,
    fontWeight: '900'
  },
  actions: {
    flexDirection: 'row',
    gap: 10
  },
  secondaryButton: {
    width: 54,
    height: 54,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.sand
  },
  orderButton: {
    flex: 1,
    height: 54,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.forest
  },
  orderButtonText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '900'
  }
});
