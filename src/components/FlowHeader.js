import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import AnimatedPressable from './AnimatedPressable';
import { colors } from '../theme/colors';

export default function FlowHeader({ title, subtitle, onBack, right }) {
  return (
    <View style={styles.header}>
      <AnimatedPressable style={styles.back} onPress={onBack} scaleDown={0.9}>
        <Feather name="chevron-left" size={20} color={colors.charcoal} />
      </AnimatedPressable>
      <View style={styles.copy}>
        <Text style={styles.title}>{title}</Text>
        {!!subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
      <View style={styles.right}>{right}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: colors.ivory,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  back: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.lightGray,
  },
  copy: {
    flex: 1,
  },
  title: {
    color: colors.charcoal,
    fontSize: 17,
    fontWeight: '900',
  },
  subtitle: {
    color: colors.warmGray,
    fontSize: 10,
    marginTop: 2,
  },
  right: {
    minWidth: 40,
    alignItems: 'flex-end',
  },
});
