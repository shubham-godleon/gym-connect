// Theme: "Fire & Steel" — dark, industrial, performance-driven, with a light variant.

// Dark palette (the original).
export const darkColors = {
  primary: '#FF6D1F', // Molten Orange — CTAs, active stats
  primaryDark: '#E85A0F',
  primaryLight: '#3A2A1C', // "tint" surface for orange-accented blocks
  highlight: '#FF9E1F', // Heatwave Amber — timers, secondary status
  danger: '#E02914', // Ember Red — warnings, destructive actions
  secondary: '#2B2B2F',
  background: '#1A1A1D', // Forge Charcoal
  surface: '#2B2B2F', // Cast Iron — cards/containers
  border: '#3A3A3E', // Steel border
  text: '#F5F5F7', // Slag White
  textSecondary: '#A0A0AB', // Ash Grey
  textMuted: '#6F6F76',
  success: '#3FBF7F',
  white: '#FFFFFF',
  onAccent: '#1A1A1D', // dark ink that reads on the bright orange fills (both modes)
  overlay: 'rgba(0,0,0,0.6)',
  dangerBg: '#3A1F1C',
  successBg: '#1C2E26',
  // Smoked-glass tokens
  glassFill: 'rgba(255,255,255,0.08)',   // faux-glass card surface (reads on flat + gradient)
  glassBorder: 'rgba(255,255,255,0.12)', // hairline translucent stroke
  glassHeavy: 'rgba(22,22,26,0.72)',     // base under real blur (navbar/headers)
  glow: 'rgba(255,109,31,0.16)',         // ambient orange glow (kept near the top)
  gradientA: '#201A16',                  // background gradient (top, faint warmth)
  gradientB: '#141416',                  // background gradient (bottom, neutral charcoal)
};

// Light palette — same keys, same orange accents on light steel.
export const lightColors: ThemeColors = {
  primary: '#FF6D1F',
  primaryDark: '#E85A0F',
  primaryLight: '#FFE9D9', // pale orange tint surface
  highlight: '#FF9E1F',
  danger: '#D8210F',
  secondary: '#EDEDF0',
  background: '#F5F5F7', // off-white
  surface: '#FFFFFF', // white cards
  border: '#E2E2E6',
  text: '#1A1A1D',
  textSecondary: '#5A5A63',
  textMuted: '#9A9AA2',
  success: '#2E9E63',
  white: '#FFFFFF',
  onAccent: '#1A1A1D',
  overlay: 'rgba(0,0,0,0.4)',
  dangerBg: '#FDE7E4',
  successBg: '#E4F5EC',
  glassFill: 'rgba(255,255,255,0.60)',
  glassBorder: 'rgba(0,0,0,0.06)',
  glassHeavy: 'rgba(247,247,251,0.72)',
  glow: 'rgba(255,109,31,0.18)',        // a touch stronger so the light side shows warmth too
  gradientA: '#FDEEE1',                 // warm cream at the top (mirrors dark)
  gradientB: '#F4F4F8',                 // cool near-white at the bottom
};

export type ThemeColors = typeof darkColors;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// Soft, glassy corners.
export const radius = {
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
  full: 999,
};

export const makeTypography = (colors: ThemeColors) => ({
  h1: { fontSize: 32, fontWeight: '800' as const, color: colors.text, letterSpacing: 0.5 },
  h2: { fontSize: 22, fontWeight: '700' as const, color: colors.text, letterSpacing: 0.3 },
  h3: { fontSize: 17, fontWeight: '700' as const, color: colors.text, letterSpacing: 0.2 },
  body: { fontSize: 15, fontWeight: '400' as const, color: colors.text },
  bodyBold: { fontSize: 15, fontWeight: '600' as const, color: colors.text },
  caption: { fontSize: 13, fontWeight: '400' as const, color: colors.textSecondary },
  label: { fontSize: 12, fontWeight: '700' as const, color: colors.textSecondary, letterSpacing: 0.5 },
  stat: { fontSize: 28, fontWeight: '800' as const, color: colors.text, letterSpacing: 0.5 },
});

export type Typography = ReturnType<typeof makeTypography>;

// Smoked glass: soft ambient shadow + hairline translucent stroke (no hard border).
export const makeShadow = (colors: ThemeColors) => ({
  card: {
    borderWidth: 1,
    borderColor: colors.glassBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 2,
  },
  button: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 8,
    elevation: 3,
  },
});

export type Shadow = ReturnType<typeof makeShadow>;

// Legacy static exports (dark) — kept so any not-yet-themed usage still resolves.
// Prefer useTheme()/useThemedStyles for anything that should react to mode changes.
export const colors = darkColors;
export const typography = makeTypography(darkColors);
export const shadow = makeShadow(darkColors);
