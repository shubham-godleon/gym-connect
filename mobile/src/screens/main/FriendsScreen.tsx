import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, StyleSheet, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchFriends,
  fetchPendingRequests,
  respondToFriendRequest,
  sendFriendRequest,
} from '@/store/slices/friendSlice';
import { fetchLeaderboard } from '@/store/slices/checkinSlice';
import apiService from '@/services/apiService';
import { User, UserSearchResult, LeaderboardEntry } from '@/types';
import Avatar from '@/components/Avatar';
import Icon from '@/components/Icon';
import ScreenBackground from '@/components/ScreenBackground';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { spacing, radius, ThemeColors, Typography, Shadow } from '@/utils/theme';
import { useTheme, useThemedStyles } from '@/theme/ThemeContext';

const MEDALS = ['🥇', '🥈', '🥉'];

const FriendsScreen = () => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation<any>();
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const insets = useSafeAreaInsets();
  const user = useAppSelector((state) => state.auth.user);
  const { friends, pendingRequests, isLoading } = useAppSelector((state) => state.friend);
  const { leaderboard } = useAppSelector((state) => state.checkin);

  const [tab, setTab] = useState<'friends' | 'rankings'>('friends');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<UserSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [requested, setRequested] = useState<Record<string, boolean>>({});

  const load = useCallback(() => {
    if (!user) return;
    dispatch(fetchFriends(user.id));
    dispatch(fetchPendingRequests(user.id));
    dispatch(fetchLeaderboard(user.id));
  }, [dispatch, user]);

  useEffect(() => {
    load();
  }, [load]);

  // Debounced username search.
  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) { setResults([]); setSearching(false); return; }
    setSearching(true);
    const t = setTimeout(() => {
      apiService.searchUsers(q)
        .then((r) => setResults(r.filter((u) => u.userId !== user?.id)))
        .catch(() => setResults([]))
        .finally(() => setSearching(false));
    }, 300);
    return () => clearTimeout(t);
  }, [query, user?.id]);

  const sendRequest = async (target: UserSearchResult) => {
    if (!user) return;
    try {
      await dispatch(sendFriendRequest({ requesterId: user.id, addresseeId: target.userId })).unwrap();
    } catch {
      // request may already exist — treat as sent
    }
    setRequested((r) => ({ ...r, [target.userId]: true }));
  };

  const handleRespond = (friendshipId: string, accept: boolean) => {
    if (!user) return;
    dispatch(respondToFriendRequest({ friendshipId, addresseeId: user.id, accept })).then(load);
  };

  const renderFriend = ({ item }: { item: User }) => (
    <TouchableOpacity
      style={styles.row}
      onPress={() => navigation.navigate('ProfileDetail', { userId: item.id })}
      activeOpacity={0.7}
    >
      <Avatar displayName={item.displayName} photoUrl={item.photoUrl} style={styles.avatarMargin} />
      <Text style={styles.name}>{item.displayName}</Text>
      <View style={styles.streakPill}>
        <Icon name="fire" size={13} color={colors.primary} />
        <Text style={styles.streak}>{item.streakCount}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderRank = ({ item, index }: { item: LeaderboardEntry; index: number }) => {
    const isMe = item.userId === user?.id;
    return (
      <TouchableOpacity
        style={[styles.row, isMe && styles.meRow]}
        onPress={() => (isMe ? navigation.navigate('Me') : navigation.navigate('ProfileDetail', { userId: item.userId }))}
        activeOpacity={0.7}
      >
        <View style={styles.rankBox}>
          {index < 3 ? <Text style={styles.medal}>{MEDALS[index]}</Text> : <Text style={styles.rank}>#{index + 1}</Text>}
        </View>
        <Avatar displayName={item.displayName} photoUrl={item.photoUrl} size={36} style={styles.avatarMargin} />
        <View style={styles.rankInfo}>
          <Text style={styles.name}>{item.displayName}{isMe ? ' (you)' : ''}</Text>
          <View style={styles.rankStreakRow}>
            <Icon name="fire" size={12} color={colors.primary} />
            <Text style={styles.rankStreak}>{item.streakCount} week streak</Text>
          </View>
        </View>
        <View style={styles.countBox}>
          <Text style={styles.count}>{item.checkinsThisWeek}</Text>
          <Text style={styles.countLabel}>this week</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const Segment = (
    <View style={[styles.segment, { paddingTop: insets.top + spacing.sm }]}>
      <TouchableOpacity style={[styles.segBtn, tab === 'friends' && styles.segBtnActive]} onPress={() => setTab('friends')}>
        <Text style={[styles.segText, tab === 'friends' && styles.segTextActive]}>Friends</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.segBtn, tab === 'rankings' && styles.segBtnActive]} onPress={() => setTab('rankings')}>
        <Text style={[styles.segText, tab === 'rankings' && styles.segTextActive]}>Rankings</Text>
      </TouchableOpacity>
    </View>
  );

  if (tab === 'rankings') {
    return (
      <ScreenBackground plain>
        {Segment}
        <FlatList
          data={leaderboard}
          keyExtractor={(item) => item.userId}
          renderItem={renderRank}
          refreshing={isLoading}
          onRefresh={load}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyEmoji}>📊</Text>
              <Text style={styles.emptyText}>No data yet. Add friends and check in!</Text>
            </View>
          }
        />
      </ScreenBackground>
    );
  }

  return (
    <ScreenBackground plain>
      {Segment}
      <FlatList
      data={friends}
      keyExtractor={(item) => item.id}
      renderItem={renderFriend}
      refreshing={isLoading}
      onRefresh={load}
      contentContainerStyle={styles.listContent}
      ListHeaderComponent={
        <View>
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Add a friend</Text>
            <TextInput
              style={styles.input}
              placeholder="Search by username"
              placeholderTextColor={colors.textMuted}
              value={query}
              onChangeText={setQuery}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {searching && <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.sm }} />}
            {results.map((r) => (
              <View key={r.userId} style={styles.resultRow}>
                <Avatar displayName={r.displayName} photoUrl={r.photoUrl} size={36} style={styles.avatarMargin} />
                <Text style={styles.resultName}>@{r.username}</Text>
                <TouchableOpacity
                  style={styles.addBtn}
                  onPress={() => sendRequest(r)}
                  disabled={requested[r.userId]}
                >
                  <Text style={styles.addBtnText}>{requested[r.userId] ? 'Requested' : '＋ Add'}</Text>
                </TouchableOpacity>
              </View>
            ))}
            {query.trim().length >= 2 && !searching && results.length === 0 && (
              <Text style={styles.status}>No users found.</Text>
            )}
          </View>

          {pendingRequests.length > 0 && (
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Pending Requests</Text>
              {pendingRequests.map((req) => (
                <View key={req.id} style={styles.requestRow}>
                  <Avatar displayName={req.requesterDisplayName} photoUrl={req.requesterPhotoUrl} style={styles.avatarMargin} />
                  <Text style={styles.requestName}>{req.requesterDisplayName}</Text>
                  <View style={styles.requestActions}>
                    <TouchableOpacity onPress={() => handleRespond(req.id, true)} activeOpacity={0.7}>
                      <Text style={styles.accept}>Accept</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleRespond(req.id, false)} activeOpacity={0.7}>
                      <Text style={styles.decline}>Decline</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}

          <Text style={styles.listTitle}>Friends</Text>
        </View>
      }
      ListEmptyComponent={
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>🤝</Text>
          <Text style={styles.emptyText}>No friends yet. Add one above!</Text>
        </View>
      }
      />
    </ScreenBackground>
  );
};

