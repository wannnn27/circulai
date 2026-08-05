import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme/colors';

/**
 * SectionHeader — consistent section title with optional action link.
 *
 * Props:
 *  - title: string
 *  - action: string (optional CTA text)
 *  - onAction: () => void
 */
export default function SectionHeader({ title, action, onAction }) {
  const ActionComponent = action ? require('react-native').Pressable : null;

  return (
    <View style={styles.row}>
      <Text style={styles.title}>{title}</Text>
      {action && ActionComponent && (
        <ActionComponent onPress={onAction} hitSlop={10}>
          <Text style={styles.action}>{action}</Text>
        </ActionComponent>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  title: {
    color: colors.charcoal,
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: -0.2,
  },
  action: {
    color: colors.forest,
    fontSize: 13,
    fontWeight: '700',
  },
});
