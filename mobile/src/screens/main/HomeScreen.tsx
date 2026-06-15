import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { createCheckin } from '@/store/slices/checkinSlice';
import { signOut } from '@/store/slices/authSlice';

const HomeScreen = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const { isLoading } = useAppSelector((state) => state.checkin);
  const [gymName, setGymName] = useState(user?.homeGymName || '');
  const [note, setNote] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleCheckin = async () => {
    if (!user) return;
    await dispatch(createCheckin({ userId: user.id, gymName: gymName || undefined, note: note || undefined }));
    setNote('');
    setSubmitted(true);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.greeting}>Hey {user?.displayName} 👋</Text>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{user?.streakCount ?? 0}</Text>
          <Text style={styles.statLabel}>Current Streak</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{user?.longestStreak ?? 0}</Text>
          <Text style={styles.statLabel}>Longest Streak</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Check In</Text>
      <TextInput
        style={styles.input}
        placeholder="Gym name"
        value={gymName}
        onChangeText={setGymName}
      />
      <TextInput
        style={styles.input}
        placeholder="Add a note (optional)"
        value={note}
        onChangeText={setNote}
      />

      <TouchableOpacity style={styles.button} onPress={handleCheckin} disabled={isLoading}>
        {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Check In</Text>}
      </TouchableOpacity>

      {submitted && <Text style={styles.success}>Checked in! 💪</Text>}

      <TouchableOpacity style={styles.signOutButton} onPress={() => dispatch(signOut())}>
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 16 },
  greeting: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  statCard: {
    flex: 1,
    backgroundColor: '#F2F5FA',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statValue: { fontSize: 28, fontWeight: 'bold', color: '#4A90E2' },
  statLabel: { fontSize: 13, color: '#666', marginTop: 4 },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 12 },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#4A90E2',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  success: { color: '#2E7D32', textAlign: 'center', marginTop: 12, fontSize: 14 },
  signOutButton: { marginTop: 32, alignItems: 'center' },
  signOutText: { color: '#D0021B', fontSize: 14 },
});

export default HomeScreen;