const createStyles = (colors: ThemeColors, typography: Typography, shadow: Shadow) => StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  listContent: { padding: spacing.md, paddingBottom: 110 },
  segment: { flexDirection: 'row', gap: spacing.sm, padding: spacing.md, paddingBottom: 0 },
  segBtn: {
    flex: 1, paddingVertical: spacing.sm, borderRadius: radius.full,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, alignItems: 'center',
  },
  segBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  segText: { ...typography.caption, fontWeight: '700' },
  segTextActive: { color: colors.white },
  meRow: { backgroundColor: colors.primaryLight },
  rankBox: { width: 32, alignItems: 'center', marginRight: spacing.xs },
  rank: { fontSize: 15, fontWeight: '800', color: colors.textMuted },
  medal: { fontSize: 20 },
  rankInfo: { flex: 1 },
  rankStreakRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 2 },
  rankStreak: { ...typography.caption },
  countBox: { alignItems: 'center' },
  count: { fontSize: 20, fontWeight: '800', color: colors.primary },
  countLabel: { fontSize: 10, color: colors.textMuted },
  card: {
    backgroundColor: colors.glassFill,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadow.card,
  },
  sectionTitle: { ...typography.h3, marginBottom: spacing.md },
  listTitle: { ...typography.h3, marginBottom: spacing.sm, marginLeft: spacing.xs },
  input: {
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderRadius: radius.sm,
    padding: 14,
    marginBottom: spacing.sm,
    fontSize: 16,
    backgroundColor: colors.glassFill,
    color: colors.text,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
    padding: 14,
    alignItems: 'center',
  },
  buttonText: { color: colors.white, fontSize: 15, fontWeight: '700' },
  status: { marginTop: spacing.sm, color: colors.textSecondary, fontSize: 13 },
  resultRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm },
  resultName: { ...typography.bodyBold, flex: 1 },
  addBtn: {
    backgroundColor: colors.primary, borderRadius: radius.full,
    paddingHorizontal: spacing.md, paddingVertical: spacing.xs,
  },
  addBtnText: { color: colors.white, fontWeight: '700', fontSize: 12 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.glassFill,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadow.card,
  },
  avatarMargin: { marginRight: spacing.sm },
  name: { ...typography.bodyBold, flex: 1 },
  streakPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: colors.glassFill,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  streak: { fontSize: 13, color: colors.textSecondary, fontWeight: '700' },
  requestRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  requestName: { ...typography.bodyBold, flex: 1 },
  requestActions: { flexDirection: 'row', gap: spacing.md },
  accept: { color: colors.success, fontWeight: '700', fontSize: 13 },
  decline: { color: colors.danger, fontWeight: '700', fontSize: 13 },
  empty: { alignItems: 'center', padding: spacing.xxl },
  emptyEmoji: { fontSize: 40, marginBottom: spacing.sm },
  emptyText: { ...typography.caption },
});

export default FriendsScreen;
