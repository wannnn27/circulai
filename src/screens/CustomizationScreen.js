import React, { useMemo, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import AnimatedPressable from '../components/AnimatedPressable';
import FlowHeader from '../components/FlowHeader';
import { customizationColors, customizationFabrics, formatCurrency } from '../data/appData';
import { useAppState } from '../state/AppContext';
import { colors, shadows } from '../theme/colors';

const measurementFields = [
  ['chest', 'Lingkar dada'],
  ['waist', 'Lingkar pinggang'],
  ['hips', 'Lingkar pinggul'],
  ['length', 'Panjang pakaian'],
];

export default function CustomizationScreen({ product, initial = {}, onBack, onGoCart }) {
  const insets = useSafeAreaInsets();
  const { addToCart, styleProfile } = useAppState();
  const [selectedColor, setSelectedColor] = useState(customizationColors.find((item) => item.recommended));
  const [selectedFabric, setSelectedFabric] = useState(customizationFabrics[0]);
  const [sizeType, setSizeType] = useState(initial.size === 'Custom' ? 'custom' : 'standard');
  const [size, setSize] = useState(initial.size && initial.size !== 'Custom' ? initial.size : 'M');
  const [measurements, setMeasurements] = useState({ chest: '', waist: '', hips: '', length: '' });

  const total = useMemo(() => product.price + selectedFabric.extraCost, [product.price, selectedFabric]);

  const handleAdd = () => {
    if (!selectedColor || !selectedFabric) {
      Alert.alert('Lengkapi pilihan', 'Warna dan bahan harus dipilih.');
      return;
    }
    if (sizeType === 'custom' && Object.values(measurements).some((value) => !value.trim() || Number(value) <= 0)) {
      Alert.alert('Ukuran belum valid', 'Isi seluruh ukuran tubuh dengan angka lebih dari 0 agar tailor dapat membuat pola dengan presisi.');
      return;
    }
    addToCart(product, {
      color: selectedColor,
      fabric: selectedFabric,
      sizeType,
      size,
      measurements: sizeType === 'custom' ? measurements : null,
      notes: initial.notes ?? ''
    });
    onGoCart();
  };

  return (
    <View style={styles.screen}>
      <FlowHeader title="Kustomisasi Pesanan" subtitle="Warna, ukuran, dan bahan" onBack={onBack} />
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: Math.max(insets.bottom, 16) + 24 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.productCard}>
          <Image source={{ uri: product.image }} style={styles.image} />
          <View style={styles.productInfo}>
            <Text style={styles.productName}>{product.name}</Text>
            <Text style={styles.productTailor}>Dikerjakan oleh {product.tailor}</Text>
            <Text style={styles.productPrice}>{formatCurrency(total)}</Text>
          </View>
        </View>

        <StepTitle number="1" title="Pilih Warna Kain" subtitle={styleProfile ? 'Warna bertanda cocok direkomendasikan AI Stylist.' : 'Pilih warna yang paling sesuai gayamu.'} />
        <View style={styles.colorGrid}>
          {customizationColors.map((item) => {
            const selected = selectedColor?.id === item.id;
            return (
              <AnimatedPressable key={item.id} style={[styles.colorCard, selected && styles.selectedCard]} onPress={() => setSelectedColor(item)}>
                <View style={[styles.swatch, { backgroundColor: item.hex }]}>
                  {selected && <Feather name="check" size={16} color={colors.white} />}
                </View>
                <Text style={styles.optionLabel}>{item.label}</Text>
                {item.recommended && <Text style={styles.recommended}>COCOK UNTUKMU</Text>}
              </AnimatedPressable>
            );
          })}
        </View>

        <StepTitle number="2" title="Tentukan Ukuran" subtitle="Gunakan ukuran standar atau masukkan ukuran tubuh." />
        <View style={styles.toggle}>
          {['standard', 'custom'].map((item) => (
            <AnimatedPressable
              key={item}
              style={[styles.toggleButton, sizeType === item && styles.toggleButtonActive]}
              onPress={() => setSizeType(item)}
            >
              <Text style={[styles.toggleText, sizeType === item && styles.toggleTextActive]} numberOfLines={1}>
                {item === 'standard' ? 'Ukuran Standar' : 'Custom Measurements'}
              </Text>
            </AnimatedPressable>
          ))}
        </View>
        {sizeType === 'standard' ? (
          <View style={styles.sizeRow}>
            {['XS', 'S', 'M', 'L'].map((item) => (
              <AnimatedPressable key={item} style={[styles.size, size === item && styles.sizeActive]} onPress={() => setSize(item)}>
                <Text style={[styles.sizeText, size === item && styles.sizeTextActive]}>{item}</Text>
              </AnimatedPressable>
            ))}
          </View>
        ) : (
          <View style={styles.measureCard}>
            {measurementFields.map(([key, label]) => (
              <View key={key} style={styles.measureRow}>
                <Text style={styles.measureLabel}>{label}</Text>
                <TextInput
                  value={measurements[key]}
                  onChangeText={(value) => setMeasurements((current) => ({ ...current, [key]: value }))}
                  placeholder="cm"
                  placeholderTextColor={colors.warmGrayLight}
                  keyboardType="decimal-pad"
                  style={styles.measureInput}
                />
              </View>
            ))}
          </View>
        )}

        <StepTitle number="3" title="Pilih Bahan" subtitle="Harga menyesuaikan jenis kain sirkular yang dipilih." />
        <View style={styles.fabricList}>
          {customizationFabrics.map((item) => {
            const selected = selectedFabric.id === item.id;
            return (
              <AnimatedPressable key={item.id} style={[styles.fabricCard, selected && styles.selectedCard]} onPress={() => setSelectedFabric(item)}>
                <View style={[styles.radio, selected && styles.radioActive]}>{selected && <View style={styles.radioDot} />}</View>
                <View style={styles.fabricInfo}>
                  <Text style={styles.fabricName}>{item.label}</Text>
                  <Text style={styles.fabricDesc}>{item.desc}</Text>
                </View>
                <Text style={styles.fabricPrice}>{item.extraCost ? `+${formatCurrency(item.extraCost)}` : 'Termasuk'}</Text>
              </AnimatedPressable>
            );
          })}
        </View>

        <View style={styles.summary}>
          <View>
            <Text style={styles.summaryLabel}>Estimasi total</Text>
            <Text style={styles.summaryPrice}>{formatCurrency(total)}</Text>
          </View>
          <View style={styles.estimate}>
            <MaterialCommunityIcons name="clock-outline" size={14} color={colors.forest} />
            <Text style={styles.estimateText}>{product.eta} produksi</Text>
          </View>
        </View>
        <AnimatedPressable style={styles.cta} onPress={handleAdd}>
          <Feather name="shopping-bag" size={17} color={colors.white} />
          <Text style={styles.ctaText}>Tambah ke Keranjang</Text>
        </AnimatedPressable>
      </ScrollView>
    </View>
  );
}

