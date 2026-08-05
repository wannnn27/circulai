import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, shadows } from '../theme/colors';

/**
 * MetricCard — displays a key metric with value, label, and optional icon.
 *
 * Props:
 *  - value: string
 *  - label: string
 *  - icon: MaterialCommunityIcons icon name (optional)
 *  - flat: boolean — remove background/border (for use inside cards)
 *  - accent: boolean — highlight with forest color background
 */
export default function MetricCard({ value, label, icon, flat = false, accent = false }) {
  return (
    <View style={[
      styles.card,
      flat && styles.flat,
      accent && styles.accent,
    ]}>
      <Text style={[styles.value, accent && styles.valueAccent]}>{value}</Text>
      <Text style={[styles.label, accent && styles.labelAccent]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minHeight: 62,
    borderRadius: 15,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    borderWidth: 1.5,
    borderColor: colors.lightGray,
    ...shadows.sm,
  },
  flat: {
    borderWidth: 0,
    backgroundColor: 'transparent',
    shadowOpacity: 0,
    elevation: 0,
  },
  accent: {
    backgroundColor: colors.forest,
    borderColor: colors.forest,
  },
  value: {
    color: colors.forest,
    fontSize: 17,
    fontWeight: '900',
    lineHeight: 21,
    marginBottom: 2,
  },
  valueAccent: {
    color: colors.white,
  },
  label: {
    color: colors.warmGray,
    fontSize: 9,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 13,
    letterSpacing: 0.2,
  },
  labelAccent: {
    color: 'rgba(255,255,255,0.80)',
  },
});
