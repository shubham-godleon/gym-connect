import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  darkColors,
  lightColors,
  makeShadow,
  makeTypography,
  ThemeColors,
  Typography,
  Shadow,
} from '@/utils/theme';

export type ThemeMode = 'light' | 'dark' | 'system';

const STORAGE_KEY = 'themeMode';

interface ThemeContextValue {
  colors: ThemeColors;
  typography: Typography;
  shadow: Shadow;
  mode: ThemeMode; // the user's choice (may be 'system')
  isDark: boolean; // the resolved scheme actually in effect
  setMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const systemScheme = useColorScheme(); // 'light' | 'dark' | null
  const [mode, setModeState] = useState<ThemeMode>('system');

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
      if (stored === 'light' || stored === 'dark' || stored === 'system') {
        setModeState(stored);
      }
    });
  }, []);

  const setMode = useCallback((next: ThemeMode) => {
    setModeState(next);
    AsyncStorage.setItem(STORAGE_KEY, next).catch(() => {});
  }, []);

  const isDark = mode === 'system' ? systemScheme !== 'light' : mode === 'dark';

  const value = useMemo<ThemeContextValue>(() => {
    const colors = isDark ? darkColors : lightColors;
    return {
      colors,
      typography: makeTypography(colors),
      shadow: makeShadow(colors),
      mode,
      isDark,
      setMode,
    };
  }, [isDark, mode, setMode]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): ThemeContextValue => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider');
  return ctx;
};

// Convenience for style factories: pass a function that builds a StyleSheet from
// the active palette; the result is memoized and rebuilt when the theme changes.
export function useThemedStyles<T>(factory: (colors: ThemeColors, typography: Typography, shadow: Shadow) => T): T {
  const { colors, typography, shadow } = useTheme();
  return useMemo(() => factory(colors, typography, shadow), [factory, colors, typography, shadow]);
}
