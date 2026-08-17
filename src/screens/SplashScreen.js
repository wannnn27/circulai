import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Image,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const { width, height } = Dimensions.get('window');

const LOGO = require('../../assets/images/logo_app.png');

export default function SplashScreen({ onDone }) {
  // Logo
  const logoScale  = useRef(new Animated.Value(0.7)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;

  // Tagline & dots
  const textOpacity = useRef(new Animated.Value(0)).current;

  // Decorative leaves
  const leafL1 = useRef(new Animated.Value(0)).current;
  const leafL2 = useRef(new Animated.Value(0)).current;
  const leafR1 = useRef(new Animated.Value(0)).current;
  const leafR2 = useRef(new Animated.Value(0)).current;

  // Animated dots (3 dots pulsing in sequence)
  const dot1 = useRef(new Animated.Value(0.3)).current;
  const dot2 = useRef(new Animated.Value(0.3)).current;
  const dot3 = useRef(new Animated.Value(0.3)).current;
  const dot4 = useRef(new Animated.Value(0.1)).current;

  // Wave Y position (slides up)
  const waveY = useRef(new Animated.Value(60)).current;

  useEffect(() => {
    // ─── 1. Wave slides up
    Animated.timing(waveY, {
      toValue: 0,
      duration: 700,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();

    // ─── 2. Logo pop in
    Animated.sequence([
      Animated.delay(200),
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          useNativeDriver: true,
          speed: 7,
          bounciness: 8,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // ─── 3. Leaves float in
    const leafAnim = (anim, delay) =>
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(anim, {
          toValue: 1,
          duration: 500,
          easing: Easing.out(Easing.back(1.2)),
          useNativeDriver: true,
        }),
      ]);

    Animated.parallel([
      leafAnim(leafL1, 350),
      leafAnim(leafR2, 450),
      leafAnim(leafL2, 600),
      leafAnim(leafR1, 700),
    ]).start();

    // ─── 4. Text fade in
    Animated.sequence([
      Animated.delay(750),
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();

    // ─── 5. Dots pulse loop
    const pulseDot = (anim, delay) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, {
            toValue: 1,
            duration: 350,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0.3,
            duration: 350,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.delay(700),
        ])
      );

    const d1 = pulseDot(dot1, 900);
    const d2 = pulseDot(dot2, 1100);
    const d3 = pulseDot(dot3, 1300);
    const d4 = pulseDot(dot4, 1500);
    d1.start(); d2.start(); d3.start(); d4.start();

    // ─── Auto-dismiss
    const timer = setTimeout(onDone, 2800);
    return () => {
      clearTimeout(timer);
      d1.stop(); d2.stop(); d3.stop(); d4.stop();
    };
  }, [onDone]);

  return (
    <View style={styles.container}>
      {/* ── Decorative ring (light circle behind logo) ── */}
      <View style={styles.ringOuter} />
      <View style={styles.ringInner} />

      {/* ── Floating leaves ── */}
      <Animated.View
        style={[
          styles.leaf,
          styles.leafL1,
          {
            opacity: leafL1,
            transform: [
              { translateY: Animated.multiply(leafL1, -1).interpolate({ inputRange: [-1, 0], outputRange: [20, 0] }) },
              { rotate: '-30deg' },
            ],
          },
        ]}
      >
        <LeafSVG size={36} color="#A0C878" opacity={0.85} />
      </Animated.View>

      <Animated.View
        style={[
          styles.leaf,
          styles.leafL2,
          {
            opacity: leafL2,
            transform: [
              { translateY: Animated.multiply(leafL2, -1).interpolate({ inputRange: [-1, 0], outputRange: [20, 0] }) },
              { rotate: '-15deg' },
            ],
          },
        ]}
      >
        <LeafSVG size={24} color="#2C6842" opacity={0.65} />
      </Animated.View>

      <Animated.View
        style={[
          styles.leaf,
          styles.leafR1,
          {
            opacity: leafR1,
            transform: [
              { translateY: Animated.multiply(leafR1, -1).interpolate({ inputRange: [-1, 0], outputRange: [20, 0] }) },
              { rotate: '20deg' },
            ],
          },
        ]}
      >
        <LeafSVG size={28} color="#2C6842" opacity={0.7} />
      </Animated.View>

      <Animated.View
        style={[
          styles.leaf,
          styles.leafR2,
          {
            opacity: leafR2,
            transform: [
              { translateY: Animated.multiply(leafR2, -1).interpolate({ inputRange: [-1, 0], outputRange: [20, 0] }) },
              { rotate: '40deg' },
            ],
          },
        ]}
      >
        <LeafSVG size={40} color="#A0C878" opacity={0.8} />
      </Animated.View>

      {/* ── Logo image ── */}
      <Animated.Image
        source={LOGO}
        style={[
          styles.logo,
          {
            opacity: logoOpacity,
            transform: [{ scale: logoScale }],
          },
        ]}
        resizeMode="contain"
      />

      {/* ── Loading dots + tagline ── */}
      <Animated.View style={[styles.bottomContent, { opacity: textOpacity }]}>
        <View style={styles.dotsRow}>
          <Animated.View style={[styles.dot, styles.dotActive, { opacity: dot1 }]} />
          <Animated.View style={[styles.dot, styles.dotMid,  { opacity: dot2 }]} />
          <Animated.View style={[styles.dot, styles.dotMid,  { opacity: dot3 }]} />
          <Animated.View style={[styles.dot, { opacity: dot4 }]} />
        </View>
        <Text style={styles.loadingText}>Memuat pengalaman terbaik...</Text>
      </Animated.View>

      {/* ── Wave bottom ── */}
      <Animated.View
        style={[styles.waveContainer, { transform: [{ translateY: waveY }] }]}
        pointerEvents="none"
      >
        <View style={styles.waveGreen} />
        <View style={styles.waveBlue} />
      </Animated.View>
    </View>
  );
}

// ─── Leaf SVG (simple leaf shape drawn with border-radius) ────────────────────
function LeafSVG({ size, color, opacity }) {
  return (
    <View
      style={{
        width: size,
        height: size * 1.3,
        backgroundColor: color,
        borderTopLeftRadius: size * 0.9,
        borderTopRightRadius: size * 0.1,
        borderBottomLeftRadius: size * 0.1,
        borderBottomRightRadius: size * 0.9,
        opacity,
        transform: [{ rotate: '45deg' }],
      }}
    />
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFBF6',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Decorative rings ──────────────────────────────────────────────────────
  ringOuter: {
    position: 'absolute',
    width: width * 0.72,
    height: width * 0.72,
    borderRadius: width * 0.36,
    borderWidth: 1,
    borderColor: 'rgba(160,200,120,0.18)',
    borderStyle: 'dashed',
  },
  ringInner: {
    position: 'absolute',
    width: width * 0.52,
    height: width * 0.52,
    borderRadius: width * 0.26,
    borderWidth: 1,
    borderColor: 'rgba(160,200,120,0.12)',
    borderStyle: 'dashed',
  },

  // ── Logo ──────────────────────────────────────────────────────────────────
  logo: {
    width: width * 0.58,
    height: width * 0.58,
    marginBottom: 16,
  },

  // ── Leaves ────────────────────────────────────────────────────────────────
  leaf: {
    position: 'absolute',
  },
  leafL1: { left: width * 0.06, top: height * 0.28 },
  leafL2: { left: width * 0.10, top: height * 0.44 },
  leafR1: { right: width * 0.08, top: height * 0.38 },
  leafR2: { right: width * 0.04, top: height * 0.22 },

  // ── Bottom content ────────────────────────────────────────────────────────
  bottomContent: {
    alignItems: 'center',
    gap: 10,
    marginBottom: 32,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 7,
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 9999,
    backgroundColor: 'rgba(160,200,120,0.4)',
  },
  dotActive: {
    width: 10,
    height: 10,
    backgroundColor: '#2C6842',
  },
  dotMid: {
    backgroundColor: '#A0C878',
  },
  loadingText: {
    fontSize: 13,
    color: '#6A7D87',
    fontWeight: '400',
    letterSpacing: 0.2,
  },

  // ── Wave ──────────────────────────────────────────────────────────────────
  waveContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: height * 0.18,
  },
  waveGreen: {
    position: 'absolute',
    bottom: 0,
    left: -width * 0.1,
    right: -width * 0.1,
    height: '75%',
    backgroundColor: '#A0C878',
    borderTopLeftRadius: width * 0.7,
    borderTopRightRadius: width * 0.5,
    opacity: 0.55,
  },
  waveBlue: {
    position: 'absolute',
    bottom: 0,
    left: -width * 0.05,
    right: -width * 0.2,
    height: '55%',
    backgroundColor: '#27667B',
    borderTopLeftRadius: width * 0.6,
    borderTopRightRadius: width * 0.8,
    opacity: 0.45,
  },
});
