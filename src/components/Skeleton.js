import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

import { colors } from '../theme/colors';

/**
 * Skeleton — shimmer loading placeholder.
 * Use while data is loading to maintain layout.
 *
 * Props:
 *  - width: number | string
 *  - height: number
 *  - borderRadius: number (default 12)
 *  - style: optional override
 */
export function Skeleton({ width, height, borderRadius = 12, style }) {
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.4,
          duration: 700,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        styles.skeleton,
        { width, height, borderRadius, opacity },
        style,
      ]}
    />
  );
}

/**
 * ProductCardSkeleton — full product card loading placeholder.
 */
export function ProductCardSkeleton({ grid = false }) {
  return (
    <View style={[
      styles.card,
      grid ? styles.gridCard : styles.listCard
    ]}>
      <Skeleton width="100%" height={grid ? 160 : 180} borderRadius={0} />
      <View style={styles.cardBody}>
        <Skeleton width={80} height={18} borderRadius={9} />
        <Skeleton width="90%" height={14} borderRadius={7} style={{ marginTop: 8 }} />
        <Skeleton width="60%" height={12} borderRadius={6} style={{ marginTop: 5 }} />
        <View style={styles.cardFooter}>
          <Skeleton width={70} height={16} borderRadius={8} />
          <Skeleton width={50} height={12} borderRadius={6} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: colors.lightGray,
  },
  card: {
    backgroundColor: colors.white,
    marginBottom: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.lightGray,
  },
  gridCard: {
    width: '48%',
    borderRadius: 18,
    ...shadows.sm,
  },
  listCard: {
    borderRadius: 20,
    ...shadows.md,
  },
  cardBody: {
    padding: 13,
    gap: 4,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
});
