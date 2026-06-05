import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import OrderCard from '../components/OrderCard';
import PassportModal from '../components/PassportModal';
import { useAppState } from '../state/AppContext';
import { layout } from '../styles/layout';
import { colors } from '../theme/colors';

export default function OrdersScreen({ onNavigate }) {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const { orders } = useAppState();

  return (
    <View style={layout.flex}>
      <ScrollView
        style={layout.scroll}
        contentContainerStyle={layout.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Tailor Track</Text>
          <Text style={styles.desc}>Status produksi outfit pesananmu</Text>
        </View>

        {orders.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Feather name="package" size={30} color={colors.forest} />
            </View>
            <Text style={styles.emptyTitle}>Belum ada pesanan</Text>
            <Text style={styles.emptyDesc}>Yuk mulai pesan outfit personal pertamamu dari kain sirkular.</Text>
            <Pressable style={styles.emptyButton} onPress={() => onNavigate('explore')}>
              <Text style={styles.emptyButtonText}>Mulai Belanja</Text>
            </Pressable>
          </View>
        ) : (
          orders.map((order) => (
            <OrderCard key={order.id} order={order} onDetail={() => setSelectedOrder(order)} />
          ))
        )}
      </ScrollView>

      <PassportModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: 18
  },
  title: {
    color: colors.charcoal,
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 4
  },
  desc: {
    color: colors.warmGray,
    fontSize: 14,
    lineHeight: 20
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 70
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.sand,
    marginBottom: 18
  },
  emptyTitle: {
    color: colors.charcoal,
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 8
  },
  emptyDesc: {
    color: colors.warmGray,
    fontSize: 14,
    lineHeight: 20,
    maxWidth: 270,
    textAlign: 'center'
  },
  emptyButton: {
    borderRadius: 16,
    paddingHorizontal: 22,
    paddingVertical: 13,
    backgroundColor: colors.forest,
    marginTop: 22
  },
  emptyButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '900'
  }
});
