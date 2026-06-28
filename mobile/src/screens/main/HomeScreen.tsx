import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { createCheckin } from '@/store/slices/checkinSlice';
import { signOut } from '@/store/slices/authSlice';
import { colors, spacing, radius, typography, shadow } from '@/utils/theme';

const HomeScreen = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const { isLoading } = useAppSelector((state) => state.checkin);
  const [gymName, setGymName] = useState(user?.homeGymName || '');
  const [note, setNote] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleCheckin = async () => {
    if (!user) return;
    await dispatch(createCheckin({ userId: user.id, gymName: gymName || undefined, note: note || undefined }));
    setNote('');
    setSubmitted(true);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.greeting}>Hey {user?.displayName} 👋</Text>
      <Text style={styles.tagline}>Ready to keep the streak alive?</Text>

      <View style={styles.statsRow}>
        <View style={[styles.statCard, styles.statCardPrimary]}>
          <Text style={styles.statEmoji}>🔥</Text>
          <Text style={styles.statValuePrimary}>{user?.streakCount ?? 0}</Text>
          <Text style={styles.statLabelPrimary}>Current Streak</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statEmoji}>🏆</Text>
          <Text style={styles.statValue}>{user?.longestStreak ?? 0}</Text>
          <Text style={styles.statLabel}>Longest Streak</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Check In</Text>
        <Text style={styles.label}>Gym</Text>
        <TextInput
          style={styles.input}
          placeholder="Where are you training today?"
          placeholderTextColor={colors.textMuted}
          value={gymName}
          onChangeText={setGymName}
        />
        <Text style={styles.label}>Note (optional)</Text>
        <TextInput
          style={styles.input}
          placeholder="Leg day. Feeling strong."
          placeholderTextColor={colors.textMuted}
          value={note}
          onChangeText={setNote}
        />

        <TouchableOpacity style={styles.button} onPress={handleCheckin} disabled={isLoading} activeOpacity={0.85}>
          {isLoading ? <ActivityIndicator color={colors.white} /> : <Text style={styles.buttonText}>Check In</Text>}
        </TouchableOpacity>

        {submitted && (
          <View style={styles.successBox}>
            <Text style={styles.success}>Checked in! 💪 Keep it up.</Text>
          </View>
        )}
      </View>

      <TouchableOpacity style={styles.signOutButton} onPress={() => dispatch(signOut())} activeOpacity={0.7}>
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg },
  greeting: { ...typography.h1, fontSize: 26, marginBottom: spacing.xs },
  tagline: { ...typography.body, color: colors.textSecondary, marginBottom: spacing.lg },
  statsRow: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.lg },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    alignItems: 'center',
    ...shadow.card,
  },
  statCardPrimary: {
    backgroundColor: colors.primaryLight,
  },
  statEmoji: { fontSize: 22, marginBottom: spacing.xs },
  statValue: { fontSize: 26, fontWeight: '800', color: colors.text },
  statValuePrimary: { fontSize: 26, fontWeight: '800', color: colors.primary },
  statLabel: { ...typography.caption, marginTop: spacing.xs },
  statLabelPrimary: { ...typography.caption, color: colors.primaryDark, marginTop: spacing.xs, fontWeight: '600' },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    ...shadow.card,
  },
  sectionTitle: { ...typography.h3, marginBottom: spacing.md },
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
  button: {
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
    padding: 16,
    alignItems: 'center',
    ...shadow.button,
  },
  buttonText: { color: colors.white, fontSize: 16, fontWeight: '700' },
  successBox: {
    backgroundColor: colors.successBg,
    borderRadius: radius.sm,
    padding: spacing.sm,
    marginTop: spacing.md,
  },
  success: { color: colors.success, textAlign: 'center', fontSize: 14, fontWeight: '600' },
  signOutButton: { marginTop: spacing.xl, alignItems: 'center' },
  signOutText: { color: colors.danger, fontSize: 14, fontWeight: '600' },
});

export default HomeScreen;
