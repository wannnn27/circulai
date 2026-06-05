import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme/colors';

export default function SectionHeader({ title, action, onAction }) {
  return (
    <View style={styles.header}>
      <Text style={styles.title}>{title}</Text>
      {!!action && (
        <Pressable onPress={onAction}>
          <Text style={styles.action}>{action}</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
    marginBottom: 12
  },
  title: {
    color: colors.charcoal,
    fontSize: 18,
    fontWeight: '800'
  },
  action: {
    color: colors.forest,
    fontSize: 12,
    fontWeight: '800'
  }
});
