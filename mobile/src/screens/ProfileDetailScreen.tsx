import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/navigation/types';
import apiService from '@/services/apiService';
import { User } from '@/types';
import { colors, spacing, radius, typography, shadow } from '@/utils/theme';
import { initials } from '@/utils/format';

type Props = NativeStackScreenProps<RootStackParamList, 'ProfileDetail'>;

const ProfileDetailScreen = ({ route }: Props) => {
  const { userId } = route.params;
  const [profile, setProfile] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiService
      .getUserProfile(userId)
      .then(setProfile)
      .catch(() => setError('Could not load profile'));
  }, [userId]);

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials(profile.displayName)}</Text>
        </View>
        <Text style={styles.name}>{profile.displayName}</Text>
        {profile.homeGymName && <Text style={styles.gym}>🏋️ {profile.homeGymName}</Text>}
      </View>

      <View style={styles.statsRow}>
        <View style={[styles.statCard, styles.statCardPrimary]}>
          <Text style={styles.statEmoji}>🔥</Text>
          <Text style={styles.statValuePrimary}>{profile.streakCount}</Text>
          <Text style={styles.statLabelPrimary}>Current Streak</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statEmoji}>🏆</Text>
          <Text style={styles.statValue}>{profile.longestStreak}</Text>
          <Text style={styles.statLabel}>Longest Streak</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.lg, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  errorText: { ...typography.body, color: colors.danger },
  headerCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.lg,
    ...shadow.card,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: radius.full,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  avatarText: { color: colors.primaryDark, fontWeight: '800', fontSize: 24 },
  name: { ...typography.h2, marginBottom: spacing.xs },
  gym: { ...typography.caption },
  statsRow: { flexDirection: 'row', gap: spacing.md },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    alignItems: 'center',
    ...shadow.card,
  },
  statCardPrimary: { backgroundColor: colors.primaryLight },
  statEmoji: { fontSize: 22, marginBottom: spacing.xs },
  statValue: { fontSize: 26, fontWeight: '800', color: colors.text },
  statValuePrimary: { fontSize: 26, fontWeight: '800', color: colors.primary },
  statLabel: { ...typography.caption, marginTop: spacing.xs },
  statLabelPrimary: { ...typography.caption, color: colors.primaryDark, marginTop: spacing.xs, fontWeight: '600' },
});

export default ProfileDetailScreen;
