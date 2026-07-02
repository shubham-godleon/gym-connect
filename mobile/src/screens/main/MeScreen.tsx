import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppSelector } from '@/store/hooks';
import Avatar from '@/components/Avatar';
import ActivityCalendar from '@/components/ActivityCalendar';
import { spacing, radius, ThemeColors, Typography, Shadow } from '@/utils/theme';
import { useThemedStyles } from '@/theme/ThemeContext';

const MeScreen = () => {
  const navigation = useNavigation<any>();
  const user = useAppSelector((state) => state.auth.user);
  const styles = useThemedStyles(createStyles);

  if (!user) return null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerCard}>
        <Avatar displayName={user.displayName} photoUrl={user.photoUrl} size={72} />
        <Text style={styles.name}>{user.displayName}</Text>
        {user.username && <Text style={styles.handle}>@{user.username}</Text>}
        {user.homeGymName && <Text style={styles.gym}>🏋️ {user.homeGymName}</Text>}
        <TouchableOpacity style={styles.editButton} onPress={() => navigation.navigate('EditProfile')}>
          <Text style={styles.editButtonText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsRow}>
        <View style={[styles.statCard, styles.statCardPrimary]}>
          <Text style={styles.statEmoji}>🔥</Text>
          <Text style={styles.statValuePrimary}>{user.streakCount}</Text>
          <Text style={styles.statLabelPrimary}>Week Streak</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statEmoji}>🏆</Text>
          <Text style={styles.statValue}>{user.longestStreak}</Text>
          <Text style={styles.statLabel}>Best Streak</Text>
        </View>
      </View>

      {user.weeklyGoal != null && (
        <View style={styles.goalCard}>
          <Text style={styles.goalText}>
            <Text style={styles.goalStrong}>{user.weeklyProgress}/{user.weeklyGoal}</Text> days this week
          </Text>
        </View>
      )}

      <ActivityCalendar userId={user.id} />
    </ScrollView>
  );
};

const createStyles = (colors: ThemeColors, typography: Typography, shadow: Shadow) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg },
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
  goalCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
    alignItems: 'center',
    ...shadow.card,
  },
  goalText: { ...typography.body, color: colors.text },
  goalStrong: { fontWeight: '800', color: colors.primary },
  statsRow: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.lg },
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

export default MeScreen;
