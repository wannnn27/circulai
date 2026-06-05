import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

import IconBadge from './IconBadge';
import { colors } from '../theme/colors';

export default function QuickAction({ title, desc, icon, family = 'feather', onPress }) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <IconBadge name={icon} family={family} size={20} containerSize={42} />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.desc}>{desc}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: 20,
    padding: 16,
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.lightGray
  },
  title: {
    color: colors.charcoal,
    fontSize: 15,
    fontWeight: '800',
    marginTop: 14
  },
  desc: {
    color: colors.warmGray,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 4
  }
});
