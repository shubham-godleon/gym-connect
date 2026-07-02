import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { spacing, radius, ThemeColors, Typography } from '@/utils/theme';
import { useTheme, useThemedStyles } from '@/theme/ThemeContext';

const SplashScreen = () => {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  return (
    <View style={styles.container}>
      <View style={styles.logoCircle}>
        <Text style={styles.logoEmoji}>🏋️</Text>
      </View>
      <Text style={styles.title}>Gym Connect</Text>
      <ActivityIndicator size="large" color={colors.primary} style={styles.spinner} />
    </View>
  );
};

const createStyles = (colors: ThemeColors, typography: Typography) => StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: radius.full,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  logoEmoji: { fontSize: 34 },
  title: { ...typography.h1, marginBottom: spacing.lg },
  spinner: { marginTop: spacing.sm },
});

export default SplashScreen;
