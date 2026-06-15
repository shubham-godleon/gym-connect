import React, { useCallback, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchFeed, toggleReaction } from '@/store/slices/checkinSlice';
import { Checkin } from '@/types';

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
      <TouchableOpacity onPress={() => navigation.navigate('ProfileDetail', { userId: item.userId })}>
        <Text style={styles.name}>{item.displayName}</Text>
      </TouchableOpacity>
      <Text style={styles.gym}>checked in at {item.gymName}</Text>
      {item.note ? <Text style={styles.note}>{item.note}</Text> : null}
      <Text style={styles.time}>{new Date(item.createdAt).toLocaleString()}</Text>

      <TouchableOpacity style={styles.reaction} onPress={() => handleReact(item.id)}>
        <Text style={[styles.reactionText, item.reactedByMe && styles.reactionActive]}>
          {item.reactedByMe ? '🔥' : '🤍'} {item.reactionCount}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <FlatList
      style={styles.container}
      data={feed}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={load} />}
      ListEmptyComponent={
        <View style={styles.empty}>
          <Text>No activity yet. Check in to get started!</Text>
        </View>
      }
      contentContainerStyle={feed.length === 0 ? styles.emptyContainer : undefined}
    />
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  card: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  name: { fontSize: 16, fontWeight: '600' },
  gym: { fontSize: 14, color: '#444', marginTop: 2 },
  note: { fontSize: 14, color: '#666', marginTop: 4, fontStyle: 'italic' },
  time: { fontSize: 12, color: '#999', marginTop: 6 },
  reaction: { marginTop: 8, alignSelf: 'flex-start' },
  reactionText: { fontSize: 14, color: '#666' },
  reactionActive: { color: '#E2734A', fontWeight: '600' },
  empty: { alignItems: 'center', padding: 32 },
  emptyContainer: { flexGrow: 1, justifyContent: 'center' },
});

export default FeedScreen;
