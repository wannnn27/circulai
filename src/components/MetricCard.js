import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme/colors';

export default function MetricCard({ value, label, flat = false }) {
  return (
    <View style={[styles.card, flat && styles.flat]}>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minHeight: 74,
    borderRadius: 18,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.lightGray
  },
  flat: {
    borderWidth: 0,
    backgroundColor: 'transparent'
  },
  value: {
    color: colors.forest,
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 2
  },
  label: {
    color: colors.warmGray,
    fontSize: 11,
    textAlign: 'center'
  }
});
