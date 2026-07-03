import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import Icon from '@/components/Icon';
import ScreenBackground from '@/components/ScreenBackground';
import { spacing, radius, ThemeColors, Typography } from '@/utils/theme';
import { useTheme, useThemedStyles } from '@/theme/ThemeContext';

const SplashScreen = () => {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  return (
    <ScreenBackground plain>
      <View style={styles.container}>
        <View style={styles.logoCircle}>
          <Icon name="dumbbell" size={34} color={colors.primary} />
        </View>
        <Text style={styles.title}>Gym Connect</Text>
        <ActivityIndicator size="large" color={colors.primary} style={styles.spinner} />
      </View>
    </ScreenBackground>
  );
};

const createStyles = (colors: ThemeColors, typography: Typography) => StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'transparent' },
  logoCircle: {
    width: 84,
    height: 84,
    borderRadius: radius.full,
    backgroundColor: colors.glassFill,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  title: { ...typography.h1, marginBottom: spacing.lg },
  spinner: { marginTop: spacing.sm },
});

export default SplashScreen;
