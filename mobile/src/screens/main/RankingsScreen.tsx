import React, { useCallback, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchLeaderboard } from '@/store/slices/checkinSlice';
import { LeaderboardEntry } from '@/types';

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

  const renderItem = ({ item, index }: { item: LeaderboardEntry; index: number }) => (
    <View style={[styles.row, item.userId === user?.id && styles.meRow]}>
      <Text style={styles.rank}>#{index + 1}</Text>
      <View style={styles.info}>
        <Text style={styles.name}>{item.displayName}</Text>
        <Text style={styles.streak}>🔥 streak: {item.streakCount}</Text>
      </View>
      <Text style={styles.count}>{item.checkinsThisWeek}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>This Week's Check-Ins</Text>
      <FlatList
        data={leaderboard}
        keyExtractor={(item) => item.userId}
        renderItem={renderItem}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={load} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text>No data yet. Add friends and check in!</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  title: { fontSize: 18, fontWeight: '600', padding: 16, paddingBottom: 8 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  meRow: { backgroundColor: '#F2F5FA' },
  rank: { fontSize: 16, fontWeight: 'bold', width: 40, color: '#4A90E2' },
  info: { flex: 1 },
  name: { fontSize: 16, fontWeight: '500' },
  streak: { fontSize: 13, color: '#666', marginTop: 2 },
  count: { fontSize: 20, fontWeight: 'bold' },
  empty: { alignItems: 'center', padding: 32 },
});

export default RankingsScreen;
