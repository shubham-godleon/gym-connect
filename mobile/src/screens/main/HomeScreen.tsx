import React, { useCallback, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, FlatList, RefreshControl, Animated, Pressable } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { createCheckin, fetchKudosCount, markKudosSeen } from '@/store/slices/checkinSlice';
import { signOut, refreshUser } from '@/store/slices/authSlice';
import { CheckinLocation, Slacker, FeedItem } from '@/types';
import apiService from '@/services/apiService';
import Avatar from '@/components/Avatar';
import Icon from '@/components/Icon';
import ScreenBackground from '@/components/ScreenBackground';
import { timeAgo, titleCase } from '@/utils/format';
import { spacing, radius, ThemeColors, Typography, Shadow } from '@/utils/theme';
import { useTheme, useThemedStyles } from '@/theme/ThemeContext';

const PAGE_SIZE = 15;

const HomeScreen = () => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation<any>();
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const insets = useSafeAreaInsets();
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
    // Refresh kudos then mark them seen — clears the Home tab dot.
    await dispatch(fetchKudosCount(user.id));
    dispatch(markKudosSeen());
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
          <Avatar displayName={user?.displayName || ''} photoUrl={user?.photoUrl} size={72} style={styles.avatarMargin} />
        </TouchableOpacity>
        <View>
          <Text style={styles.greeting}>Hey {user?.displayName} 👋</Text>
          <Text style={styles.tagline}>Ready to keep the streak alive?</Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={[styles.statCard, styles.statCardPrimary]}>
          <Icon name="fire" size={24} color={colors.primary} style={styles.statIcon} />
          <Text style={styles.statValuePrimary}>{user?.streakCount ?? 0}</Text>
          <Text style={styles.statLabelPrimary}>Week Streak</Text>
        </View>
        <View style={styles.statCard}>
          <Icon name="trophy" size={24} color={colors.highlight} style={styles.statIcon} />
          <Text style={styles.statValue}>{user?.longestStreak ?? 0}</Text>
          <Text style={styles.statLabel}>Best Streak</Text>
        </View>
      </View>

      {user?.weeklyGoal != null && (
        <View style={styles.goalCard}>
          <View style={styles.goalHeader}>
            <Text style={styles.goalLabel}>This week</Text>
            <Text>
              <Text style={styles.goalStrong}>{user.weeklyProgress}</Text>
              <Text style={styles.goalTotal}> / {user.weeklyGoal}</Text>
            </Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${Math.min(100, (user.weeklyProgress / user.weeklyGoal) * 100)}%` }]} />
          </View>
          <Text style={styles.goalSub}>
            {goalMet
              ? 'Goal smashed — streak secured 🔥'
              : `${user.weeklyGoal - user.weeklyProgress} more day${user.weeklyGoal - user.weeklyProgress === 1 ? '' : 's'} to lock your streak`}
          </Text>
        </View>
      )}

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Check In</Text>
        <View style={styles.checkinRow}>
          {showGym && (
            <CheckinButton icon="dumbbell" label="Gym" onPress={() => handleCheckin('GYM')} disabled={isLoading} selected={submittedLocation === 'GYM'} />
          )}
          {showHome && (
            <CheckinButton icon="home-variant" label="Home" onPress={() => handleCheckin('HOME')} disabled={isLoading} selected={submittedLocation === 'HOME'} />
          )}
        </View>
        {isLoading && <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.md }} />}
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
          <Avatar displayName={item.displayName || ''} photoUrl={item.photoUrl} size={44} style={styles.avatarMargin} />
          <View style={styles.headerText}>
            <TouchableOpacity onPress={() => navigation.navigate('ProfileDetail', { userId: item.userId })}>
              <Text style={styles.feedName}>{item.displayName}</Text>
            </TouchableOpacity>
            <View style={styles.gymRow}>
              <Icon name={item.location === 'HOME' ? 'home-variant' : 'map-marker'} size={13} color={colors.textSecondary} />
              <Text style={styles.gym} numberOfLines={1}>{item.location === 'HOME' ? 'Home Workout' : titleCase(item.gymName)}</Text>
              {item.verified && <Icon name="check-decagram" size={14} color={colors.primary} />}
              <Text style={styles.dotSep}>·</Text>
              <Text style={styles.time}>{timeAgo(item.createdAt)}</Text>
            </View>
          </View>
          <TouchableOpacity
            style={[styles.kudos, item.reactedByMe && styles.kudosActive]}
            onPress={() => handleReact(item.id)}
            activeOpacity={0.7}
          >
            <Icon name="fire" size={22} color={item.reactedByMe ? colors.primary : colors.textMuted} />
            <Text style={[styles.kudosCount, item.reactedByMe && styles.kudosCountActive]}>{item.reactionCount}</Text>
          </TouchableOpacity>
        </View>
        {item.note ? <Text style={styles.note}>"{item.note}"</Text> : null}
      </View>
    );
  };

  return (
    <ScreenBackground>
      <FlatList
        style={styles.container}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + spacing.md }]}
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
    </ScreenBackground>
  );
};

const CheckinButton = ({
  icon,
  label,
  onPress,
  disabled,
  selected,
}: {
  icon: 'dumbbell' | 'home-variant';
  label: string;
  onPress: () => void;
  disabled?: boolean;
  selected?: boolean;
}) => {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const scale = useRef(new Animated.Value(1)).current;

  const pressIn = () => Animated.spring(scale, { toValue: 0.94, useNativeDriver: true, speed: 40, bounciness: 0 }).start();
  const pressOut = () => Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 20, bounciness: 12 }).start();

  return (
    <Animated.View style={{ flex: 1, transform: [{ scale }] }}>
      <Pressable
        onPress={onPress}
        onPressIn={pressIn}
        onPressOut={pressOut}
        disabled={disabled}
        style={[styles.checkinBtn, selected && styles.checkinBtnSelected]}
      >
        <Icon name={icon} size={26} color={colors.primary} />
        <Text style={styles.checkinLabel}>{label}</Text>
      </Pressable>
    </Animated.View>
  );
};

const createStyles = (colors: ThemeColors, typography: Typography, shadow: Shadow) => StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  content: { padding: spacing.lg, paddingBottom: 110 },
  greetingRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.lg },
  avatarMargin: { marginRight: spacing.md },
  greeting: { ...typography.h1, fontSize: 22, marginBottom: spacing.xs },
  tagline: { ...typography.body, color: colors.textSecondary },
  statsRow: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.lg },
  statCard: { flex: 1, backgroundColor: colors.glassFill, borderRadius: radius.lg, padding: spacing.md, alignItems: 'center', ...shadow.card },
  statCardPrimary: { backgroundColor: colors.primaryLight },
  statIcon: { marginBottom: spacing.xs },
  statValue: { fontSize: 26, fontWeight: '800', color: colors.text },
  statValuePrimary: { fontSize: 26, fontWeight: '800', color: colors.primary },
  statLabel: { ...typography.caption, marginTop: spacing.xs },
  statLabelPrimary: { ...typography.caption, color: colors.primaryDark, marginTop: spacing.xs, fontWeight: '600' },
  goalCard: { backgroundColor: colors.glassFill, borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.lg, ...shadow.card },
  goalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: spacing.sm },
  goalLabel: { ...typography.label, color: colors.textSecondary },
  goalStrong: { fontSize: 20, fontWeight: '800', color: colors.primary },
  goalTotal: { fontSize: 15, fontWeight: '700', color: colors.textMuted },
  progressTrack: { height: 8, borderRadius: radius.full, backgroundColor: colors.border, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: radius.full, backgroundColor: colors.primary },
  goalSub: { ...typography.caption, color: colors.textSecondary, marginTop: spacing.sm },
  card: { backgroundColor: colors.glassFill, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.lg, ...shadow.card },
  sectionTitle: { ...typography.h3, marginBottom: spacing.md },
  checkinRow: { flexDirection: 'row', gap: spacing.sm },
  checkinBtn: {
    flex: 1,
    backgroundColor: colors.primaryLight,
    borderRadius: radius.md,
    paddingVertical: 20,
    alignItems: 'center',
    gap: spacing.xs,
    borderWidth: 1.5,
    borderColor: colors.glassBorder,
  },
  checkinBtnSelected: {
    borderColor: colors.primary,
    ...shadow.button,
  },
  checkinLabel: { fontSize: 15, fontWeight: '700', color: colors.primaryDark },
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
  feedCard: { backgroundColor: colors.glassFill, borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.sm, ...shadow.card },
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  gymRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 },
  dotSep: { ...typography.caption, color: colors.textMuted, marginHorizontal: 1 },
  eventAvatar: { width: 44, height: 44, borderRadius: radius.full, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center', marginRight: spacing.sm },
  eventEmoji: { fontSize: 18 },
  headerText: { flex: 1 },
  feedName: { ...typography.bodyBold, fontSize: 16 },
  gym: { ...typography.caption, flexShrink: 1 },
  time: { ...typography.caption, fontSize: 12 },
  note: { ...typography.body, color: colors.textSecondary, fontStyle: 'italic', marginTop: spacing.sm, marginLeft: 56 },
  kudos: { alignItems: 'center', justifyContent: 'center', minWidth: 48, paddingVertical: spacing.xs, borderRadius: radius.md },
  kudosActive: { backgroundColor: colors.primaryLight },
  kudosCount: { fontSize: 12, fontWeight: '700', color: colors.textMuted, marginTop: 1 },
  kudosCountActive: { color: colors.primaryDark },
  signOutButton: { marginTop: spacing.xl, alignItems: 'center' },
  signOutText: { color: colors.danger, fontSize: 14, fontWeight: '600' },
});

export default HomeScreen;
