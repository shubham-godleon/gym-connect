import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/theme/ThemeContext';

// Full-screen backdrop. By default it's the smoked-glass gradient (subtle vertical
// gradient + soft orange glow up top). Pass `plain` for a flat solid background
// (used on everything except Home and Me).
const ScreenBackground = ({ children, plain }: { children: React.ReactNode; plain?: boolean }) => {
  const { colors } = useTheme();
  if (plain) {
    return <View style={[styles.root, { backgroundColor: colors.background }]}>{children}</View>;
  }
  return (
    <View style={styles.root}>
      <LinearGradient colors={[colors.gradientA, colors.gradientB]} style={StyleSheet.absoluteFill} />
      <LinearGradient
        colors={[colors.glow, 'transparent']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.glow}
      />
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  // Soft glow confined to the top so it doesn't bleed down the screen.
  glow: { position: 'absolute', top: 0, left: 0, right: 0, height: 190 },
});

export default ScreenBackground;
