import React, { useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { tabs } from '../data/appData';
import { colors, shadows } from '../theme/colors';

const TAB_ICONS_ALT = {
  home: { feather: 'home' },
  explore: { feather: 'search' },
  quiz: { feather: 'zap' },
  orders: { feather: 'package' },
  profile: { feather: 'user' },
};

export default function BottomTabs({ active, onChange }) {
  const insets = useSafeAreaInsets();
  // Scale animations per tab
  const scales = useRef(
    Object.fromEntries(tabs.map((tab) => [tab.id, new Animated.Value(tab.id === 'home' ? 1 : 1)]))
  ).current;

  const handlePress = (tabId) => {
    if (tabId === active) return;

    onChange(tabId);

    // Pop animation on the pressed tab
    Animated.sequence([
      Animated.spring(scales[tabId], {
        toValue: 0.88,
        useNativeDriver: true,
        speed: 40,
        bounciness: 0,
      }),
      Animated.spring(scales[tabId], {
        toValue: 1,
        useNativeDriver: true,
        speed: 20,
        bounciness: 6,
      }),
    ]).start();
  };

  return (
    <View
      style={[
        styles.tabs,
        {
          height: 72 + insets.bottom,
          paddingBottom: Math.max(insets.bottom, 8),
        },
      ]}
    >
      {/* Frosted top border */}
      <View style={styles.topBorder} />

      {tabs.map((tab) => {
        const selected = active === tab.id;
        const isCenter = tab.id === 'quiz';
        const iconColor = selected
          ? isCenter
            ? colors.forest
            : colors.forest
          : colors.warmGray;

        return (
          <Pressable
            key={tab.id}
            style={styles.tabButton}
            onPress={() => handlePress(tab.id)}
            hitSlop={6}
          >
            {/* Center floating button */}
            {isCenter ? (
              <Animated.View
                style={[
                  styles.centerIcon,
                  selected && styles.centerIconActive,
                  { transform: [{ scale: scales[tab.id] }] },
                ]}
              >
                <MaterialCommunityIcons
                  name="lightning-bolt"
                  size={24}
                  color={selected ? colors.forest : colors.white}
                />
              </Animated.View>
            ) : (
              <>
                <Animated.View
                  style={[
                    styles.icon,
                    selected && styles.iconActive,
                    { transform: [{ scale: scales[tab.id] }] },
                  ]}
                >
                  <Feather name={tab.icon} size={20} color={iconColor} />
                </Animated.View>
                <Text
                  style={[
                    styles.label,
                    selected && styles.labelActive,
                  ]}
                >
                  {tab.label}
                </Text>
              </>
            )}

            {/* Center label under floating button */}
            {isCenter && (
              <Text style={[styles.label, selected && styles.labelActive, styles.centerLabel]}>
                {tab.label}
              </Text>
            )}
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
    paddingTop: 10,
    paddingHorizontal: 8,
    backgroundColor: colors.ivory,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-around',
    ...shadows.lg,
  },
  topBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: colors.lightGray,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
    paddingTop: 2,
  },
  icon: {
    width: 38,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconActive: {
    // backgroundColor: 'rgba(47,79,58,0.10)',
  },
  // ─── Center AI Stylist tab ─────────────────────────────────────────────────
  centerIcon: {
    width: 64,
    height: 64,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.forest,
    marginTop: -32,
    borderWidth: 3,
    borderColor: colors.ivory,
    ...shadows.md,
  },
  centerIconActive: {
    backgroundColor: colors.sand,
    borderColor: colors.ivory,
    shadowColor: colors.forest,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.38,
    shadowRadius: 18,
    elevation: 8,
  },
  centerLabel: {
    marginTop: 2,
  },
  // ─── Labels ───────────────────────────────────────────────────────────────
  label: {
    color: colors.warmGray,
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  labelActive: {
    color: colors.forest,
    fontWeight: '900',
  },
});
