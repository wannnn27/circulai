import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { onboarding } from '../data/appData';
import { layout } from '../styles/layout';
import { colors } from '../theme/colors';

export default function OnboardingScreen({ onDone }) {
  const [index, setIndex] = useState(0);
  const item = onboarding[index];
  const isLast = index === onboarding.length - 1;

  return (
    <View style={[layout.screen, styles.screen]}>
      <View style={styles.skipRow}>
        <Pressable onPress={onDone} hitSlop={12}>
          <Text style={styles.skipText}>Lewati</Text>
        </Pressable>
      </View>

      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <MaterialCommunityIcons name={item.icon} size={56} color={colors.forest} />
        </View>

        <View style={styles.dots}>
          {onboarding.map((entry, dotIndex) => (
            <View
              key={entry.title}
              style={[
                styles.dot,
                dotIndex === index ? styles.dotActive : styles.dotInactive
              ]}
            />
          ))}
        </View>

        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.desc}>{item.desc}</Text>
      </View>

      <Pressable
        style={({ pressed }) => [styles.button, pressed && styles.pressed]}
        onPress={() => (isLast ? onDone() : setIndex((current) => current + 1))}
      >
        <Text style={styles.buttonText}>{isLast ? 'Mulai Sekarang' : 'Lanjut'}  &gt;</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.ivory,
    paddingHorizontal: 24,
    paddingTop: 18,
    paddingBottom: 32,
    justifyContent: 'space-between'
  },
  skipRow: {
    width: '100%',
    alignItems: 'flex-end'
  },
  skipText: {
    color: colors.warmGray,
    fontSize: 14,
    fontWeight: '700'
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  iconCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.sand,
    marginBottom: 32
  },
  dots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 28
  },
  dot: {
    height: 8,
    borderRadius: 10
  },
  dotActive: {
    width: 24,
    backgroundColor: colors.forest
  },
  dotInactive: {
    width: 8,
    backgroundColor: colors.lightGray
  },
  title: {
    color: colors.charcoal,
    fontSize: 28,
    fontWeight: '800',
    lineHeight: 34,
    textAlign: 'center',
    marginBottom: 12
  },
  desc: {
    color: colors.warmGray,
    fontSize: 15,
    lineHeight: 22,
    maxWidth: 290,
    textAlign: 'center'
  },
  button: {
    width: '100%',
    minHeight: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.forest
  },
  buttonText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '800'
  },
  pressed: {
    opacity: 0.84
  }
});
