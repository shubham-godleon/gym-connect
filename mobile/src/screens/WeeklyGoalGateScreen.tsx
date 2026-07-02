import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { refreshUser } from '@/store/slices/authSlice';
import apiService from '@/services/apiService';
import { spacing, radius, ThemeColors, Typography, Shadow } from '@/utils/theme';
import { useTheme, useThemedStyles } from '@/theme/ThemeContext';

const GOAL_OPTIONS = [1, 2, 3, 4, 5, 6, 7];

// Shown to accounts that predate weekly goals (weeklyGoal == null). Blocks the app
// until a goal is chosen — there is no skip.
const WeeklyGoalGateScreen = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const [goal, setGoal] = useState(3);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    if (!user) return;
    setIsSaving(true);
    setError(null);
    try {
      await apiService.updateUserProfile(user.id, { weeklyGoal: goal });
      dispatch(refreshUser(user.id));
    } catch (e: any) {
      setError(e.message || 'Could not save your goal');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Set your weekly goal</Text>
      <Text style={styles.subtitle}>
        How many days a week do you want to train? Your streak grows every week you hit it.
      </Text>

      <View style={styles.card}>
        <View style={styles.row}>
          {GOAL_OPTIONS.map((n) => (
            <TouchableOpacity
              key={n}
              style={[styles.chip, goal === n && styles.chipActive]}
              onPress={() => setGoal(n)}
            >
              <Text style={[styles.chipText, goal === n && styles.chipTextActive]}>{n}x</Text>
            </TouchableOpacity>
          ))}
        </View>
        {error && <Text style={styles.error}>{error}</Text>}
      </View>

      <TouchableOpacity style={styles.button} onPress={handleConfirm} disabled={isSaving} activeOpacity={0.85}>
        {isSaving ? <ActivityIndicator color={colors.white} /> : <Text style={styles.buttonText}>Confirm</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
};

const createStyles = (colors: ThemeColors, typography: Typography, shadow: Shadow) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, flexGrow: 1, justifyContent: 'center' },
  title: { ...typography.h1, fontSize: 24, marginBottom: spacing.xs },
  subtitle: { ...typography.body, color: colors.textSecondary, marginBottom: spacing.lg },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    ...shadow.card,
  },
  row: { flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.sm,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { ...typography.caption, fontWeight: '600' },
  chipTextActive: { color: colors.white },
  error: { color: colors.danger, marginTop: spacing.md, textAlign: 'center' },
  button: {
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
    padding: 16,
    alignItems: 'center',
    marginTop: spacing.lg,
    ...shadow.button,
  },
  buttonText: { color: colors.white, fontSize: 16, fontWeight: '700' },
});

export default WeeklyGoalGateScreen;
