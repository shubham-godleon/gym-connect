import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/navigation/types';
import apiService from '@/services/apiService';
import { User } from '@/types';
import { useAppSelector } from '@/store/hooks';
import Avatar from '@/components/Avatar';
import { spacing, radius, ThemeColors, Typography, Shadow } from '@/utils/theme';
import { useTheme, useThemedStyles } from '@/theme/ThemeContext';

type Props = NativeStackScreenProps<RootStackParamList, 'ProfileDetail'>;

const ProfileDetailScreen = ({ route, navigation }: Props) => {
  const { userId } = route.params;
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const currentUser = useAppSelector((state) => state.auth.user);
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

  const isOwnProfile = currentUser?.id === userId;

  return (
    <View style={styles.container}>
      <View style={styles.headerCard}>
        <Avatar displayName={profile.displayName} photoUrl={profile.photoUrl} size={72} />
        <Text style={styles.name}>{profile.displayName}</Text>
        {profile.username && <Text style={styles.handle}>@{profile.username}</Text>}
        {profile.homeGymName && <Text style={styles.gym}>🏋️ {profile.homeGymName}</Text>}
        {isOwnProfile && (
          <TouchableOpacity style={styles.editButton} onPress={() => navigation.navigate('EditProfile')}>
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.statsRow}>
        <View style={[styles.statCard, styles.statCardPrimary]}>
          <Text style={styles.statEmoji}>🔥</Text>
          <Text style={styles.statValuePrimary}>{profile.streakCount}</Text>
          <Text style={styles.statLabelPrimary}>Week Streak</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statEmoji}>🏆</Text>
          <Text style={styles.statValue}>{profile.longestStreak}</Text>
          <Text style={styles.statLabel}>Best Streak</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.activityRow}
        onPress={() => navigation.navigate('CheckinCalendar', { userId })}
        activeOpacity={0.7}
      >
        <Text style={styles.activityText}>📅 View Activity</Text>
        <Text style={styles.activityChevron}>›</Text>
      </TouchableOpacity>
    </View>
  );
};

const createStyles = (colors: ThemeColors, typography: Typography, shadow: Shadow) => StyleSheet.create({
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
  name: { ...typography.h2, marginTop: spacing.sm, marginBottom: spacing.xs },
  handle: { ...typography.caption, color: colors.primary, fontWeight: '700', marginBottom: spacing.xs },
  gym: { ...typography.caption },
  editButton: { marginTop: spacing.sm },
  editButtonText: { color: colors.primary, fontWeight: '600', fontSize: 14 },
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
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginTop: spacing.lg,
    ...shadow.card,
  },
  activityText: { ...typography.bodyBold },
  activityChevron: { color: colors.textMuted, fontSize: 20 },
});

export default ProfileDetailScreen;
