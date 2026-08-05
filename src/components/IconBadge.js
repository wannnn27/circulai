import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

import { colors, shadows } from '../theme/colors';

/**
 * IconBadge — icon inside a colored rounded container.
 * Used for quick actions and feature callouts.
 *
 * Props:
 *  - family: 'feather' | 'material'
 *  - name: icon name
 *  - size: icon size (default 20)
 *  - color: icon color (default forest)
 *  - backgroundColor: container color (default sand)
 *  - containerSize: container size (default 44)
 *  - radius: border radius (default 14)
 *  - elevated: add subtle shadow
 */
export default function IconBadge({
  family = 'feather',
  name,
  size = 20,
  color = colors.forest,
  backgroundColor = colors.sand,
  containerSize = 44,
  radius = 14,
  elevated = false,
  style,
}) {
  const Icon = family === 'material' ? MaterialCommunityIcons : Feather;

  return (
    <View
      style={[
        styles.badge,
        {
          width: containerSize,
          height: containerSize,
          borderRadius: radius,
          backgroundColor,
        },
        elevated && shadows.sm,
        style,
      ]}
    >
      <Icon name={name} size={size} color={color} />
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
