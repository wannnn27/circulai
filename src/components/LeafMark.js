import React from 'react';
import { StyleSheet, View } from 'react-native';

export default function LeafMark({ color, size }) {
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <View
        style={[
          styles.leafShape,
          {
            width: size * 0.58,
            height: size * 0.78,
            borderColor: color,
            borderTopLeftRadius: size,
            borderBottomRightRadius: size,
            transform: [{ rotate: '-38deg' }]
          }
        ]}
      />
      <View
        style={[
          styles.leafStem,
          {
            width: size * 0.55,
            backgroundColor: color,
            transform: [{ rotate: '-38deg' }]
          }
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  leafShape: {
    borderWidth: 2,
    position: 'absolute'
  },
  leafStem: {
    height: 2,
    borderRadius: 2,
    position: 'absolute'
  }
});
