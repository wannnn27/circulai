// ─── CIRCULAI Typography System ──────────────────────────────────────────────
// Uses system fonts with professional weight hierarchy
// Platform-appropriate: San Francisco (iOS), Roboto (Android)

import { Platform } from 'react-native';

// ─── Font Family Stack ────────────────────────────────────────────────────────
export const fontFamily = {
  sans: Platform.select({
    ios: 'System',
    android: 'Roboto',
    default: 'System',
  }),
};

// ─── Font Size Scale ──────────────────────────────────────────────────────────
export const fontSize = {
  '2xs': 9,
  xs: 10,
  sm: 11,
  base: 13,
  md: 14,
  lg: 16,
  xl: 18,
  '2xl': 21,
  '3xl': 24,
  '4xl': 28,
  '5xl': 32,
  '6xl': 38,
};

// ─── Font Weight ──────────────────────────────────────────────────────────────
export const fontWeight = {
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
  black: '900',
};

// ─── Line Height ──────────────────────────────────────────────────────────────
export const lineHeight = {
  tight: 1.2,  // headings
  snug: 1.35,
  normal: 1.5, // body
  relaxed: 1.65,
};

// ─── Letter Spacing ──────────────────────────────────────────────────────────
export const letterSpacing = {
  tighter: -0.5,
  tight: -0.25,
  normal: 0,
  wide: 0.5,
  wider: 1.0,
  widest: 1.5,
};

// ─── Pre-composed Text Styles ─────────────────────────────────────────────────
export const text = {
  // Display
  displayLarge: {
    fontSize: fontSize['5xl'],
    fontWeight: fontWeight.black,
    lineHeight: fontSize['5xl'] * lineHeight.tight,
    letterSpacing: letterSpacing.tight,
  },
  displayMedium: {
    fontSize: fontSize['4xl'],
    fontWeight: fontWeight.black,
    lineHeight: fontSize['4xl'] * lineHeight.tight,
    letterSpacing: letterSpacing.tight,
  },
  // Headings
  h1: {
    fontSize: fontSize['3xl'],
    fontWeight: fontWeight.black,
    lineHeight: fontSize['3xl'] * lineHeight.tight,
  },
  h2: {
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.extrabold,
    lineHeight: fontSize['2xl'] * lineHeight.snug,
  },
  h3: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.extrabold,
    lineHeight: fontSize.xl * lineHeight.snug,
  },
  h4: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    lineHeight: fontSize.lg * lineHeight.snug,
  },
  // Body
  bodyLarge: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.normal,
    lineHeight: fontSize.md * lineHeight.normal,
  },
  body: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.normal,
    lineHeight: fontSize.base * lineHeight.normal,
  },
  bodySmall: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.normal,
    lineHeight: fontSize.sm * lineHeight.normal,
  },
  // Labels & UI
  labelLarge: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    lineHeight: fontSize.md * lineHeight.snug,
  },
  label: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    lineHeight: fontSize.base * lineHeight.snug,
  },
  labelSmall: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    lineHeight: fontSize.sm * lineHeight.snug,
  },
  // Special
  kicker: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.black,
    letterSpacing: letterSpacing.wider,
    textTransform: 'uppercase',
  },
  caption: {
    fontSize: fontSize['2xs'],
    fontWeight: fontWeight.medium,
    lineHeight: fontSize['2xs'] * lineHeight.normal,
  },
  price: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.black,
  },
  priceLarge: {
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.black,
  },
  // Button
  buttonLarge: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.extrabold,
    lineHeight: fontSize.md * lineHeight.snug,
  },
  button: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.extrabold,
    lineHeight: fontSize.base * lineHeight.snug,
  },
  buttonSmall: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    lineHeight: fontSize.sm * lineHeight.snug,
  },
};
