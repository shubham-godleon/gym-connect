import React, { useCallback, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchFeed, toggleReaction } from '@/store/slices/checkinSlice';
import { Checkin } from '@/types';
import { colors, spacing, radius, typography, shadow } from '@/utils/theme';
import { timeAgo, initials } from '@/utils/format';

const FeedScreen = () => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation<any>();
  const user = useAppSelector((state) => state.auth.user);
  const { feed, isLoading } = useAppSelector((state) => state.checkin);

  const load = useCallback(() => {
    if (user) dispatch(fetchFeed(user.id));
  }, [dispatch, user]);

  useEffect(() => {
    load();
  }, [load]);

  const handleReact = (checkinId: string) => {
    if (!user) return;
    dispatch(toggleReaction({ checkinId, userId: user.id }));
  };

  const renderItem = ({ item }: { item: Checkin }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials(item.displayName)}</Text>
        </View>
        <View style={styles.headerText}>
          <TouchableOpacity onPress={() => navigation.navigate('ProfileDetail', { userId: item.userId })}>
            <Text style={styles.name}>{item.displayName}</Text>
          </TouchableOpacity>
          <Text style={styles.gym}>📍 {item.gymName}</Text>
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

  return (
    <FlatList
      style={styles.container}
      data={feed}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={load} tintColor={colors.primary} />}
      ListEmptyComponent={
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>📭</Text>
          <Text style={styles.emptyTitle}>No activity yet</Text>
          <Text style={styles.emptyText}>Check in to get the feed started!</Text>
        </View>
      }
      contentContainerStyle={feed.length === 0 ? styles.emptyContainer : styles.listContent}
    />
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  listContent: { padding: spacing.md, gap: spacing.md },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadow.card,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  avatarText: { color: colors.primaryDark, fontWeight: '700', fontSize: 14 },
  headerText: { flex: 1 },
  name: { ...typography.bodyBold },
  gym: { ...typography.caption, marginTop: 2 },
  time: { ...typography.caption, fontSize: 11 },
  note: {
    ...typography.body,
    color: colors.textSecondary,
    fontStyle: 'italic',
    marginTop: spacing.sm,
    marginLeft: 50,
  },
  reaction: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    marginLeft: 50,
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    backgroundColor: colors.background,
  },
  reactionActiveBg: { backgroundColor: colors.primaryLight },
  reactionEmoji: { fontSize: 14, marginRight: spacing.xs },
  reactionText: { fontSize: 13, color: colors.textSecondary, fontWeight: '600' },
  reactionActive: { color: colors.primaryDark },
  empty: { alignItems: 'center', padding: spacing.xxl },
  emptyEmoji: { fontSize: 40, marginBottom: spacing.sm },
  emptyTitle: { ...typography.h3, marginBottom: spacing.xs },
  emptyText: { ...typography.caption },
  emptyContainer: { flexGrow: 1, justifyContent: 'center' },
});

export default FeedScreen;
