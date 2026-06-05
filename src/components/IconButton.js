import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { colors } from '../theme/colors';

export default function IconButton({ name = 'bell', inverted = false }) {
  return (
    <View style={[styles.button, inverted && styles.inverted]}>
      <Feather name={name} size={17} color={inverted ? colors.white : colors.forest} />
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.lightGray
  },
  inverted: {
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderColor: 'rgba(255,255,255,0.18)'
  }
});
