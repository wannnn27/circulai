import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

import LeafMark from '../components/LeafMark';
import { layout } from '../styles/layout';
import { colors } from '../theme/colors';

export default function SplashScreen({ onDone }) {
  const scaleAnim = useRef(new Animated.Value(0.6)).current;
  const opacityLogo = useRef(new Animated.Value(0)).current;
  const opacityTitle = useRef(new Animated.Value(0)).current;
  const opacityTagline = useRef(new Animated.Value(0)).current;
  const ringScale = useRef(new Animated.Value(0.7)).current;
  const ringOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Staggered reveal animation sequence
    Animated.sequence([
      // 1. Ring expands
      Animated.parallel([
        Animated.spring(ringScale, {
          toValue: 1,
          useNativeDriver: true,
          speed: 6,
          bounciness: 2,
        }),
        Animated.timing(ringOpacity, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }),
      ]),
      // 2. Logo pops in
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          speed: 8,
          bounciness: 6,
        }),
        Animated.timing(opacityLogo, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]),
      // 3. Title fades in
      Animated.timing(opacityTitle, {
        toValue: 1,
        duration: 280,
        useNativeDriver: true,
      }),
      // 4. Tagline fades in
      Animated.timing(opacityTagline, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto-dismiss after 2.4s
    const timer = setTimeout(onDone, 2400);
    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <View style={[layout.screen, styles.splash]}>
      {/* Background orbs */}
      <View style={styles.orbTopRight} />
      <View style={styles.orbBottomLeft} />

      {/* Animated ring */}
      <Animated.View
        style={[
          styles.ring,
          {
            transform: [{ scale: ringScale }],
            opacity: ringOpacity,
          },
        ]}
      />
      <Animated.View
        style={[
          styles.ringInner,
          {
            transform: [{ scale: ringScale }],
            opacity: Animated.multiply(ringOpacity, 0.6),
          },
        ]}
      />

      {/* Logo mark */}
      <Animated.View
        style={[
          styles.logoMark,
          {
            transform: [{ scale: scaleAnim }],
            opacity: opacityLogo,
          },
        ]}
      >
        <LeafMark color={colors.sand} size={52} />
      </Animated.View>

      {/* Brand name */}
      <Animated.Text style={[styles.title, { opacity: opacityTitle }]}>
        CIRCULAI
      </Animated.Text>

      {/* Tagline */}
      <Animated.Text style={[styles.tagline, { opacity: opacityTagline }]}>
        Your Style, Less Waste.
      </Animated.Text>

      {/* Bottom indicator dots */}
      <Animated.View style={[styles.dots, { opacity: opacityTagline }]}>
        <View style={[styles.dot, styles.dotActive]} />
        <View style={styles.dot} />
        <View style={styles.dot} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  splash: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.forest,
  },
  // ─── Background orbs ──────────────────────────────────────────────────────
  orbTopRight: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(232,220,200,0.06)',
    top: -80,
    right: -80,
  },
  orbBottomLeft: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(201,123,99,0.10)',
    bottom: -60,
    left: -60,
  },
  // ─── Rings ────────────────────────────────────────────────────────────────
  ring: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: 'rgba(232,220,200,0.16)',
    marginTop: -80,
  },
  ringInner: {
    position: 'absolute',
    width: 144,
    height: 144,
    borderRadius: 72,
    borderWidth: 1.5,
    borderColor: 'rgba(232,220,200,0.24)',
    marginTop: -80,
  },
  // ─── Logo ─────────────────────────────────────────────────────────────────
  logoMark: {
    width: 96,
    height: 96,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(232,220,200,0.13)',
    borderWidth: 1.5,
    borderColor: 'rgba(232,220,200,0.22)',
    marginBottom: 28,
  },
  // ─── Text ─────────────────────────────────────────────────────────────────
  title: {
    color: colors.ivory,
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: 5,
    marginBottom: 10,
  },
  tagline: {
    color: 'rgba(232,220,200,0.75)',
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 0.4,
  },
  // ─── Dots ─────────────────────────────────────────────────────────────────
  dots: {
    position: 'absolute',
    bottom: 52,
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 9999,
    backgroundColor: 'rgba(232,220,200,0.30)',
  },
  dotActive: {
    width: 18,
    backgroundColor: 'rgba(232,220,200,0.75)',
  },
});
