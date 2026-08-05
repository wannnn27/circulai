import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { colors } from '../theme/colors';

/**
 * Badge — unified badge component with semantic variants.
 *
 * Variants: 'default' | 'success' | 'warning' | 'danger' | 'sand' | 'forest' | 'info'
 * Size: 'sm' | 'md'
 */
export default function Badge({ text, variant = 'default', size = 'sm', icon, dotOnly = false }) {
  const config = variantConfig[variant] ?? variantConfig.default;
  const sizeStyle = size === 'md' ? styles.md : styles.sm;
  const textSizeStyle = size === 'md' ? styles.textMd : styles.textSm;

  if (dotOnly) {
    return <View style={[styles.dot, { backgroundColor: config.iconColor }]} />;
  }

  return (
    <View style={[styles.badge, sizeStyle, { backgroundColor: config.bg }]}>
      {icon && (
        <MaterialCommunityIcons
          name={icon}
          size={size === 'md' ? 12 : 10}
          color={config.iconColor}
          style={styles.icon}
        />
      )}
      <Text style={[styles.text, textSizeStyle, { color: config.text }]}>{text}</Text>
    </View>
  );
}

const variantConfig = {
  default: {
    bg: 'rgba(47,79,58,0.10)',
    text: colors.forest,
    iconColor: colors.forest,
  },
  success: {
    bg: colors.successLight,
    text: colors.success,
    iconColor: colors.success,
  },
  warning: {
    bg: colors.warningLight,
    text: colors.warning,
    iconColor: colors.warning,
  },
  danger: {
    bg: colors.errorLight,
    text: colors.error,
    iconColor: colors.error,
  },
  sand: {
    bg: colors.sandLight,
    text: colors.charcoal,
    iconColor: colors.warmGray,
  },
  forest: {
    bg: colors.forest,
    text: colors.white,
    iconColor: colors.sand,
  },
  info: {
    bg: colors.infoLight,
    text: colors.info,
    iconColor: colors.info,
  },
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 9999,
  },
  sm: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  md: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  text: {
    fontWeight: '800',
  },
  textSm: {
    fontSize: 10,
  },
  textMd: {
    fontSize: 12,
  },
  icon: {
    marginRight: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
