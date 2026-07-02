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
import apiService from '@/services/apiService';
import { User } from '@/types';
import Avatar from '@/components/Avatar';
import { spacing, radius, ThemeColors, Typography, Shadow } from '@/utils/theme';
import { useTheme, useThemedStyles } from '@/theme/ThemeContext';

const FriendsScreen = () => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation<any>();
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const user = useAppSelector((state) => state.auth.user);
  const { friends, pendingRequests, isLoading } = useAppSelector((state) => state.friend);

  const [email, setEmail] = useState('');
  const [addStatus, setAddStatus] = useState<string | null>(null);
  const [addLoading, setAddLoading] = useState(false);

  const load = useCallback(() => {
    if (!user) return;
    dispatch(fetchFriends(user.id));
    dispatch(fetchPendingRequests(user.id));
  }, [dispatch, user]);

  useEffect(() => {
    load();
  }, [load]);

  const handleAddFriend = async () => {
    if (!user || !email.trim()) return;
    setAddLoading(true);
    setAddStatus(null);
    try {
      const target = await apiService.getUserByEmail(email.trim());
      await dispatch(sendFriendRequest({ requesterId: user.id, addresseeId: target.id })).unwrap();
      setAddStatus(`Request sent to ${target.displayName}`);
      setEmail('');
    } catch (err: any) {
      setAddStatus('Could not find user or request already exists');
    } finally {
      setAddLoading(false);
    }
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
        <Text style={styles.streak}>🔥 {item.streakCount}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <FlatList
      style={styles.container}
      data={friends}
      keyExtractor={(item) => item.id}
      renderItem={renderFriend}
      refreshing={isLoading}
      onRefresh={load}
      contentContainerStyle={styles.listContent}
      ListHeaderComponent={
        <View>
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Add a Friend</Text>
            <TextInput
              style={styles.input}
              placeholder="Friend's email"
              placeholderTextColor={colors.textMuted}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            <TouchableOpacity style={styles.button} onPress={handleAddFriend} disabled={addLoading} activeOpacity={0.85}>
              {addLoading ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={styles.buttonText}>Send Request</Text>
              )}
            </TouchableOpacity>
            {addStatus && <Text style={styles.status}>{addStatus}</Text>}
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
  );
};

const createStyles = (colors: ThemeColors, typography: Typography, shadow: Shadow) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  listContent: { padding: spacing.md },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadow.card,
  },
  sectionTitle: { ...typography.h3, marginBottom: spacing.md },
  listTitle: { ...typography.h3, marginBottom: spacing.sm, marginLeft: spacing.xs },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    padding: 14,
    marginBottom: spacing.sm,
    fontSize: 16,
    backgroundColor: colors.background,
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadow.card,
  },
  avatarMargin: { marginRight: spacing.sm },
  name: { ...typography.bodyBold, flex: 1 },
  streakPill: {
    backgroundColor: colors.background,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  streak: { fontSize: 13, color: colors.textSecondary, fontWeight: '600' },
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
