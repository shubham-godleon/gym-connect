import React, { useCallback, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchLeaderboard } from '@/store/slices/checkinSlice';
import { LeaderboardEntry } from '@/types';
import { colors, spacing, radius, typography, shadow } from '@/utils/theme';
import { initials } from '@/utils/format';

const MEDALS = ['🥇', '🥈', '🥉'];

const RankingsScreen = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const { leaderboard, isLoading } = useAppSelector((state) => state.checkin);

  const load = useCallback(() => {
    if (user) dispatch(fetchLeaderboard(user.id));
  }, [dispatch, user]);

  useEffect(() => {
    load();
  }, [load]);

  const renderItem = ({ item, index }: { item: LeaderboardEntry; index: number }) => {
    const isMe = item.userId === user?.id;
    return (
      <View style={[styles.row, isMe && styles.meRow]}>
        <View style={styles.rankBox}>
          {index < 3 ? (
            <Text style={styles.medal}>{MEDALS[index]}</Text>
          ) : (
            <Text style={styles.rank}>#{index + 1}</Text>
          )}
        </View>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials(item.displayName)}</Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.name}>
            {item.displayName}
            {isMe ? ' (you)' : ''}
          </Text>
          <Text style={styles.streak}>🔥 {item.streakCount} day streak</Text>
        </View>
        <View style={styles.countBox}>
          <Text style={styles.count}>{item.checkinsThisWeek}</Text>
          <Text style={styles.countLabel}>this week</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>This Week's Check-Ins</Text>
      <FlatList
        data={leaderboard}
        keyExtractor={(item) => item.userId}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={load} tintColor={colors.primary} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>📊</Text>
            <Text style={styles.emptyText}>No data yet. Add friends and check in!</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  title: { ...typography.h2, padding: spacing.md, paddingBottom: spacing.sm },
  listContent: { paddingHorizontal: spacing.md, paddingBottom: spacing.md },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadow.card,
  },
  meRow: { backgroundColor: colors.primaryLight },
  rankBox: { width: 32, alignItems: 'center' },
  rank: { fontSize: 15, fontWeight: '800', color: colors.textMuted },
  medal: { fontSize: 20 },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: spacing.sm,
  },
  avatarText: { color: colors.primaryDark, fontWeight: '700', fontSize: 12 },
  info: { flex: 1 },
  name: { ...typography.bodyBold },
  streak: { ...typography.caption, marginTop: 2 },
  countBox: { alignItems: 'center' },
  count: { fontSize: 20, fontWeight: '800', color: colors.primary },
  countLabel: { fontSize: 10, color: colors.textMuted },
  empty: { alignItems: 'center', padding: spacing.xxl },
  emptyEmoji: { fontSize: 40, marginBottom: spacing.sm },
  emptyText: { ...typography.caption },
});

export default RankingsScreen;
