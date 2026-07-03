import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { refreshUser } from '@/store/slices/authSlice';
import { supabaseService } from '@/services/supabaseService';
import apiService from '@/services/apiService';
import ProfileFields, { ProfileFieldsValue } from '@/components/ProfileFields';
import ScreenBackground from '@/components/ScreenBackground';
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
  const [username, setUsername] = useState(user?.username || '');
  const [password, setPassword] = useState('');
  const [fields, setFields] = useState<ProfileFieldsValue>({
    displayName: user?.username || user?.displayName || '',
    photoUri: user?.photoUrl,
    workoutLocation: user?.workoutLocation ?? 'GYM',
    preferredWorkoutTime: user?.preferredWorkoutTime,
    weeklyGoal: user?.weeklyGoal ?? 3,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFieldsChange = (value: ProfileFieldsValue) => {
    setFields(value);
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

      const uname = username.trim().toLowerCase();
      await apiService.updateUserProfile(user.id, {
        username: uname, // display name stays distinct — profile shows both
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
    <ScreenBackground plain>
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <Text style={styles.label}>Username</Text>
        <TextInput
          style={styles.input}
          value={username}
          onChangeText={(t) => setUsername(t.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
          placeholder="username"
          placeholderTextColor={colors.textMuted}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <Text style={styles.hint}>Lowercase letters, numbers, underscore — this is how friends find you.</Text>

        <Text style={styles.label}>New password (leave blank to keep current)</Text>
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          placeholder="••••••••"
          placeholderTextColor={colors.textMuted}
          secureTextEntry
        />

        <ProfileFields value={{ ...fields, displayName: username }} onChange={handleFieldsChange} />

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
    </ScreenBackground>
  );
};

const createStyles = (colors: ThemeColors, typography: Typography, shadow: Shadow) => StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  content: { padding: spacing.lg },
  themeRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  themeChip: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.glassFill,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    alignItems: 'center',
  },
  themeChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  themeChipText: { ...typography.caption, fontWeight: '600' },
  themeChipTextActive: { color: colors.white },
  card: {
    backgroundColor: colors.glassFill,
    borderRadius: radius.lg,
    padding: spacing.lg,
    ...shadow.card,
  },
  label: { ...typography.label, marginBottom: spacing.xs },
  hint: { ...typography.caption, color: colors.textMuted, marginTop: -spacing.xs, marginBottom: spacing.md },
  input: {
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderRadius: radius.sm,
    padding: 14,
    marginBottom: spacing.md,
    fontSize: 16,
    backgroundColor: colors.glassFill,
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
