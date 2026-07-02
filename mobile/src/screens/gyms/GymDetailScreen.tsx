import React, { useCallback, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import QRCode from 'react-native-qrcode-svg';
import { RootStackParamList } from '@/navigation/types';
import apiService from '@/services/apiService';
import { Gym, RosterEntry, LeaderboardEntry } from '@/types';
import { getCurrentCoords } from '@/utils/location';
import { useAppSelector } from '@/store/hooks';
import Avatar from '@/components/Avatar';
import { spacing, radius, ThemeColors, Typography, Shadow } from '@/utils/theme';
import { useTheme, useThemedStyles } from '@/theme/ThemeContext';

type Props = NativeStackScreenProps<RootStackParamList, 'GymDetail'>;

const MEDALS = ['🥇', '🥈', '🥉'];

const GymDetailScreen = ({ route, navigation }: Props) => {
  const { gymId } = route.params;
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const me = useAppSelector((s) => s.auth.user);

  const [gym, setGym] = useState<Gym | null>(null);
  const [roster, setRoster] = useState<RosterEntry[]>([]);
  const [board, setBoard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showQr, setShowQr] = useState(false);
  const [checkingIn, setCheckingIn] = useState(false);
  const [requested, setRequested] = useState<Record<string, boolean>>({});

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([
      apiService.getGym(gymId),
      apiService.getGymRoster(gymId),
      apiService.getGymLeaderboard(gymId),
    ])
      .then(([g, r, b]) => { setGym(g); setRoster(r); setBoard(b); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [gymId]);

  useFocusEffect(load);

  const checkIn = async () => {
    if (!gym) return;
    setCheckingIn(true);
    try {
      const coords = await getCurrentCoords();
      const res = await apiService.checkinViaQr(gym.qrToken, coords.lat, coords.lng);
      Alert.alert(res.verified ? 'Checked in ✅' : 'Not quite there', res.message);
      if (res.verified) load();
    } catch (e: any) {
      Alert.alert('Check-in failed', e?.response?.data?.message || e.message || 'Try again.');
    } finally {
      setCheckingIn(false);
    }
  };

  const toggleMembership = async () => {
    if (!gym) return;
    try {
      if (gym.member) await apiService.leaveGym(gym.id);
      else await apiService.joinGym(gym.id);
      load();
    } catch {
      Alert.alert('Something went wrong', 'Please try again.');
    }
  };

  const addFriend = async (userId: string) => {
    if (!me) return;
    try {
      await apiService.sendFriendRequest(me.id, userId);
      setRequested((r) => ({ ...r, [userId]: true }));
    } catch {
      setRequested((r) => ({ ...r, [userId]: true })); // request may already exist — treat as sent
    }
  };

  if (loading && !gym) {
    return <View style={styles.center}><ActivityIndicator color={colors.primary} /></View>;
  }
  if (!gym) {
    return <View style={styles.center}><Text style={styles.muted}>Could not load this gym.</Text></View>;
  }

  const hereNow = roster.filter((r) => r.hereNow);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerCard}>
        <Text style={styles.name}>{gym.name}</Text>
        {gym.address ? <Text style={styles.address}>{gym.address}</Text> : null}
        <View style={styles.metaRow}>
          <Text style={styles.metaChip}>{gym.memberCount} member{gym.memberCount === 1 ? '' : 's'}</Text>
          {gym.hereNowCount > 0 && <Text style={[styles.metaChip, styles.hereChip]}>🟢 {gym.hereNowCount} here now</Text>}
          {gym.locationStatus === 'PROVISIONAL' && <Text style={styles.metaChip}>📍 unverified location</Text>}
        </View>
      </View>

      <TouchableOpacity
        style={[styles.primaryBtn, checkingIn && styles.btnDisabled]}
        onPress={checkIn}
        disabled={checkingIn}
        activeOpacity={0.85}
      >
        {checkingIn ? <ActivityIndicator color={colors.white} /> : <Text style={styles.primaryBtnText}>📍 Check in here</Text>}
      </TouchableOpacity>

      <View style={styles.rowBtns}>
        <TouchableOpacity style={styles.secondaryBtn} onPress={toggleMembership} activeOpacity={0.85}>
          <Text style={styles.secondaryBtnText}>{gym.member ? 'Leave gym' : 'Join gym'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryBtn} onPress={() => setShowQr((v) => !v)} activeOpacity={0.85}>
          <Text style={styles.secondaryBtnText}>{showQr ? 'Hide QR' : 'Show QR'}</Text>
        </TouchableOpacity>
      </View>

      {showQr && (
        <View style={styles.qrCard}>
          <QRCode value={`gymconnect://gym/${gym.qrToken}`} size={180} backgroundColor="white" />
          <Text style={styles.qrHint}>Others scan this to join & check in</Text>
          <Text style={styles.qrCode}>{gym.qrToken}</Text>
        </View>
      )}

      {hereNow.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Here now 🟢</Text>
          {hereNow.map((r) => (
            <RosterRow key={r.userId} entry={r} me={me?.id} requested={requested} onAddFriend={addFriend} onOpen={() => navigation.navigate('ProfileDetail', { userId: r.userId })} styles={styles} />
          ))}
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Members</Text>
        {roster.length === 0 ? (
          <Text style={styles.muted}>No visible members yet.</Text>
        ) : (
          roster.map((r) => (
            <RosterRow key={r.userId} entry={r} me={me?.id} requested={requested} onAddFriend={addFriend} onOpen={() => navigation.navigate('ProfileDetail', { userId: r.userId })} styles={styles} />
          ))
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>This week's leaderboard</Text>
        {board.length === 0 ? (
          <Text style={styles.muted}>No check-ins yet this week.</Text>
        ) : (
          board.map((entry, i) => (
            <View key={entry.userId} style={styles.lbRow}>
              <Text style={styles.lbRank}>{i < 3 ? MEDALS[i] : `#${i + 1}`}</Text>
              <Avatar displayName={entry.displayName} photoUrl={entry.photoUrl} size={32} style={styles.lbAvatar} />
              <Text style={styles.lbName}>{entry.displayName}{entry.userId === me?.id ? ' (you)' : ''}</Text>
              <Text style={styles.lbCount}>{entry.checkinsThisWeek}</Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
};

const RosterRow = ({ entry, me, requested, onAddFriend, onOpen, styles }: any) => (
  <View style={styles.rosterRow}>
    <TouchableOpacity style={styles.rosterMain} onPress={onOpen} activeOpacity={0.7}>
      <Avatar displayName={entry.displayName} photoUrl={entry.photoUrl} size={36} style={styles.lbAvatar} />
      <View>
        <Text style={styles.rosterName}>{entry.displayName}{entry.userId === me ? ' (you)' : ''}</Text>
        <Text style={styles.rosterMeta}>🔥 {entry.streakCount} wk{entry.hereNow ? ' · here now' : ''}</Text>
      </View>
    </TouchableOpacity>
    {entry.userId !== me && (
      <TouchableOpacity
        style={styles.addFriendBtn}
        onPress={() => onAddFriend(entry.userId)}
        disabled={requested[entry.userId]}
      >
        <Text style={styles.addFriendText}>{requested[entry.userId] ? 'Requested' : '＋ Add'}</Text>
      </TouchableOpacity>
    )}
  </View>
);

const createStyles = (colors: ThemeColors, typography: Typography, shadow: Shadow) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
  muted: { ...typography.caption },
  headerCard: {
    backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg,
    marginBottom: spacing.md, ...shadow.card,
  },
  name: { ...typography.h2 },
  address: { ...typography.caption, marginTop: spacing.xs },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.md },
  metaChip: {
    ...typography.caption, backgroundColor: colors.background, color: colors.textSecondary,
    borderRadius: radius.full, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, overflow: 'hidden',
  },
  hereChip: { color: colors.primaryDark, backgroundColor: colors.primaryLight },
  primaryBtn: { backgroundColor: colors.primary, borderRadius: radius.sm, padding: 16, alignItems: 'center', ...shadow.button },
  btnDisabled: { opacity: 0.5 },
  primaryBtnText: { color: colors.white, fontSize: 16, fontWeight: '700' },
  rowBtns: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  secondaryBtn: {
    flex: 1, backgroundColor: colors.surface, borderRadius: radius.sm, paddingVertical: 14,
    alignItems: 'center', borderWidth: 1, borderColor: colors.border,
  },
  secondaryBtnText: { color: colors.text, fontWeight: '700', fontSize: 14 },
  qrCard: {
    backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg,
    alignItems: 'center', marginTop: spacing.md, ...shadow.card,
  },
  qrHint: { ...typography.caption, marginTop: spacing.md },
  qrCode: { ...typography.caption, color: colors.textMuted, marginTop: spacing.xs },
  section: {
    backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md,
    marginTop: spacing.md, ...shadow.card,
  },
  sectionTitle: { ...typography.h3, marginBottom: spacing.sm },
  rosterRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm },
  rosterMain: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  rosterName: { ...typography.bodyBold },
  rosterMeta: { ...typography.caption, marginTop: 2 },
  addFriendBtn: { backgroundColor: colors.background, borderRadius: radius.full, paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderWidth: 1, borderColor: colors.border },
  addFriendText: { fontSize: 12, fontWeight: '700', color: colors.primary },
  lbRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm },
  lbRank: { width: 34, fontSize: 15, fontWeight: '800', color: colors.textMuted },
  lbAvatar: { marginRight: spacing.sm },
  lbName: { ...typography.bodyBold, flex: 1 },
  lbCount: { fontSize: 18, fontWeight: '800', color: colors.primary },
});

export default GymDetailScreen;
