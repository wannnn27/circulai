import React from 'react';
import { StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { colors } from '../theme/colors';

/**
 * LeafMark — CIRCULAI's brand logomark.
 * A stylized leaf representing circular fashion and sustainability.
 *
 * Props:
 *  - color: string (default colors.sand)
 *  - size: number (default 40)
 */
export default function LeafMark({ color = colors.sand, size = 40 }) {
  // Use MaterialCommunityIcons leaf for a clean, professional logomark
  // with a subtle circle behind it for context
  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: size * 0.3,
        },
      ]}
    >
      {/* Circular arc top-right — suggests circularity */}
      <View
        style={[
          styles.arc,
          {
            width: size * 0.65,
            height: size * 0.65,
            borderRadius: size * 0.65,
            borderColor: color,
            borderWidth: Math.max(1.5, size * 0.038),
            top: size * 0.04,
            right: size * 0.04,
          },
        ]}
      />
      {/* Leaf icon — centered */}
      <MaterialCommunityIcons
        name="leaf"
        size={size * 0.52}
        color={color}
        style={styles.icon}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  arc: {
    position: 'absolute',
    borderBottomColor: 'transparent',
    borderLeftColor: 'transparent',
    opacity: 0.35,
  },
  icon: {
    // Slight downward offset for optical centering with arc
    marginTop: 2,
  },
});
