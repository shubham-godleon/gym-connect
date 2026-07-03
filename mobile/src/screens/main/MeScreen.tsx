import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppSelector } from '@/store/hooks';
import Avatar from '@/components/Avatar';
import Icon from '@/components/Icon';
import ScreenBackground from '@/components/ScreenBackground';
import ActivityCalendar from '@/components/ActivityCalendar';
import { spacing, radius, ThemeColors, Typography, Shadow } from '@/utils/theme';
import { useTheme, useThemedStyles } from '@/theme/ThemeContext';

const MeScreen = () => {
  const navigation = useNavigation<any>();
  const user = useAppSelector((state) => state.auth.user);
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);

  if (!user) return null;

  return (
    <ScreenBackground>
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerCard}>
        <Avatar displayName={user.displayName} photoUrl={user.photoUrl} size={88} />
        <Text style={styles.name}>{user.displayName}</Text>
        {user.username && <Text style={styles.handle}>@{user.username}</Text>}
        {user.homeGymName && (
          <View style={styles.gymRow}>
            <Icon name="dumbbell" size={13} color={colors.textSecondary} />
            <Text style={styles.gym}>{user.homeGymName}</Text>
          </View>
        )}
        <TouchableOpacity style={styles.editButton} onPress={() => navigation.navigate('EditProfile')}>
          <Text style={styles.editButtonText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsRow}>
        <View style={[styles.statCard, styles.statCardPrimary]}>
          <Icon name="fire" size={24} color={colors.primary} style={styles.statIcon} />
          <Text style={styles.statValuePrimary}>{user.streakCount}</Text>
          <Text style={styles.statLabelPrimary}>Week Streak</Text>
        </View>
        <View style={styles.statCard}>
          <Icon name="trophy" size={24} color={colors.highlight} style={styles.statIcon} />
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
    </ScreenBackground>
  );
};

const createStyles = (colors: ThemeColors, typography: Typography, shadow: Shadow) => StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  content: { padding: spacing.lg },
  headerCard: {
    backgroundColor: colors.glassFill,
    borderRadius: radius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.lg,
    ...shadow.card,
  },
  name: { ...typography.h2, marginTop: spacing.sm, marginBottom: spacing.xs },
  handle: { ...typography.caption, color: colors.primary, fontWeight: '700', marginBottom: spacing.xs },
  gymRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  gym: { ...typography.caption },
  editButton: { marginTop: spacing.md },
  editButtonText: { color: colors.primary, fontWeight: '700', fontSize: 14 },
  goalCard: {
    backgroundColor: colors.glassFill,
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
    backgroundColor: colors.glassFill,
    borderRadius: radius.lg,
    padding: spacing.md,
    alignItems: 'center',
    ...shadow.card,
  },
  statCardPrimary: { backgroundColor: colors.primaryLight },
  statIcon: { marginBottom: spacing.xs },
  statValue: { fontSize: 26, fontWeight: '800', color: colors.text },
  statValuePrimary: { fontSize: 26, fontWeight: '800', color: colors.primary },
  statLabel: { ...typography.caption, marginTop: spacing.xs },
  statLabelPrimary: { ...typography.caption, color: colors.primaryDark, marginTop: spacing.xs, fontWeight: '600' },
});

export default MeScreen;
