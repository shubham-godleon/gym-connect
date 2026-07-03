import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { refreshUser } from '@/store/slices/authSlice';
import { supabaseService } from '@/services/supabaseService';
import apiService from '@/services/apiService';
import ProfileFields, { ProfileFieldsValue } from '@/components/ProfileFields';
import ScreenBackground from '@/components/ScreenBackground';
import Avatar from '@/components/Avatar';
import Icon, { IconName } from '@/components/Icon';
import { pickAvatar } from '@/utils/photo';
import { spacing, radius, ThemeColors, Typography, Shadow } from '@/utils/theme';
import { useTheme, useThemedStyles, ThemeMode } from '@/theme/ThemeContext';

const THEME_OPTIONS: { value: ThemeMode; label: string; icon: IconName }[] = [
  { value: 'light', label: 'Light', icon: 'white-balance-sunny' },
  { value: 'dark', label: 'Dark', icon: 'moon-waning-crescent' },
  { value: 'system', label: 'System', icon: 'cellphone' },
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

  const changePhoto = async () => {
    const picked = await pickAvatar();
    if (picked) setFields((f) => ({ ...f, photoUri: picked.uri, photoBase64: picked.base64 }));
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
        username: uname,
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

  const SectionHeader = ({ icon, title }: { icon: IconName; title: string }) => (
    <View style={styles.sectionHeader}>
      <Icon name={icon} size={16} color={colors.primary} />
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );

  return (
    <ScreenBackground plain>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* Photo hero */}
        <View style={styles.hero}>
          <TouchableOpacity onPress={changePhoto} activeOpacity={0.85}>
            <Avatar displayName={username} photoUrl={fields.photoUri} size={104} />
            <View style={styles.cameraBadge}>
              <Icon name="camera" size={16} color={colors.white} />
            </View>
          </TouchableOpacity>
          <Text style={styles.heroHandle}>@{username || 'username'}</Text>
        </View>

        {/* Account */}
        <SectionHeader icon="account-circle-outline" title="Account" />
        <View style={styles.card}>
          <Text style={styles.label}>Username</Text>
          <View style={styles.inputRow}>
            <Text style={styles.inputPrefix}>@</Text>
            <TextInput
              style={styles.inputFlex}
              value={username}
              onChangeText={(t) => setUsername(t.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
              placeholder="username"
              placeholderTextColor={colors.textMuted}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
          <Text style={styles.hint}>Lowercase letters, numbers, underscore — how friends find you.</Text>

          <View style={styles.divider} />

          <Text style={styles.label}>New password</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Leave blank to keep current"
            placeholderTextColor={colors.textMuted}
            secureTextEntry
          />
        </View>

        {/* Training */}
        <SectionHeader icon="dumbbell" title="Training" />
        <View style={styles.card}>
          <ProfileFields value={{ ...fields, displayName: username }} onChange={setFields} hidePhoto />
        </View>

        {/* Appearance */}
        <SectionHeader icon="palette-outline" title="Appearance" />
        <View style={styles.card}>
          <View style={styles.themeRow}>
            {THEME_OPTIONS.map((opt) => {
              const active = mode === opt.value;
              return (
                <TouchableOpacity
                  key={opt.value}
                  style={[styles.themeChip, active && styles.themeChipActive]}
                  onPress={() => setMode(opt.value)}
                  activeOpacity={0.8}
                >
                  <Icon name={opt.icon} size={18} color={active ? colors.white : colors.text} />
                  <Text style={[styles.themeChipText, active && styles.themeChipTextActive]}>{opt.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {error && <Text style={styles.error}>{error}</Text>}

        <TouchableOpacity style={styles.button} onPress={handleSave} disabled={isSaving} activeOpacity={0.85}>
          {isSaving ? <ActivityIndicator color={colors.white} /> : <Text style={styles.buttonText}>Save Changes</Text>}
        </TouchableOpacity>
      </ScrollView>
    </ScreenBackground>
  );
};

const createStyles = (colors: ThemeColors, typography: Typography, shadow: Shadow) => StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  hero: { alignItems: 'center', marginBottom: spacing.lg },
  cameraBadge: {
    position: 'absolute', bottom: 0, right: 0,
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: colors.background,
  },
  heroHandle: { ...typography.bodyBold, color: colors.primary, marginTop: spacing.sm },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginTop: spacing.lg, marginBottom: spacing.sm, marginLeft: spacing.xs },
  sectionTitle: { ...typography.label, color: colors.textSecondary },
  card: {
    backgroundColor: colors.glassFill,
    borderRadius: radius.lg,
    padding: spacing.lg,
    ...shadow.card,
  },
  label: { ...typography.label, marginBottom: spacing.sm, color: colors.text },
  hint: { ...typography.caption, color: colors.textMuted, marginTop: spacing.xs },
  divider: { height: 1, backgroundColor: colors.glassBorder, marginVertical: spacing.lg },
  input: {
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderRadius: radius.sm,
    padding: 14,
    fontSize: 16,
    backgroundColor: colors.background,
    color: colors.text,
  },
  inputRow: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: colors.glassBorder, borderRadius: radius.sm,
    paddingHorizontal: 14, backgroundColor: colors.background,
  },
  inputPrefix: { fontSize: 16, fontWeight: '700', color: colors.textMuted, marginRight: 2 },
  inputFlex: { flex: 1, paddingVertical: 14, fontSize: 16, color: colors.text },
  themeRow: { flexDirection: 'row', gap: spacing.sm },
  themeChip: {
    flex: 1, flexDirection: 'row', gap: spacing.xs, justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    alignItems: 'center',
  },
  themeChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  themeChipText: { ...typography.caption, fontWeight: '700' },
  themeChipTextActive: { color: colors.white },
  error: { color: colors.danger, marginTop: spacing.md, textAlign: 'center' },
  button: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    padding: 16,
    alignItems: 'center',
    marginTop: spacing.xl,
    ...shadow.button,
  },
  buttonText: { color: colors.white, fontSize: 16, fontWeight: '700' },
});

export default EditProfileScreen;
