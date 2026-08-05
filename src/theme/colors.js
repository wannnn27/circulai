// ─── CIRCULAI Design Token System ───────────────────────────────────────────

// Primary palette — Forest green identity
export const colors = {
  // Core brand
  forest: '#2F4F3A',
  forestLight: '#3A6149',
  forestDark: '#1E3326',
  forestMid: '#4A7A5C',

  // Accent
  sand: '#E8DCC8',
  sandLight: '#F2EAD8',
  sandDark: '#D4C8B0',
  terracotta: '#C97B63',
  terracottaLight: '#D99078',

  // Neutrals
  ivory: '#FAF7F0',
  ivoryDark: '#F2EDE3',
  charcoal: '#1F2421',
  charcoalMid: '#3A3D38',
  warmGray: '#7A7A72',
  warmGrayLight: '#A8A89F',
  lightGray: '#E9E7E1',
  lightGrayDark: '#D8D6D0',
  white: '#FFFFFF',
  offWhite: '#FDFCF9',

  // Semantic
  success: '#4F8A5B',
  successLight: '#EBF5EE',
  warning: '#D99A3D',
  warningLight: '#FDF4E3',
  error: '#C94C4C',
  errorLight: '#FDEDED',
  info: '#4A7FA5',
  infoLight: '#EBF3FA',

  // Overlay
  overlay: 'rgba(31,36,33,0.48)',
  overlayLight: 'rgba(31,36,33,0.20)',
  overlayDark: 'rgba(31,36,33,0.70)',
};

// ─── Shadow System ────────────────────────────────────────────────────────────
export const shadows = {
  sm: {
    shadowColor: '#1A2420',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  md: {
    shadowColor: '#1A2420',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  lg: {
    shadowColor: '#1A2420',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.10,
    shadowRadius: 24,
    elevation: 6,
  },
  xl: {
    shadowColor: '#1A2420',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.14,
    shadowRadius: 40,
    elevation: 10,
  },
  // Colored shadow for primary CTA
  forest: {
    shadowColor: '#2F4F3A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.32,
    shadowRadius: 20,
    elevation: 8,
  },
};

// ─── Legacy alias for backward compatibility ──────────────────────────────────
export const cardShadow = shadows.md;

// ─── Border Radius Scale ──────────────────────────────────────────────────────
export const radius = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  '2xl': 28,
  '3xl': 36,
  full: 9999,
};

// ─── Color Semantic Aliases ───────────────────────────────────────────────────
export const palette = {
  primary: colors.forest,
  primaryLight: colors.forestLight,
  primaryDark: colors.forestDark,
  surface: colors.white,
  surfaceAlt: colors.ivory,
  surfaceSand: colors.sand,
  border: colors.lightGray,
  borderStrong: colors.lightGrayDark,
  text: colors.charcoal,
  textSecondary: colors.warmGray,
  textMuted: colors.warmGrayLight,
  textInverse: colors.white,
  accent: colors.terracotta,
};
