import React, { useCallback, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, FlatList, RefreshControl } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { createCheckin } from '@/store/slices/checkinSlice';
import { signOut, refreshUser } from '@/store/slices/authSlice';
import { CheckinLocation, Slacker, FeedItem } from '@/types';
import apiService from '@/services/apiService';
import Avatar from '@/components/Avatar';
import { timeAgo } from '@/utils/format';
import { spacing, radius, ThemeColors, Typography, Shadow } from '@/utils/theme';
import { useTheme, useThemedStyles } from '@/theme/ThemeContext';

const PAGE_SIZE = 15;

const HomeScreen = () => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation<any>();
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const user = useAppSelector((s) => s.auth.user);
  const { isLoading, error } = useAppSelector((s) => s.checkin);
  const [submittedLocation, setSubmittedLocation] = useState<CheckinLocation | null>(null);
  const [slackers, setSlackers] = useState<Slacker[]>([]);

  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [feedLoading, setFeedLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const pageRef = useRef(0);
  const loadingRef = useRef(false);

  const fetchPage = useCallback(async (reset: boolean) => {
    if (!user || loadingRef.current) return;
    loadingRef.current = true;
    if (reset) pageRef.current = 0;
    if (!reset) setFeedLoading(true);
    try {
      const items = await apiService.getFeed(user.id, pageRef.current, PAGE_SIZE);
      setHasMore(items.length === PAGE_SIZE);
      setFeed((prev) => (reset ? items : [...prev, ...items]));
      pageRef.current += 1;
    } catch {
      // ignore
    } finally {
      loadingRef.current = false;
      setFeedLoading(false);
    }
  }, [user]);

  const refresh = useCallback(async () => {
    if (!user) return;
    setRefreshing(true);
    apiService.getSlackingFriends(user.id).then(setSlackers).catch(() => {});
    dispatch(refreshUser(user.id));
    await fetchPage(true);
    setRefreshing(false);
  }, [user, dispatch, fetchPage]);

  useFocusEffect(useCallback(() => { refresh(); }, [refresh]));

  const handleCheckin = async (location: CheckinLocation) => {
    if (!user) return;
    setSubmittedLocation(null);
    const result = await dispatch(createCheckin({ userId: user.id, location }));
    if (createCheckin.fulfilled.match(result)) {
      dispatch(refreshUser(user.id));
      setSubmittedLocation(location);
      refresh();
    }
  };

  const handleReact = async (checkinId: string) => {
    if (!user) return;
    setFeed((prev) => prev.map((it) =>
      it.id === checkinId
        ? { ...it, reactedByMe: !it.reactedByMe, reactionCount: it.reactionCount + (it.reactedByMe ? -1 : 1) }
        : it));
    try { await apiService.toggleReaction(checkinId, user.id); } catch { /* revert-free for MVP */ }
  };

  const goalMet = user?.weeklyGoal != null && user.weeklyProgress >= user.weeklyGoal;
  const pref = user?.workoutLocation ?? 'GYM';
  const showGym = pref === 'GYM' || pref === 'BOTH';
  const showHome = pref === 'HOME' || pref === 'BOTH';

  const Header = (
    <View>
      <View style={styles.greetingRow}>
        <TouchableOpacity onPress={() => navigation.navigate('Me')}>
          <Avatar displayName={user?.displayName || ''} photoUrl={user?.photoUrl} size={48} style={styles.avatarMargin} />
        </TouchableOpacity>
        <View>
          <Text style={styles.greeting}>Hey {user?.displayName} 👋</Text>
          <Text style={styles.tagline}>Ready to keep the streak alive?</Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={[styles.statCard, styles.statCardPrimary]}>
          <Text style={styles.statEmoji}>🔥</Text>
          <Text style={styles.statValuePrimary}>{user?.streakCount ?? 0}</Text>
          <Text style={styles.statLabelPrimary}>Week Streak</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statEmoji}>🏆</Text>
          <Text style={styles.statValue}>{user?.longestStreak ?? 0}</Text>
          <Text style={styles.statLabel}>Best Streak</Text>
        </View>
      </View>

      {user?.weeklyGoal != null && (
        <View style={styles.goalCard}>
          <Text style={styles.goalText}>
            {goalMet ? '✅ Goal hit — ' : '🎯 '}
            <Text style={styles.goalStrong}>{user.weeklyProgress}/{user.weeklyGoal}</Text> this week
          </Text>
          {!goalMet && (
            <Text style={styles.goalSub}>{user.weeklyGoal - user.weeklyProgress} more to keep your streak alive</Text>
          )}
        </View>
      )}

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Check In</Text>
        {showGym && (
          <TouchableOpacity style={styles.button} onPress={() => handleCheckin('GYM')} disabled={isLoading} activeOpacity={0.85}>
            {isLoading ? <ActivityIndicator color={colors.white} /> : <Text style={styles.buttonText}>🏋️ Gym</Text>}
          </TouchableOpacity>
        )}
        {showHome && (
          <TouchableOpacity style={[styles.button, showGym && styles.buttonSecondary]} onPress={() => handleCheckin('HOME')} disabled={isLoading} activeOpacity={0.85}>
            {isLoading ? <ActivityIndicator color={showGym ? colors.primary : colors.white} /> : <Text style={[styles.buttonText, showGym && styles.buttonTextSecondary]}>🏠 Home</Text>}
          </TouchableOpacity>
        )}
        {error && <View style={styles.errorBox}><Text style={styles.errorText}>{error}</Text></View>}
        {!error && submittedLocation && <View style={styles.successBox}><Text style={styles.success}>Checked in! 💪 Keep it up.</Text></View>}
      </View>

      {slackers.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Falling behind this week 👀</Text>
          {slackers.map((s) => (
            <TouchableOpacity key={s.userId} style={styles.slackerRow} onPress={() => navigation.navigate('ProfileDetail', { userId: s.userId })} activeOpacity={0.7}>
              <Avatar displayName={s.displayName} photoUrl={s.photoUrl} size={36} style={styles.slackerAvatar} />
              <View style={styles.slackerInfo}>
                <Text style={styles.slackerName}>{s.displayName}</Text>
                <Text style={styles.slackerSub}>{s.weeklyProgress}/{s.weeklyGoal} this week — {s.weeklyGoal - s.weeklyProgress} behind</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <Text style={styles.feedTitle}>Activity</Text>
    </View>
  );

  const renderItem = ({ item }: { item: FeedItem }) => {
    if (item.type === 'FRIEND_ACCEPTED') {
      return (
        <View style={styles.feedCard}>
          <View style={styles.cardHeader}>
            <View style={styles.eventAvatar}><Text style={styles.eventEmoji}>🎉</Text></View>
            <View style={styles.headerText}>
              <Text style={styles.feedName}>You and {item.friendDisplayName} are now friends</Text>
            </View>
            <Text style={styles.time}>{timeAgo(item.createdAt)}</Text>
          </View>
        </View>
      );
    }
    return (
      <View style={styles.feedCard}>
        <View style={styles.cardHeader}>
          <Avatar displayName={item.displayName || ''} photoUrl={item.photoUrl} style={styles.avatarMargin} />
          <View style={styles.headerText}>
            <TouchableOpacity onPress={() => navigation.navigate('ProfileDetail', { userId: item.userId })}>
              <Text style={styles.feedName}>{item.displayName}</Text>
            </TouchableOpacity>
            <Text style={styles.gym}>
              {item.location === 'HOME' ? '🏠 Home Workout' : `📍 ${item.gymName}`}
              {item.verified ? '  ✅' : ''}
            </Text>
          </View>
          <Text style={styles.time}>{timeAgo(item.createdAt)}</Text>
        </View>
        {item.note ? <Text style={styles.note}>"{item.note}"</Text> : null}
        <TouchableOpacity
          style={[styles.reaction, item.reactedByMe && styles.reactionActiveBg]}
          onPress={() => handleReact(item.id)}
          activeOpacity={0.7}
        >
          <Text style={styles.reactionEmoji}>{item.reactedByMe ? '🔥' : '🤍'}</Text>
          <Text style={[styles.reactionText, item.reactedByMe && styles.reactionActive]}>{item.reactionCount}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.content}
      data={feed}
      keyExtractor={(item) => `${item.type}-${item.id}`}
      renderItem={renderItem}
      ListHeaderComponent={Header}
      onEndReachedThreshold={0.4}
      onEndReached={() => { if (hasMore && !loadingRef.current) fetchPage(false); }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.primary} />}
      ListEmptyComponent={<Text style={styles.feedEmpty}>No activity yet — check in to get things started!</Text>}
      ListFooterComponent={
        <View>
          {feedLoading && <ActivityIndicator color={colors.primary} style={{ marginVertical: spacing.md }} />}
          <TouchableOpacity style={styles.signOutButton} onPress={() => dispatch(signOut())} activeOpacity={0.7}>
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      }
    />
  );
};

const createStyles = (colors: ThemeColors, typography: Typography, shadow: Shadow) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg },
  greetingRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.lg },
  avatarMargin: { marginRight: spacing.md },
  greeting: { ...typography.h1, fontSize: 22, marginBottom: spacing.xs },
  tagline: { ...typography.body, color: colors.textSecondary },
  statsRow: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.lg },
  statCard: { flex: 1, backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md, alignItems: 'center', ...shadow.card },
  statCardPrimary: { backgroundColor: colors.primaryLight },
  statEmoji: { fontSize: 22, marginBottom: spacing.xs },
  statValue: { fontSize: 26, fontWeight: '800', color: colors.text },
  statValuePrimary: { fontSize: 26, fontWeight: '800', color: colors.primary },
  statLabel: { ...typography.caption, marginTop: spacing.xs },
  statLabelPrimary: { ...typography.caption, color: colors.primaryDark, marginTop: spacing.xs, fontWeight: '600' },
  goalCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.lg, ...shadow.card },
  goalText: { ...typography.body, color: colors.text },
  goalStrong: { fontWeight: '800', color: colors.primary },
  goalSub: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.lg, ...shadow.card },
  sectionTitle: { ...typography.h3, marginBottom: spacing.md },
  slackerRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm },
  slackerAvatar: { marginRight: spacing.md },
  slackerInfo: { flex: 1 },
  slackerName: { ...typography.bodyBold },
  slackerSub: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  button: { backgroundColor: colors.primary, borderRadius: radius.sm, padding: 16, alignItems: 'center', ...shadow.button },
  buttonSecondary: { backgroundColor: colors.primaryLight, marginTop: spacing.sm, shadowOpacity: 0, elevation: 0 },
  buttonText: { color: colors.white, fontSize: 16, fontWeight: '700' },
  buttonTextSecondary: { color: colors.primaryDark },
  successBox: { backgroundColor: colors.successBg, borderRadius: radius.sm, padding: spacing.sm, marginTop: spacing.md },
  success: { color: colors.success, textAlign: 'center', fontSize: 14, fontWeight: '600' },
  errorBox: { backgroundColor: colors.dangerBg, borderRadius: radius.sm, padding: spacing.sm, marginTop: spacing.md },
  errorText: { color: colors.danger, textAlign: 'center', fontSize: 14, fontWeight: '600' },
  // Feed
  feedTitle: { ...typography.h3, marginBottom: spacing.md },
  feedEmpty: { ...typography.caption, textAlign: 'center', paddingVertical: spacing.lg },
  feedCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.md, ...shadow.card },
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  eventAvatar: { width: 40, height: 40, borderRadius: radius.full, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center', marginRight: spacing.sm },
  eventEmoji: { fontSize: 18 },
  headerText: { flex: 1 },
  feedName: { ...typography.bodyBold },
  gym: { ...typography.caption, marginTop: 2 },
  time: { ...typography.caption, fontSize: 11 },
  note: { ...typography.body, color: colors.textSecondary, fontStyle: 'italic', marginTop: spacing.sm, marginLeft: 50 },
  reaction: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.sm, marginLeft: 50, alignSelf: 'flex-start', paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: radius.full, backgroundColor: colors.background },
  reactionActiveBg: { backgroundColor: colors.primaryLight },
  reactionEmoji: { fontSize: 14, marginRight: spacing.xs },
  reactionText: { fontSize: 13, color: colors.textSecondary, fontWeight: '600' },
  reactionActive: { color: colors.primaryDark },
  signOutButton: { marginTop: spacing.xl, alignItems: 'center' },
  signOutText: { color: colors.danger, fontSize: 14, fontWeight: '600' },
});

export default HomeScreen;
