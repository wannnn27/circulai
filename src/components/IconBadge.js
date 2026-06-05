import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

import { colors } from '../theme/colors';

export default function IconBadge({
  family = 'feather',
  name,
  size = 20,
  color = colors.forest,
  backgroundColor = colors.sand,
  containerSize = 44,
  radius = 14,
  style
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
          backgroundColor
        },
        style
      ]}
    >
      <Icon name={name} size={size} color={color} />
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignItems: 'center',
    justifyContent: 'center'
  }
});
