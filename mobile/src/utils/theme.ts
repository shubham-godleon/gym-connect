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

// Structured, industrial corners — sharp, not pill-shaped.
export const radius = {
  sm: 4,
  md: 6,
  lg: 8,
  full: 999, // reserved for circular avatars only
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

// Cast-metal look: defined border instead of diffused shadow.
export const makeShadow = (colors: ThemeColors) => ({
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 1,
  },
  button: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 3,
  },
});

export type Shadow = ReturnType<typeof makeShadow>;

// Legacy static exports (dark) — kept so any not-yet-themed usage still resolves.
// Prefer useTheme()/useThemedStyles for anything that should react to mode changes.
export const colors = darkColors;
export const typography = makeTypography(darkColors);
export const shadow = makeShadow(darkColors);
