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

const FriendsScreen = () => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation<any>();
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
    <TouchableOpacity style={styles.row} onPress={() => navigation.navigate('ProfileDetail', { userId: item.id })}>
      <Text style={styles.name}>{item.displayName}</Text>
      <Text style={styles.streak}>🔥 {item.streakCount}</Text>
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
      ListHeaderComponent={
        <View>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Add a Friend</Text>
            <TextInput
              style={styles.input}
              placeholder="Friend's email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            <TouchableOpacity style={styles.button} onPress={handleAddFriend} disabled={addLoading}>
              {addLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Send Request</Text>}
            </TouchableOpacity>
            {addStatus && <Text style={styles.status}>{addStatus}</Text>}
          </View>

          {pendingRequests.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Pending Requests</Text>
              {pendingRequests.map((req) => (
                <View key={req.id} style={styles.requestRow}>
                  <Text style={styles.name}>Request from {req.requesterId}</Text>
                  <View style={styles.requestActions}>
                    <TouchableOpacity onPress={() => handleRespond(req.id, true)}>
                      <Text style={styles.accept}>Accept</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleRespond(req.id, false)}>
                      <Text style={styles.decline}>Decline</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}

          <Text style={styles.sectionTitle}>Friends</Text>
        </View>
      }
      ListEmptyComponent={
        <View style={styles.empty}>
          <Text>No friends yet. Add one above!</Text>
        </View>
      }
    />
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  section: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#eee' },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 8, paddingHorizontal: 16, marginTop: 8 },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#4A90E2',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  status: { marginTop: 8, color: '#666', fontSize: 13 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  name: { fontSize: 16, fontWeight: '500' },
  streak: { fontSize: 14, color: '#666' },
  requestRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  requestActions: { flexDirection: 'row', gap: 16 },
  accept: { color: '#2E7D32', fontWeight: '600' },
  decline: { color: '#D0021B', fontWeight: '600' },
  empty: { alignItems: 'center', padding: 32 },
});

export default FriendsScreen;
