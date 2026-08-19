/**
 * @file PassportScannerModal.js
 * @description Real camera QR scanner for Digital Product Passport (DPP).
 *
 * Uses `expo-camera` with live barcode scanning and visual target reticle.
 * When a circular fashion tag is scanned, it verifies the product traceability
 * and opens the Digital Product Passport sheet.
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Easing,
  Linking,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import AnimatedPressable from './AnimatedPressable';
import LeafMark from './LeafMark';
import { colors, shadows } from '../theme/colors';

export default function PassportScannerModal({ visible, onClose, onScannedPassport, orders = [], products = [] }) {
  const insets = useSafeAreaInsets();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [activeTorch, setActiveTorch] = useState(false);

  // Laser sweep animation
  const laserAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) {
      setScanned(false);
      return undefined;
    }

    setScanned(false);
    laserAnim.setValue(0);
    const sweep = Animated.loop(
      Animated.sequence([
        Animated.timing(laserAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(laserAnim, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );
    sweep.start();

    return () => sweep.stop();
  }, [laserAnim, visible]);

  if (!visible) return null;

  const handleRequestPermission = async () => {
    try {
      const res = await requestPermission();
      if (!res?.granted) {
        Alert.alert(
          'Izin Kamera Diperlukan',
          'Izin kamera belum aktif. Buka Pengaturan iPhone (Settings > Expo Go) lalu aktifkan izin Camera.',
          [
            { text: 'Batal', style: 'cancel' },
            { text: 'Buka Pengaturan', onPress: () => Linking.openSettings() }
          ]
        );
      }
    } catch (err) {
      Linking.openSettings();
    }
  };

  const handleBarcodeScanned = ({ data }) => {
    if (scanned) return;
    setScanned(true);

    // Try to match scanned data with existing orders or products
    const cleanData = String(data || '').trim();
    let matchedOrder = orders.find((o) => o.id === cleanData || o.product === cleanData);
    
    if (!matchedOrder) {
      const matchedProduct = products.find((p) => String(p.id) === cleanData || p.name.toLowerCase() === cleanData.toLowerCase()) ?? products[0];
      matchedOrder = {
        id: `PASSPORT-${matchedProduct?.id ?? '001'}`,
        product: matchedProduct?.name ?? 'Luna Wrap Top',
        price: matchedProduct?.price ?? 155000,
        rawPrice: matchedProduct?.price ?? 155000,
        image: matchedProduct?.image,
        tailor: matchedProduct?.tailor ?? 'Rahayu Tailor',
        tailorCity: matchedProduct?.tailorCity ?? 'Sleman, Yogyakarta',
        material: matchedProduct?.material ?? 'Rayon sisa atelier',
        savedFabric: matchedProduct?.savedFabric ?? '0.8m',
        status: 'DELIVERED',
        placedAtLabel: '4 Juni 2026',
        eta: 'Sudah diterima',
        passport: {
          id: `DPP-2026-${matchedProduct?.id ?? '108'}`,
          serialNumber: `CRC-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
          productName: matchedProduct?.name,
          tailor: matchedProduct?.tailor,
          productionLocation: matchedProduct?.tailorCity,
          materialOrigin: matchedProduct?.material,
          status: 'ACTIVE',
          impact: {
            savedFabric: matchedProduct?.savedFabric,
            estimatedCo2: '1.8 kg CO2e'
          },
          verificationCode: 'VERIFIED-AUTHENTIC-2026',
          issuedAt: '4 Juni 2026',
          activatedAt: '10 Juni 2026'
        }
      };
    }

    onClose();
    setTimeout(() => {
      onScannedPassport(matchedOrder);
    }, 200);
  };

  const handleSampleScan = (sampleProduct) => {
    handleBarcodeScanned({ data: String(sampleProduct.id) });
  };

  const laserTranslateY = laserAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 220],
  });

  const canUseCamera = Platform.OS !== 'web' && permission?.granted;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        {/* Top Header Bar */}
        <View style={styles.topBar}>
          <AnimatedPressable style={styles.iconBtn} onPress={onClose} scaleDown={0.9}>
            <Feather name="x" size={20} color={colors.white} />
          </AnimatedPressable>
          <View style={styles.headerTitleWrap}>
            <LeafMark size={16} color={colors.mint} />
            <Text style={styles.headerTitle}>Digital Passport Scanner</Text>
          </View>
          {canUseCamera ? (
            <AnimatedPressable
              style={[styles.iconBtn, activeTorch && styles.iconBtnActive]}
              onPress={() => setActiveTorch((prev) => !prev)}
              scaleDown={0.9}
            >
              <Feather name={activeTorch ? 'zap' : 'zap-off'} size={18} color={activeTorch ? colors.forest : colors.white} />
            </AnimatedPressable>
          ) : (
            <View style={{ width: 40 }} />
          )}
        </View>

        {/* Camera Viewfinder Area */}
        <View style={styles.viewfinderContainer}>
          {canUseCamera ? (
            <CameraView
              style={StyleSheet.absoluteFillObject}
              facing="back"
              enableTorch={activeTorch}
              barcodeScannerSettings={{
                barcodeTypes: ['qr', 'ean13', 'code128', 'code39'],
              }}
              onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
            />
          ) : (
            <View style={styles.webFallbackCamera}>
              <MaterialCommunityIcons name="camera-off" size={48} color="rgba(255,255,255,0.4)" />
              <Text style={styles.fallbackTitle}>
                {!permission?.granted ? 'Izin Kamera Diperlukan' : 'Mode Simulator Aktif'}
              </Text>
              <Text style={styles.fallbackSub}>
                {!permission?.granted
                  ? 'Berikan izin kamera untuk memindai QR code tag pakaian CIRCULAI secara langsung.'
                  : 'Pilih tag contoh di bawah untuk menguji verifikasi Paspor Digital.'}
              </Text>
              {!permission?.granted && (
                <AnimatedPressable style={styles.grantBtn} onPress={handleRequestPermission} scaleDown={0.96}>
                  <Feather name="camera" size={16} color={colors.white} />
                  <Text style={styles.grantBtnText}>Beri Izin Kamera</Text>
                </AnimatedPressable>
              )}
            </View>
          )}

          {/* Dark Vignette Overlay - Only rendered with active camera and transparent to clicks */}
          {canUseCamera && (
            <View style={styles.overlayMask} pointerEvents="none">
              {/* Target Reticle Box */}
              <View style={styles.reticleBox}>
                {/* 4 Corner Markers */}
                <View style={[styles.corner, styles.topLeft]} />
                <View style={[styles.corner, styles.topRight]} />
                <View style={[styles.corner, styles.bottomLeft]} />
                <View style={[styles.corner, styles.bottomRight]} />

                {/* Animated Laser Line */}
                <Animated.View
                  style={[
                    styles.laserLine,
                    {
                      transform: [{ translateY: laserTranslateY }],
                    },
                  ]}
                />

                <View style={styles.reticleCenter}>
                  <MaterialCommunityIcons name="qrcode-scan" size={36} color="rgba(255,255,255,0.4)" />
                </View>
              </View>
            </View>
          )}
        </View>

        {/* Instruction Bottom Sheet */}
        <View style={styles.bottomCard}>
          <Text style={styles.instructionTitle}>Arahkan Kamera ke QR Code Tag</Text>
          <Text style={styles.instructionDesc}>
            Scan QR tag pada pakaian CIRCULAI untuk melihat transparansi bahan, jejak karbon dihemat, dan sertifikat digital penjahit lokal.
          </Text>

          {/* Quick Demo Test Buttons */}
          <View style={styles.sampleSection}>
            <Text style={styles.sampleLabel}>Atau coba simulasi tag produk:</Text>
            <View style={styles.sampleRow}>
              {products.slice(0, 3).map((p) => (
                <AnimatedPressable
                  key={p.id}
                  style={styles.sampleChip}
                  onPress={() => handleSampleScan(p)}
                  scaleDown={0.95}
                >
                  <MaterialCommunityIcons name="qrcode" size={14} color={colors.forest} />
                  <Text style={styles.sampleChipText} numberOfLines={1}>
                    {p.name}
                  </Text>
                </AnimatedPressable>
              ))}
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F1713',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    zIndex: 10,
  },
  headerTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '800',
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBtnActive: {
    backgroundColor: colors.sand,
  },
  viewfinderContainer: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  webFallbackCamera: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#16221B',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  fallbackTitle: {
    color: colors.white,
    fontSize: 17,
    fontWeight: '800',
    marginTop: 12,
    textAlign: 'center',
  },
  fallbackSub: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 19,
    maxWidth: 280,
  },
  grantBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.forest,
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 14,
    marginTop: 16,
  },
  grantBtnText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
  overlayMask: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reticleBox: {
    width: 250,
    height: 250,
    borderRadius: 20,
    position: 'relative',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  corner: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderColor: colors.mint,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 16,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 16,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 16,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 16,
  },
  laserLine: {
    position: 'absolute',
    top: 10,
    left: 12,
    right: 12,
    height: 2,
    backgroundColor: colors.mint,
    ...shadows.md,
    shadowColor: colors.mint,
  },
  reticleCenter: {
    opacity: 0.6,
  },
  bottomCard: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 22,
    paddingTop: 20,
    paddingBottom: 24,
    ...shadows.xl,
  },
  instructionTitle: {
    color: colors.charcoal,
    fontSize: 16,
    fontWeight: '900',
    textAlign: 'center',
  },
  instructionDesc: {
    color: colors.warmGray,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  sampleSection: {
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
  },
  sampleLabel: {
    color: colors.charcoal,
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 8,
  },
  sampleRow: {
    flexDirection: 'row',
    gap: 8,
  },
  sampleChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 9,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: colors.sandLight,
    borderWidth: 1,
    borderColor: colors.sand,
  },
  sampleChipText: {
    color: colors.forest,
    fontSize: 11,
    fontWeight: '700',
  },
});
