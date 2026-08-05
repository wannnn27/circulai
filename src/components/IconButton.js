import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { colors, shadows } from '../theme/colors';

/**
 * IconButton — circular icon button with multiple variants.
 *
 * Variants:
 *  - 'default'  — white background with border
 *  - 'filled'   — forest background, white icon
 *  - 'ghost'    — transparent background, colored icon
 *  - 'inverted' — sand background, forest icon
 *  - 'sand'     — sand background, charcoal icon
 *
 * Size: 'sm' (36) | 'md' (42) | 'lg' (48)
 */
export default function IconButton({
  name,
  size = 'md',
  variant = 'default',
  onPress,
  color,
  hitSlop = 8,
}) {
  const config = variantMap[variant] ?? variantMap.default;
  const dim = sizeMap[size] ?? sizeMap.md;
  const iconSize = dim - 20;
  const iconColor = color ?? config.icon;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        { width: dim, height: dim, borderRadius: dim / 2 },
        config.container,
        pressed && styles.pressed,
      ]}
      onPress={onPress}
      hitSlop={hitSlop}
    >
      <View style={styles.inner}>
        <Feather name={name} size={iconSize} color={iconColor} />
      </View>
    </Pressable>
  );
}

const variantMap = {
  default: {
    container: {
      backgroundColor: colors.white,
      borderWidth: 1.5,
      borderColor: colors.lightGray,
      ...shadows.sm,
    },
    icon: colors.charcoal,
  },
  filled: {
    container: {
      backgroundColor: colors.forest,
      ...shadows.forest,
    },
    icon: colors.white,
  },
  ghost: {
    container: {
      backgroundColor: 'transparent',
    },
    icon: colors.charcoal,
  },
  inverted: {
    container: {
      backgroundColor: colors.sand,
      borderWidth: 0,
    },
    icon: colors.forest,
  },
  sand: {
    container: {
      backgroundColor: colors.sand,
    },
    icon: colors.charcoal,
  },
  forestGhost: {
    container: {
      backgroundColor: 'rgba(47,79,58,0.10)',
    },
    icon: colors.forest,
  },
};

const sizeMap = {
  sm: 36,
  md: 42,
  lg: 48,
};

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  inner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.75,
  },
});
