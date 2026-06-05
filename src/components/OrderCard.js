import React from 'react';
import { Alert, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

import { cardShadow, colors } from '../theme/colors';
import { orderStatusIndex, orderSteps } from '../data/appData';

export default function OrderCard({ order, onDetail }) {
  const currentIndex = orderStatusIndex(order.status);
  const currentStep = orderSteps[currentIndex];
  const shipped = order.status === 'shipped';

  return (
    <View style={styles.card}>
      <View style={styles.top}>
        <Image source={{ uri: order.image }} style={styles.image} />
        <View style={styles.titleArea}>
          <View style={styles.titleRow}>
            <View style={styles.titleTextArea}>
              <Text style={styles.title}>{order.product}</Text>
              <Text style={styles.desc}>by {order.tailor}</Text>
            </View>
            <View style={[styles.statusBadge, shipped && styles.statusBadgeDone]}>
              <Text style={[styles.statusText, shipped && styles.statusTextDone]}>
                {shipped ? 'Dikirim' : 'Proses'}
              </Text>
            </View>
          </View>
          <View style={styles.inlineMeta}>
            <Feather name="map-pin" size={12} color={colors.warmGray} />
            <Text style={styles.metaText}>{order.tailorCity}</Text>
          </View>
          <View style={styles.inlineMeta}>
            <Feather name="clock" size={12} color={colors.warmGray} />
            <Text style={styles.metaText}>Estimasi: {order.eta}</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.price}>{order.price}</Text>
            <Text style={styles.orderId}>{order.id}</Text>
          </View>
        </View>
      </View>

      <View style={styles.timelineCard}>
        <View style={styles.currentStepRow}>
          <View style={styles.stepIcon}>
            <Feather name="package" size={14} color={colors.white} />
          </View>
          <View style={styles.titleTextArea}>
            <Text style={styles.currentStepTitle}>{currentStep.label}</Text>
            <Text style={styles.currentStepDesc}>{currentStep.desc}</Text>
          </View>
        </View>
        <View style={styles.progressSegments}>
          {orderSteps.map((step, index) => (
            <View
              key={step.id}
              style={[
                styles.progressSegment,
                index <= currentIndex && styles.progressSegmentActive
              ]}
            />
          ))}
        </View>
        <View style={styles.timelineLabels}>
          <Text style={styles.timelineLabel}>Diterima</Text>
          <Text style={styles.timelineLabel}>Dikirim</Text>
        </View>
      </View>

      <View style={styles.actions}>
        <Pressable style={styles.primaryAction} onPress={onDetail}>
          <Feather name="file-text" size={15} color={colors.white} />
          <Text style={styles.primaryActionText}>Detail Pesanan</Text>
        </Pressable>
        <Pressable
          style={styles.iconAction}
          onPress={() => Alert.alert('Chat Penjahit', `Membuka chat dengan ${order.tailor}.`)}
        >
          <Feather name="message-circle" size={17} color={colors.forest} />
        </Pressable>
        <Pressable style={styles.iconAction} onPress={onDetail}>
          <MaterialCommunityIcons name="qrcode-scan" size={17} color={colors.forest} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 22,
    backgroundColor: colors.white,
    marginBottom: 14,
    overflow: 'hidden',
    ...cardShadow
  },
  top: {
    flexDirection: 'row',
    gap: 12,
    padding: 14
  },
  image: {
    width: 78,
    height: 96,
    borderRadius: 14,
    backgroundColor: colors.sand
  },
  titleArea: {
    flex: 1,
    minWidth: 0
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8
  },
  titleTextArea: {
    flex: 1,
    minWidth: 0
  },
  title: {
    color: colors.charcoal,
    fontSize: 15,
    fontWeight: '900'
  },
  desc: {
    color: colors.warmGray,
    fontSize: 12,
    marginTop: 2
  },
  statusBadge: {
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 5,
    backgroundColor: 'rgba(217,154,61,0.12)'
  },
  statusBadgeDone: {
    backgroundColor: 'rgba(79,138,91,0.12)'
  },
  statusText: {
    color: colors.warning,
    fontSize: 10,
    fontWeight: '900'
  },
  statusTextDone: {
    color: colors.success
  },
  inlineMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 7
  },
  metaText: {
    color: colors.warmGray,
    fontSize: 11
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8
  },
  price: {
    color: colors.forest,
    fontSize: 13,
    fontWeight: '900'
  },
  orderId: {
    color: colors.warmGray,
    fontSize: 11,
    fontWeight: '700'
  },
  timelineCard: {
    marginHorizontal: 14,
    borderRadius: 16,
    padding: 12,
    backgroundColor: 'rgba(47,79,58,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(47,79,58,0.12)'
  },
  currentStepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  stepIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.forest
  },
  currentStepTitle: {
    color: colors.forest,
    fontSize: 12,
    fontWeight: '900'
  },
  currentStepDesc: {
    color: colors.warmGray,
    fontSize: 11,
    marginTop: 1
  },
  progressSegments: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 12
  },
  progressSegment: {
    flex: 1,
    height: 4,
    borderRadius: 999,
    backgroundColor: colors.lightGray
  },
  progressSegmentActive: {
    backgroundColor: colors.forest
  },
  timelineLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4
  },
  timelineLabel: {
    color: colors.warmGray,
    fontSize: 10
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    padding: 14
  },
  primaryAction: {
    flex: 1,
    minHeight: 42,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    backgroundColor: colors.forest
  },
  primaryActionText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '800'
  },
  iconAction: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.sand
  }
});
