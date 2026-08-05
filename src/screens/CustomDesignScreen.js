import React, { useEffect, useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import AnimatedPressable from '../components/AnimatedPressable';
import { useAppState } from '../state/AppContext';
import { layout } from '../styles/layout';
import { colors, shadows } from '../theme/colors';
import { formatCurrency } from '../data/appData';

const ARCHETYPES = [
  { id: 'kemeja', label: 'Kemeja / Shirt', price: 180000, icon: 'tshirt-crew-outline', image: 'https://images.unsplash.com/photo-1752770260282-6abbc0443762?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=900', tailor: 'Rahayu Tailor', city: 'Sleman, Yogyakarta' },
  { id: 'dress', label: 'Dress / Gaun', price: 260000, icon: 'star-face', image: 'https://images.unsplash.com/photo-1637248360598-6bc357ae6958?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=900', tailor: 'Kartika Studio', city: 'Bandung' },
  { id: 'outer', label: 'Outerwear / Jaket', price: 220000, icon: 'hanger', image: 'https://images.unsplash.com/photo-1647714028322-4bde00824b65?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=900', tailor: 'Jogja Atelier', city: 'Yogyakarta' },
  { id: 'blouse', label: 'Blouse Wanita', price: 170000, icon: 'clover', image: 'https://images.unsplash.com/photo-1640257846267-9db046ffe896?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=900', tailor: 'Sari Tailor', city: 'Solo' },
];

const FABRICS = [
  { id: 'rayon', label: 'Rayon Atelier Sisa', sub: 'Mulus, adem & flowy', saved: '0.8m', extra: 0 },
  { id: 'linen', label: 'Linen Deadstock', sub: 'Serat kuat, kasual premium', saved: '1.0m', extra: 35000 },
  { id: 'tenun', label: 'Tenun Rayon Scraps', sub: 'Motif etnik unik handwoven', saved: '1.2m', extra: 50000 },
];

const COLLARS = ['Shanghai Collar', 'V-Neck Design', 'Classic Pointed'];
const SLEEVES = ['Lengan Pendek', 'Lengan Panjang', 'Puff Sleeve Style'];
const MEASUREMENTS = [
  ['chest', 'Lingkar dada'],
  ['waist', 'Lingkar pinggang'],
  ['hips', 'Lingkar pinggul'],
  ['length', 'Panjang pakaian'],
];

export default function CustomDesignScreen({ onBack, onAddedToCart, registerBackHandler }) {
  const insets = useSafeAreaInsets();
  const { addToCart } = useAppState();
  const [step, setStep] = useState(1); // 1: Model, 2: Fabric, 3: Details, 4: Size

  // Design state
  const [model, setModel] = useState(ARCHETYPES[0]);
  const [fabric, setFabric] = useState(FABRICS[0]);
  const [collar, setCollar] = useState(COLLARS[0]);
  const [sleeve, setSleeve] = useState(SLEEVES[0]);
  const [size, setSize] = useState('M');
  const [measurements, setMeasurements] = useState({ chest: '', waist: '', hips: '', length: '' });

  const totalPrice = useMemo(() => {
    return model.price + fabric.extra;
  }, [model, fabric]);

  const handleOrder = () => {
    if (size === 'Custom' && Object.values(measurements).some((value) => !value.trim() || Number(value) <= 0)) {
      Alert.alert('Ukuran custom belum valid', 'Isi seluruh ukuran tubuh dengan angka lebih dari 0 agar desain dapat dibuat dengan presisi.');
      return;
    }

    const customProduct = {
      id: `custom-${model.id}`,
      name: `Bespoke Custom ${model.label.split(' / ')[0]}`,
      tailor: model.tailor,
      tailorCity: model.city,
      price: model.price,
      badges: ['Custom Design', 'Sirkular'],
      category: 'Custom',
      eta: '8-12 hari',
      rating: 5.0,
      savedFabric: fabric.saved,
      material: fabric.label,
      image: model.image,
      description: `Pakaian kustom buatan tangan dengan kerah ${collar}, ${sleeve}, ukuran ${size}, dijahit secara personal.`,
      orderType: 'custom',
      size,
      design: {
        model: model.label,
        fabric: fabric.label,
        collar,
        sleeve,
        size,
      },
    };

    Alert.alert(
      'Konfirmasi Desain Kustom',
      `${customProduct.name}\n${fabric.label}\n${collar} · ${sleeve}\nUkuran: ${size}\nTotal: ${formatCurrency(totalPrice)}`,
      [
        { text: 'Periksa Lagi', style: 'cancel' },
        {
          text: 'Tambah ke Keranjang',
          onPress: () => {
            addToCart(customProduct, {
              color: { id: 'custom', label: 'Sesuai desain', hex: '#2F4F3A' },
              fabric: { id: fabric.id, label: fabric.label, extraCost: fabric.extra },
              sizeType: size === 'Custom' ? 'custom' : 'standard',
              size,
              measurements: size === 'Custom' ? measurements : null
            });
            onAddedToCart();
          },
        },
      ]
    );
  };

  const next = () => {
    if (step < 4) setStep(step + 1);
    else handleOrder();
  };

  const back = () => {
    if (step > 1) {
      setStep(step - 1);
      return true;
    }
    return onBack();
  };

  useEffect(() => {
    return registerBackHandler?.(back);
  }, [step, onBack, registerBackHandler]);

  return (
    <View style={layout.flex}>
      {/* Header */}
      <View style={styles.header}>
        <AnimatedPressable style={styles.backButton} onPress={back} scaleDown={0.88}>
          <Feather name="chevron-left" size={20} color={colors.charcoal} />
        </AnimatedPressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Rancang Pakaian Kustom</Text>
          <Text style={styles.headerSubtitle}>Langkah {step} dari 4: {step === 1 ? 'Pilih Model' : step === 2 ? 'Pilih Kain' : step === 3 ? 'Detail Kerah & Lengan' : 'Pilih Ukuran'}</Text>
        </View>
      </View>

      {/* Progress Line */}
      <View style={styles.progressRow}>
        {[1, 2, 3, 4].map((i) => (
          <View key={i} style={[styles.progressBar, i <= step && styles.progressBarActive]} />
        ))}
      </View>

      <ScrollView style={layout.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Step 1: Model */}
        {step === 1 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Pilih Jenis Pakaian</Text>
            <Text style={styles.stepDesc}>Tentukan tipe dasar pakaian yang ingin Anda rancang.</Text>
            <View style={styles.modelList}>
              {ARCHETYPES.map((item) => {
                const isSelected = model.id === item.id;
                return (
                  <AnimatedPressable
                    key={item.id}
                    style={[styles.modelCard, isSelected && styles.modelCardActive]}
                    onPress={() => setModel(item)}
                    scaleDown={0.97}
                  >
                    <View style={[styles.iconWrapper, isSelected && styles.iconWrapperActive]}>
                      <MaterialCommunityIcons
                        name={item.icon}
                        size={26}
                        color={isSelected ? colors.white : colors.forest}
                      />
                    </View>
                    <View style={styles.modelCardInfo}>
                      <Text style={[styles.modelCardLabel, isSelected && styles.modelCardLabelActive]}>
                        {item.label}
                      </Text>
                      <Text style={[styles.modelCardPrice, isSelected && styles.modelCardPriceActive]}>
                        {formatCurrency(item.price)}
                      </Text>
                    </View>
                    {isSelected && (
                      <View style={styles.modelCheckDot}>
                        <Feather name="check" size={13} color={colors.white} />
                      </View>
                    )}
                  </AnimatedPressable>
                );
              })}
            </View>
          </View>
        )}

        {/* Step 2: Fabric */}
        {step === 2 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Pilih Kain Sisa Atelier</Text>
            <Text style={styles.stepDesc}>Setiap kain diselamatkan dari sisa produksi butik lokal.</Text>
            <View style={styles.fabricList}>
              {FABRICS.map((item) => {
                const isSelected = fabric.id === item.id;
                return (
                  <AnimatedPressable
                    key={item.id}
                    style={[styles.fabricCard, isSelected && styles.fabricCardActive]}
                    onPress={() => setFabric(item)}
                    scaleDown={0.97}
                  >
                    <View style={layout.flex}>
                      <Text style={styles.fabricLabel}>{item.label}</Text>
                      <Text style={styles.fabricSub}>{item.sub}</Text>
                      {item.extra > 0 && (
                        <Text style={styles.fabricExtra}>+ {formatCurrency(item.extra)}</Text>
                      )}
                    </View>
                    <View style={styles.fabricBadge}>
                      <MaterialCommunityIcons name="leaf" size={11} color={colors.forest} />
                      <Text style={styles.fabricBadgeText}>Hemat {item.saved}</Text>
                    </View>
                  </AnimatedPressable>
                );
              })}
            </View>
          </View>
        )}

        {/* Step 3: Details */}
        {step === 3 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Detail Kerah & Lengan</Text>
            <Text style={styles.stepDesc}>Kustomisasi pola potongan baju sesuai selera Anda.</Text>

            <Text style={styles.subTitle}>Jenis Kerah</Text>
            <View style={styles.detailRow}>
              {COLLARS.map((item) => {
                const isSelected = collar === item;
                return (
                  <AnimatedPressable
                    key={item}
                    style={[styles.detailChip, isSelected && styles.detailChipActive]}
                    onPress={() => setCollar(item)}
                    scaleDown={0.95}
                  >
                    <Text style={[styles.detailChipText, isSelected && styles.detailChipTextActive]}>
                      {item}
                    </Text>
                  </AnimatedPressable>
                );
              })}
            </View>

            <Text style={[styles.subTitle, { marginTop: 20 }]}>Bentuk Lengan</Text>
            <View style={styles.detailRow}>
              {SLEEVES.map((item) => {
                const isSelected = sleeve === item;
                return (
                  <AnimatedPressable
                    key={item}
                    style={[styles.detailChip, isSelected && styles.detailChipActive]}
                    onPress={() => setSleeve(item)}
                    scaleDown={0.95}
                  >
                    <Text style={[styles.detailChipText, isSelected && styles.detailChipTextActive]}>
                      {item}
                    </Text>
                  </AnimatedPressable>
                );
              })}
            </View>
          </View>
        )}

        {/* Step 4: Size */}
        {step === 4 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Tentukan Ukuran Anda</Text>
            <Text style={styles.stepDesc}>Gunakan ukuran standar atau tautkan dengan data AI Stylist.</Text>

            <View style={styles.sizeContainer}>
              <View style={styles.standardSizeRow}>
                {['XS', 'S', 'M', 'L'].map((item) => (
                  <AnimatedPressable
                    key={item}
                    style={[styles.sizeCircle, size === item && styles.sizeCircleActive]}
                    onPress={() => setSize(item)}
                    scaleDown={0.92}
                  >
                    <Text style={[styles.sizeCircleText, size === item && styles.sizeCircleTextActive]}>
                      {item}
                    </Text>
                  </AnimatedPressable>
                ))}
              </View>

              <AnimatedPressable
                style={[styles.customSizePill, size === 'Custom' && styles.customSizePillActive]}
                onPress={() => setSize('Custom')}
                scaleDown={0.95}
              >
                <MaterialCommunityIcons
                  name="ruler"
                  size={15}
                  color={size === 'Custom' ? colors.white : colors.forest}
                />
                <Text style={[styles.customSizeText, size === 'Custom' && styles.customSizeTextActive]}>
                  Custom (Gunakan Profil AI Stylist)
                </Text>
              </AnimatedPressable>
            </View>

            {size === 'Custom' && (
              <View style={styles.measureCard}>
                <View style={styles.customAlert}>
                  <MaterialCommunityIcons name="ruler" size={15} color={colors.forest} />
                  <Text style={styles.customAlertText}>Isi ukuran tubuh dalam sentimeter untuk pola yang presisi.</Text>
                </View>
                {MEASUREMENTS.map(([key, label]) => (
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
          </View>
        )}
      </ScrollView>

      {/* Summary Footer bar */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <View style={styles.footerInfo}>
          <Text style={styles.footerLabel}>Total Biaya Kustom</Text>
          <Text style={styles.footerPrice}>{formatCurrency(totalPrice)}</Text>
          <View style={styles.footerEcoRow}>
            <MaterialCommunityIcons name="leaf" size={11} color={colors.forest} />
            <Text style={styles.footerEcoText}>Hemat {fabric.saved} kain sisa</Text>
          </View>
        </View>

        <AnimatedPressable style={styles.nextButton} onPress={next} scaleDown={0.97}>
          <Text style={styles.nextButtonText}>
            {step === 4 ? 'Pesan Sekarang' : 'Lanjut'}
          </Text>
          <Feather name="arrow-right" size={18} color={colors.white} />
        </AnimatedPressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 12,
    backgroundColor: colors.ivory,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.sandLight,
    borderWidth: 1,
    borderColor: colors.lightGray,
  },
  headerTitle: {
    color: colors.charcoal,
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    color: colors.warmGray,
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
  progressRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 5,
    paddingBottom: 14,
    backgroundColor: colors.ivory,
  },
  progressBar: {
    flex: 1,
    height: 4,
    borderRadius: 9999,
    backgroundColor: colors.lightGray,
  },
  progressBarActive: {
    backgroundColor: colors.forest,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 110,
  },
  stepContainer: {
    flex: 1,
  },
  stepTitle: {
    color: colors.charcoal,
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.4,
  },
  stepDesc: {
    color: colors.warmGray,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 5,
    marginBottom: 20,
  },
  // ─── Model list (Step 1) ──────────────────────────────────────────────────
  modelList: {
    gap: 12,
  },
  modelCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.lightGray,
    padding: 16,
    gap: 14,
    ...shadows.sm,
  },
  modelCardActive: {
    backgroundColor: 'rgba(47,79,58,0.04)',
    borderColor: colors.forest,
    ...shadows.md,
  },
  modelCardInfo: {
    flex: 1,
  },
  modelCardLabel: {
    color: colors.charcoal,
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  modelCardLabelActive: {
    color: colors.forest,
  },
  modelCardPrice: {
    color: colors.warmGray,
    fontSize: 13,
    fontWeight: '700',
    marginTop: 3,
  },
  modelCardPriceActive: {
    color: colors.forest,
    fontWeight: '900',
  },
  modelCheckDot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.forest,
  },
  iconWrapper: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.sandLight,
    flexShrink: 0,
  },
  iconWrapperActive: {
    backgroundColor: colors.forest,
  },
  fabricList: {
    gap: 12,
  },
  fabricCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.lightGray,
    padding: 16,
    ...shadows.sm,
  },
  fabricCardActive: {
    backgroundColor: 'rgba(47,79,58,0.04)',
    borderColor: colors.forest,
    ...shadows.md,
  },
  fabricLabel: {
    color: colors.charcoal,
    fontSize: 14,
    fontWeight: '850',
  },
  fabricSub: {
    color: colors.warmGray,
    fontSize: 12,
    marginTop: 3,
  },
  fabricExtra: {
    color: colors.terracotta,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 4,
  },
  fabricBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: colors.successLight,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 9999,
  },
  fabricBadgeText: {
    color: colors.forest,
    fontSize: 9,
    fontWeight: '800',
  },
  subTitle: {
    color: colors.charcoal,
    fontSize: 15,
    fontWeight: '900',
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  detailChip: {
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.lightGray,
  },
  detailChipActive: {
    backgroundColor: colors.forest,
    borderColor: colors.forest,
  },
  detailChipText: {
    color: colors.charcoal,
    fontSize: 13,
    fontWeight: '700',
  },
  detailChipTextActive: {
    color: colors.white,
    fontWeight: '900',
  },
  sizeContainer: {
    gap: 10,
    marginBottom: 20,
  },
  standardSizeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  sizeCircle: {
    flex: 1,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.lightGray,
  },
  sizeCircleActive: {
    backgroundColor: colors.forest,
    borderColor: colors.forest,
    ...shadows.sm,
  },
  sizeCircleText: {
    color: colors.charcoal,
    fontSize: 13,
    fontWeight: '700',
  },
  sizeCircleTextActive: {
    color: colors.white,
    fontWeight: '900',
  },
  customSizePill: {
    flexDirection: 'row',
    minHeight: 46,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.lightGray,
    paddingHorizontal: 16,
  },
  customSizePillActive: {
    backgroundColor: colors.forest,
    borderColor: colors.forest,
    ...shadows.forest,
  },
  customSizeText: {
    color: colors.forest,
    fontSize: 13,
    fontWeight: '800',
  },
  customSizeTextActive: {
    color: colors.white,
  },
  customAlert: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: 'rgba(47,79,58,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(47,79,58,0.12)',
    borderRadius: 16,
    padding: 12,
  },
  customAlertText: {
    flex: 1,
    color: colors.forest,
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 16,
  },
  measureCard: {
    borderRadius: 18,
    padding: 12,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.lightGray,
  },
  measureRow: {
    minHeight: 46,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  measureLabel: {
    color: colors.charcoal,
    fontSize: 11,
    fontWeight: '700',
  },
  measureInput: {
    width: 90,
    height: 34,
    borderRadius: 10,
    paddingHorizontal: 10,
    color: colors.charcoal,
    textAlign: 'right',
    backgroundColor: colors.ivory,
  },
  footer: {
    flexDirection: 'row',
    gap: 14,
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: 'rgba(250,247,240,0.97)',
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
    alignItems: 'center',
    ...shadows.xl,
  },
  footerInfo: {
    flex: 1,
  },
  footerLabel: {
    color: colors.warmGray,
    fontSize: 10,
    fontWeight: '600',
  },
  footerPrice: {
    color: colors.forest,
    fontSize: 18,
    fontWeight: '900',
    marginTop: 2,
  },
  footerEcoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 3,
  },
  footerEcoText: {
    color: colors.success,
    fontSize: 9,
    fontWeight: '800',
  },
  nextButton: {
    minWidth: 140,
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 18,
    paddingVertical: 13,
    borderRadius: 17,
    backgroundColor: colors.forest,
    ...shadows.forest,
  },
  nextButtonText: {
    color: colors.white,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '900',
    textAlign: 'center',
  },
});
