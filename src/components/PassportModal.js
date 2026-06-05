import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { colors } from '../theme/colors';

export default function PassportModal({ order, onClose }) {
  if (!order) return null;

  return (
    <Modal transparent animationType="slide" visible={!!order} onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheet}>
          <View style={styles.handle} />
          <View style={styles.titleRow}>
            <MaterialCommunityIcons name="qrcode-scan" size={22} color={colors.forest} />
            <Text style={styles.title}>Product Passport</Text>
          </View>
          <View style={styles.qrBox}>
            <View style={styles.qrGrid}>
              {Array.from({ length: 64 }).map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.qrCell,
                    (index * 7 + index) % 5 < 2 && styles.qrCellDark
                  ]}
                />
              ))}
            </View>
          </View>

          {[
            ['Produk', order.product],
            ['Penjahit', order.tailor],
            ['Lokasi', order.tailorCity],
            ['Jenis Kain', 'Rayon berkualitas lokal'],
            ['Kain Sisa Dimanfaatkan', '0.8 meter'],
            ['Tanggal Produksi', '4 Juni 2026']
          ].map(([label, value]) => (
            <View key={label} style={styles.row}>
              <Text style={styles.label}>{label}</Text>
              <Text style={styles.value}>{value}</Text>
            </View>
          ))}

          <Pressable style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeText}>Tutup</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(31,36,33,0.44)'
  },
  sheet: {
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 28,
    backgroundColor: colors.ivory
  },
  handle: {
    width: 44,
    height: 5,
    borderRadius: 999,
    backgroundColor: colors.lightGray,
    alignSelf: 'center',
    marginBottom: 16
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16
  },
  title: {
    color: colors.charcoal,
    fontSize: 18,
    fontWeight: '900'
  },
  qrBox: {
    width: 160,
    height: 160,
    borderRadius: 20,
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 16
  },
  qrGrid: {
    width: 120,
    height: 120,
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  qrCell: {
    width: 15,
    height: 15,
    borderRadius: 1
  },
  qrCellDark: {
    backgroundColor: colors.charcoal
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray
  },
  label: {
    color: colors.warmGray,
    fontSize: 13
  },
  value: {
    flex: 1,
    color: colors.charcoal,
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'right'
  },
  closeButton: {
    borderRadius: 16,
    paddingVertical: 13,
    alignItems: 'center',
    backgroundColor: colors.sand,
    marginTop: 18
  },
  closeText: {
    color: colors.forest,
    fontSize: 14,
    fontWeight: '900'
  }
});
