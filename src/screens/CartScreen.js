import React from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import AnimatedPressable from '../components/AnimatedPressable';
import FlowHeader from '../components/FlowHeader';
import { formatCurrency } from '../data/appData';
import { useAppState } from '../state/AppContext';
import { colors, shadows } from '../theme/colors';

export default function CartScreen({ onBack, onContinue, onExplore }) {
  const insets = useSafeAreaInsets();
  const { cart, cartSummary, removeFromCart, updateCartQuantity, requireAuth } = useAppState();
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleContinue = () => {
    requireAuth(onContinue, 'Silakan masuk ke akun CIRCULAI untuk memilih alamat & membuat pesanan.');
  };

  return (
    <View style={styles.screen}>
      <FlowHeader title="Keranjang" subtitle={`${itemCount} item made-to-order`} onBack={onBack} />
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: Math.max(insets.bottom, 16) + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        {cart.length === 0 ? (
          <View style={styles.empty}>
            <View style={styles.emptyIcon}><Feather name="shopping-bag" size={30} color={colors.forest} /></View>
            <Text style={styles.emptyTitle}>Keranjang masih kosong</Text>
            <Text style={styles.emptyText}>Pilih produk dan kustomisasi detailnya terlebih dahulu.</Text>
            <AnimatedPressable style={styles.primary} onPress={onExplore}><Text style={styles.primaryText}>Lihat Katalog</Text></AnimatedPressable>
          </View>
        ) : (
          <>
            {cart.map((item) => (
              <CartItem
                key={item.cartItemId}
                item={item}
                onDecrease={() => updateCartQuantity(item.cartItemId, -1)}
                onIncrease={() => updateCartQuantity(item.cartItemId, 1)}
                onRemove={() => removeFromCart(item.cartItemId)}
              />
            ))}
            <View style={styles.summary}>
              <Text style={styles.summaryTitle}>Ringkasan Harga</Text>
              <SummaryRow label="Subtotal" value={formatCurrency(cartSummary.subtotal)} />
              <SummaryRow label="Estimasi ongkir" value={formatCurrency(cartSummary.shipping)} />
              <SummaryRow label="Diskon sirkular" value={`-${formatCurrency(cartSummary.discount)}`} accent />
              <View style={styles.divider} />
              <SummaryRow label="Total" value={formatCurrency(cartSummary.total)} strong />
            </View>
            <AnimatedPressable style={styles.primary} onPress={handleContinue}>
              <Text style={styles.primaryText}>Pilih Alamat Pengiriman</Text>
              <Feather name="arrow-right" size={17} color={colors.white} />
            </AnimatedPressable>
          </>
        )}
      </ScrollView>
    </View>
  );
}

function CartItem({ item, onDecrease, onIncrease, onRemove }) {
  const custom = item.customization ?? {};
  return (
    <View style={styles.card}>
      <Image source={{ uri: item.product.image }} style={styles.image} />
      <View style={styles.info}>
        <View style={styles.nameRow}>
          <Text style={styles.name} numberOfLines={2}>{item.product.name}</Text>
          <AnimatedPressable style={styles.remove} onPress={onRemove}><Feather name="trash-2" size={14} color={colors.error} /></AnimatedPressable>
        </View>
        <Text style={styles.tailor}>oleh {item.product.tailor}</Text>
        <View style={styles.chips}>
          <Text style={styles.chip}>{custom.color?.label ?? 'Warna asli'}</Text>
          <Text style={styles.chip}>{custom.sizeType === 'custom' ? 'Custom size' : custom.size}</Text>
          <Text style={styles.chip}>{custom.fabric?.label ?? item.product.material}</Text>
        </View>
        <View style={styles.priceRow}>
          <Text style={styles.price}>{formatCurrency(item.unitPrice * item.quantity)}</Text>
          <View style={styles.quantity}>
            <AnimatedPressable style={styles.quantityButton} onPress={onDecrease}><Feather name="minus" size={12} color={colors.forest} /></AnimatedPressable>
            <Text style={styles.quantityText}>{item.quantity}</Text>
            <AnimatedPressable style={styles.quantityButton} onPress={onIncrease}><Feather name="plus" size={12} color={colors.forest} /></AnimatedPressable>
          </View>
        </View>
      </View>
    </View>
  );
}

function SummaryRow({ label, value, accent, strong }) {
  return <View style={styles.row}><Text style={[styles.rowLabel, strong && styles.strong]}>{label}</Text><Text style={[styles.rowValue, accent && styles.accent, strong && styles.strongValue]}>{value}</Text></View>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.ivory },
  content: { padding: 20, paddingBottom: 40 },
  card: { flexDirection: 'row', gap: 12, padding: 13, borderRadius: 20, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.lightGray, marginBottom: 12, ...shadows.sm },
  image: { width: 82, height: 106, borderRadius: 15, backgroundColor: colors.sand },
  info: { flex: 1 },
  nameRow: { flexDirection: 'row', gap: 8 },
  name: { flex: 1, color: colors.charcoal, fontSize: 14, fontWeight: '900' },
  remove: { width: 30, height: 30, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.errorLight },
  tailor: { color: colors.warmGray, fontSize: 9, marginTop: 2 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 7 },
  chip: { color: colors.forest, fontSize: 7, fontWeight: '800', borderRadius: 999, paddingHorizontal: 6, paddingVertical: 4, backgroundColor: colors.successLight },
  price: { color: colors.forest, fontSize: 13, fontWeight: '900', marginTop: 8 },
  priceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  quantity: { flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 7 },
  quantityButton: { width: 26, height: 26, borderRadius: 9, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.successLight },
  quantityText: { minWidth: 14, color: colors.charcoal, fontSize: 11, fontWeight: '900', textAlign: 'center' },
  summary: { padding: 16, borderRadius: 20, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.lightGray, marginTop: 8 },
  summaryTitle: { color: colors.charcoal, fontSize: 14, fontWeight: '900', marginBottom: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  rowLabel: { color: colors.warmGray, fontSize: 11 },
  rowValue: { color: colors.charcoal, fontSize: 11, fontWeight: '800' },
  accent: { color: colors.success },
  divider: { height: 1, backgroundColor: colors.lightGray, marginBottom: 12 },
  strong: { color: colors.charcoal, fontWeight: '900' },
  strongValue: { color: colors.forest, fontSize: 17, fontWeight: '900' },
  primary: { width: '100%', minHeight: 56, flexDirection: 'row', gap: 9, alignItems: 'center', justifyContent: 'center', borderRadius: 18, paddingHorizontal: 20, paddingVertical: 14, backgroundColor: colors.forest, marginTop: 14, ...shadows.forest },
  primaryText: { color: colors.white, fontSize: 13, lineHeight: 18, fontWeight: '900', textAlign: 'center' },
  empty: { alignItems: 'center', paddingVertical: 80 },
  emptyIcon: { width: 76, height: 76, borderRadius: 24, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.sand },
  emptyTitle: { color: colors.charcoal, fontSize: 18, fontWeight: '900', marginTop: 18 },
  emptyText: { maxWidth: 250, color: colors.warmGray, fontSize: 12, lineHeight: 18, textAlign: 'center', marginTop: 6 },
});
