import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { tabs } from '../data/appData';
import { colors } from '../theme/colors';

export default function BottomTabs({ active, onChange }) {
  return (
    <View style={styles.tabs}>
      {tabs.map((tab) => {
        const selected = active === tab.id;
        const isCenter = tab.id === 'quiz';
        const iconColor = selected ? (isCenter ? colors.white : colors.forest) : colors.warmGray;

        return (
          <Pressable
            key={tab.id}
            style={styles.tabButton}
            onPress={() => onChange(tab.id)}
            hitSlop={8}
          >
            <View
              style={[
                isCenter ? styles.centerIcon : styles.icon,
                selected && (isCenter ? styles.centerIconActive : styles.iconActive)
              ]}
            >
              <Feather name={tab.icon} size={isCenter ? 22 : 21} color={iconColor} />
            </View>
            <Text style={[styles.label, selected && styles.labelActive]}>{tab.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  tabs: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    minHeight: 86,
    paddingTop: 12,
    paddingBottom: 16,
    paddingHorizontal: 6,
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
    backgroundColor: colors.white,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-around',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 8
  },
  tabButton: {
    minWidth: 56,
    alignItems: 'center',
    gap: 4
  },
  icon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center'
  },
  iconActive: {
    backgroundColor: 'rgba(47,79,58,0.10)'
  },
  centerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.sand,
    marginTop: -20
  },
  centerIconActive: {
    backgroundColor: colors.forest,
    shadowColor: colors.forest,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 6
  },
  label: {
    color: colors.warmGray,
    fontSize: 10,
    fontWeight: '500'
  },
  labelActive: {
    color: colors.forest,
    fontWeight: '900'
  }
});
