// Theme: "Fire & Steel" — dark, industrial, performance-driven.
export const colors = {
  primary: '#FF6D1F', // Molten Orange — CTAs, active stats
  primaryDark: '#E85A0F',
  primaryLight: '#3A2A1C', // dark-mode "tint" surface for orange-accented blocks
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
  overlay: 'rgba(0,0,0,0.6)',
  dangerBg: '#3A1F1C',
  successBg: '#1C2E26',
};

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

export const typography = {
  h1: { fontSize: 32, fontWeight: '800' as const, color: colors.text, letterSpacing: 0.5 },
  h2: { fontSize: 22, fontWeight: '700' as const, color: colors.text, letterSpacing: 0.3 },
  h3: { fontSize: 17, fontWeight: '700' as const, color: colors.text, letterSpacing: 0.2 },
  body: { fontSize: 15, fontWeight: '400' as const, color: colors.text },
  bodyBold: { fontSize: 15, fontWeight: '600' as const, color: colors.text },
  caption: { fontSize: 13, fontWeight: '400' as const, color: colors.textSecondary },
  label: { fontSize: 12, fontWeight: '700' as const, color: colors.textSecondary, letterSpacing: 0.5 },
  stat: { fontSize: 28, fontWeight: '800' as const, color: colors.text, letterSpacing: 0.5 },
};

// Cast-metal look: defined border instead of diffused shadow.
export const shadow = {
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
};