function StepTitle({ number, title, subtitle }) {
  return (
    <View style={styles.stepTitle}>
      <View style={styles.stepNumber}><Text style={styles.stepNumberText}>{number}</Text></View>
      <View style={styles.stepCopy}>
        <Text style={styles.stepName}>{title}</Text>
        <Text style={styles.stepSubtitle}>{subtitle}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.ivory },
  content: { padding: 20, paddingBottom: 40 },
  productCard: { flexDirection: 'row', gap: 13, padding: 13, borderRadius: 20, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.lightGray, ...shadows.sm },
  image: { width: 78, height: 92, borderRadius: 15, backgroundColor: colors.sand },
  productInfo: { flex: 1, justifyContent: 'center' },
  productName: { color: colors.charcoal, fontSize: 16, fontWeight: '900' },
  productTailor: { color: colors.warmGray, fontSize: 10, marginTop: 3 },
  productPrice: { color: colors.forest, fontSize: 16, fontWeight: '900', marginTop: 8 },
  stepTitle: { flexDirection: 'row', gap: 10, marginTop: 24, marginBottom: 12 },
  stepNumber: { width: 28, height: 28, borderRadius: 9, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.forest },
  stepNumberText: { color: colors.white, fontSize: 12, fontWeight: '900' },
  stepCopy: { flex: 1 },
  stepName: { color: colors.charcoal, fontSize: 15, fontWeight: '900' },
  stepSubtitle: { color: colors.warmGray, fontSize: 10, lineHeight: 14, marginTop: 2 },
  colorGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 10 },
  colorCard: { width: '48%', minHeight: 112, alignItems: 'center', justifyContent: 'center', borderRadius: 17, padding: 12, backgroundColor: colors.white, borderWidth: 1.5, borderColor: colors.lightGray },
  selectedCard: { borderColor: colors.forest, backgroundColor: colors.successLight },
  swatch: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  optionLabel: { color: colors.charcoal, fontSize: 11, lineHeight: 15, fontWeight: '800', textAlign: 'center', marginTop: 8 },
  recommended: { color: colors.forest, fontSize: 8, lineHeight: 11, fontWeight: '900', marginTop: 4 },
  toggle: { flexDirection: 'row', gap: 7, padding: 4, borderRadius: 15, backgroundColor: colors.lightGray },
  toggleButton: { flex: 1, minHeight: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 12 },
  toggleButtonActive: { backgroundColor: colors.white },
  toggleText: { color: colors.warmGray, fontSize: 10, lineHeight: 14, fontWeight: '700', textAlign: 'center', paddingHorizontal: 6 },
  toggleTextActive: { color: colors.forest, fontWeight: '900' },
  sizeRow: { flexDirection: 'row', gap: 8, marginTop: 10 },
  size: { flex: 1, height: 46, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.white, borderWidth: 1, borderColor: colors.lightGray },
  sizeActive: { backgroundColor: colors.forest, borderColor: colors.forest },
  sizeText: { color: colors.charcoal, fontWeight: '800' },
  sizeTextActive: { color: colors.white },
  measureCard: { marginTop: 10, borderRadius: 17, padding: 12, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.lightGray },
  measureRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 46, borderBottomWidth: 1, borderBottomColor: colors.lightGray },
  measureLabel: { color: colors.charcoal, fontSize: 11, fontWeight: '700' },
  measureInput: { width: 90, height: 34, borderRadius: 10, paddingHorizontal: 10, color: colors.charcoal, textAlign: 'right', backgroundColor: colors.ivory },
  fabricList: { gap: 8 },
  fabricCard: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 13, borderRadius: 16, backgroundColor: colors.white, borderWidth: 1.5, borderColor: colors.lightGray },
  radio: { width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: colors.lightGrayDark },
  radioActive: { borderColor: colors.forest },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.forest },
  fabricInfo: { flex: 1, minWidth: 0 },
  fabricName: { color: colors.charcoal, fontSize: 12, fontWeight: '900' },
  fabricDesc: { color: colors.warmGray, fontSize: 9, marginTop: 2 },
  fabricPrice: { color: colors.forest, fontSize: 10, fontWeight: '900' },
  summary: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 24, padding: 16, borderRadius: 18, backgroundColor: colors.sand },
  summaryLabel: { color: colors.warmGray, fontSize: 10 },
  summaryPrice: { color: colors.forest, fontSize: 21, fontWeight: '900', marginTop: 2 },
  estimate: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  estimateText: { color: colors.forest, fontSize: 10, fontWeight: '800' },
  cta: { minHeight: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9, borderRadius: 18, paddingHorizontal: 20, paddingVertical: 14, backgroundColor: colors.forest, marginTop: 14, ...shadows.forest },
  ctaText: { color: colors.white, fontSize: 14, lineHeight: 19, fontWeight: '900', textAlign: 'center' },
});
