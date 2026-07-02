import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { refreshUser } from '@/store/slices/authSlice';
import { supabaseService } from '@/services/supabaseService';
import apiService from '@/services/apiService';
import ProfileFields, { ProfileFieldsValue } from '@/components/ProfileFields';
import { spacing, radius, ThemeColors, Typography, Shadow } from '@/utils/theme';
import { useTheme, useThemedStyles, ThemeMode } from '@/theme/ThemeContext';

const THEME_OPTIONS: { value: ThemeMode; label: string }[] = [
  { value: 'light', label: '☀️ Light' },
  { value: 'dark', label: '🌙 Dark' },
  { value: 'system', label: '📱 System' },
];

const EditProfileScreen = () => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation<any>();
  const { colors, mode, setMode } = useTheme();
  const styles = useThemedStyles(createStyles);
  const user = useAppSelector((state) => state.auth.user);
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [password, setPassword] = useState('');
  const [fields, setFields] = useState<ProfileFieldsValue>({
    displayName: user?.displayName || '',
    photoUri: user?.photoUrl,
    workoutLocation: user?.workoutLocation ?? 'GYM',
    preferredWorkoutTime: user?.preferredWorkoutTime,
    weeklyGoal: user?.weeklyGoal ?? 3,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFieldsChange = (value: ProfileFieldsValue) => {
    setFields(value);
    setDisplayName((d) => value.displayName || d);
  };

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    setError(null);
    try {
      if (password.trim()) {
        await supabaseService.updatePassword(password.trim());
      }

      let photoUrl = user.photoUrl;
      if (fields.photoBase64) {
        photoUrl = await supabaseService.uploadAvatar(fields.photoBase64);
      }

      await apiService.updateUserProfile(user.id, {
        displayName,
        photoUrl,
        workoutLocation: fields.workoutLocation,
        preferredWorkoutTime: fields.preferredWorkoutTime,
        weeklyGoal: fields.weeklyGoal,
      });
      dispatch(refreshUser(user.id));
      navigation.goBack();
    } catch (e: any) {
      setError(e.message || 'Could not save your profile');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <Text style={styles.label}>Username</Text>
        <TextInput
          style={styles.input}
          value={displayName}
          onChangeText={setDisplayName}
          placeholderTextColor={colors.textMuted}
        />

        <Text style={styles.label}>New password (leave blank to keep current)</Text>
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          placeholder="••••••••"
          placeholderTextColor={colors.textMuted}
          secureTextEntry
        />

        <ProfileFields value={{ ...fields, displayName }} onChange={handleFieldsChange} />

        <Text style={styles.label}>Appearance</Text>
        <View style={styles.themeRow}>
          {THEME_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.value}
              style={[styles.themeChip, mode === opt.value && styles.themeChipActive]}
              onPress={() => setMode(opt.value)}
              activeOpacity={0.8}
            >
              <Text style={[styles.themeChipText, mode === opt.value && styles.themeChipTextActive]}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {error && <Text style={styles.error}>{error}</Text>}
      </View>

      <TouchableOpacity style={styles.button} onPress={handleSave} disabled={isSaving} activeOpacity={0.85}>
        {isSaving ? <ActivityIndicator color={colors.white} /> : <Text style={styles.buttonText}>Save Changes</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
};

const createStyles = (colors: ThemeColors, typography: Typography, shadow: Shadow) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg },
  themeRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  themeChip: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  themeChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  themeChipText: { ...typography.caption, fontWeight: '600' },
  themeChipTextActive: { color: colors.white },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    ...shadow.card,
  },
  label: { ...typography.label, marginBottom: spacing.xs },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    padding: 14,
    marginBottom: spacing.md,
    fontSize: 16,
    backgroundColor: colors.background,
    color: colors.text,
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

export default EditProfileScreen;
