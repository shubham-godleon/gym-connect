import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { clearNeedsProfileSetup, refreshUser } from '@/store/slices/authSlice';
import { supabaseService } from '@/services/supabaseService';
import apiService from '@/services/apiService';
import ProfileFields, { ProfileFieldsValue } from '@/components/ProfileFields';
import { spacing, radius, ThemeColors, Typography, Shadow } from '@/utils/theme';
import { useTheme, useThemedStyles } from '@/theme/ThemeContext';

const ProfileSetupScreen = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const [value, setValue] = useState<ProfileFieldsValue>({
    displayName: user?.displayName || '',
    workoutLocation: 'GYM',
    weeklyGoal: 3,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const finish = () => dispatch(clearNeedsProfileSetup());

  const handleContinue = async () => {
    if (!user) return finish();
    setIsSaving(true);
    setError(null);
    try {
      let photoUrl: string | undefined;
      if (value.photoBase64) {
        photoUrl = await supabaseService.uploadAvatar(value.photoBase64);
      }
      await apiService.updateUserProfile(user.id, {
        photoUrl,
        workoutLocation: value.workoutLocation,
        preferredWorkoutTime: value.preferredWorkoutTime,
        weeklyGoal: value.weeklyGoal,
      });
      dispatch(refreshUser(user.id));
      finish();
    } catch (e: any) {
      setError(e.message || 'Could not save your profile');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Set up your profile</Text>
      <Text style={styles.subtitle}>Set your weekly goal to get started — you can change it later.</Text>

      <View style={styles.card}>
        <ProfileFields value={value} onChange={setValue} />
        {error && <Text style={styles.error}>{error}</Text>}
      </View>

      <TouchableOpacity style={styles.button} onPress={handleContinue} disabled={isSaving} activeOpacity={0.85}>
        {isSaving ? <ActivityIndicator color={colors.white} /> : <Text style={styles.buttonText}>Continue</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
};

const createStyles = (colors: ThemeColors, typography: Typography, shadow: Shadow) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg },
  title: { ...typography.h1, fontSize: 24, marginBottom: spacing.xs, marginTop: spacing.lg },
  subtitle: { ...typography.body, color: colors.textSecondary, marginBottom: spacing.lg },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    ...shadow.card,
  },
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

export default ProfileSetupScreen;
