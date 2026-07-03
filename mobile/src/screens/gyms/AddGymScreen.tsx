import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import apiService from '@/services/apiService';
import { Gym } from '@/types';
import { getCurrentCoords, Coords } from '@/utils/location';
import ScreenBackground from '@/components/ScreenBackground';
import { spacing, radius, ThemeColors, Typography, Shadow } from '@/utils/theme';
import { useTheme, useThemedStyles } from '@/theme/ThemeContext';

const AddGymScreen = () => {
  const navigation = useNavigation<any>();
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);

  const [coords, setCoords] = useState<Coords | null>(null);
  const [locError, setLocError] = useState<string | null>(null);
  const [nearby, setNearby] = useState<Gym[]>([]);
  const [loadingNearby, setLoadingNearby] = useState(true);

  const [manualName, setManualName] = useState('');
  const [manualAddress, setManualAddress] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    getCurrentCoords()
      .then((c) => {
        setCoords(c);
        return apiService.getNearbyGyms(c.lat, c.lng);
      })
      .then((g) => setNearby(g))
      .catch((e) => setLocError(e.message || 'Could not get your location'))
      .finally(() => setLoadingNearby(false));
  }, []);

  const join = async (gym: Gym) => {
    try {
      await apiService.joinGym(gym.id);
      navigation.replace('GymDetail', { gymId: gym.id });
    } catch {
      Alert.alert('Could not join', 'Please try again.');
    }
  };

  const addManually = async () => {
    if (!coords) {
      Alert.alert('Location needed', 'We need your location to add a gym you\'re standing in.');
      return;
    }
    if (!manualName.trim()) {
      Alert.alert('Name required', 'Enter the gym name.');
      return;
    }
    setCreating(true);
    try {
      const gym = await apiService.createGym({
        source: 'MANUAL',
        name: manualName.trim(),
        address: manualAddress.trim() || undefined,
        lat: coords.lat,
        lng: coords.lng,
      });
      navigation.replace('GymDetail', { gymId: gym.id });
    } catch (e: any) {
      Alert.alert('Could not add gym', e?.response?.data?.message || 'Please try again.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <ScreenBackground plain>
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {locError && (
        <View style={styles.warnBox}>
          <Text style={styles.warnText}>{locError}</Text>
        </View>
      )}

      <Text style={styles.sectionTitle}>Gyms near you</Text>
      {loadingNearby ? (
        <ActivityIndicator color={colors.primary} style={{ marginVertical: spacing.lg }} />
      ) : nearby.length > 0 ? (
        nearby.map((g) => (
          <View key={g.id} style={styles.row}>
            <View style={styles.rowMain}>
              <Text style={styles.gymName}>{g.name}</Text>
              <Text style={styles.gymMeta}>
                {g.distanceMeters != null ? `${Math.round(g.distanceMeters)}m away · ` : ''}
                {g.memberCount} member{g.memberCount === 1 ? '' : 's'}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.joinBtn}
              onPress={() => (g.member ? navigation.replace('GymDetail', { gymId: g.id }) : join(g))}
            >
              <Text style={styles.joinBtnText}>{g.member ? 'Open' : 'Join'}</Text>
            </TouchableOpacity>
          </View>
        ))
      ) : (
        <Text style={styles.muted}>No gyms added near you yet. Add yours below.</Text>
      )}

      <View style={styles.divider} />

      <Text style={styles.sectionTitle}>Add your gym</Text>
      <Text style={styles.muted}>
        Add the gym you're standing in — we'll use your current location so people can check in here.
      </Text>
      <TextInput
        style={styles.input}
        placeholder="Gym name"
        placeholderTextColor={colors.textMuted}
        value={manualName}
        onChangeText={setManualName}
      />
      <TextInput
        style={styles.input}
        placeholder="Address (optional)"
        placeholderTextColor={colors.textMuted}
        value={manualAddress}
        onChangeText={setManualAddress}
      />
      <TouchableOpacity
        style={[styles.primaryBtn, (!coords || creating) && styles.btnDisabled]}
        onPress={addManually}
        disabled={!coords || creating}
        activeOpacity={0.85}
      >
        {creating ? <ActivityIndicator color={colors.white} /> : <Text style={styles.primaryBtnText}>Add this gym</Text>}
      </TouchableOpacity>
      {!coords && !locError && (
        <Text style={styles.muted}>Getting your location…</Text>
      )}
    </ScrollView>
    </ScreenBackground>
  );
};

const createStyles = (colors: ThemeColors, typography: Typography, shadow: Shadow) => StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  content: { padding: spacing.lg },
  sectionTitle: { ...typography.h3, marginBottom: spacing.sm },
  muted: { ...typography.caption, marginBottom: spacing.sm },
  warnBox: { backgroundColor: colors.dangerBg, borderRadius: radius.sm, padding: spacing.sm, marginBottom: spacing.md },
  warnText: { color: colors.danger, fontSize: 13, fontWeight: '600' },
  row: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.glassFill, borderRadius: radius.md,
    padding: spacing.md, marginBottom: spacing.sm, ...shadow.card,
  },
  rowMain: { flex: 1 },
  gymName: { ...typography.bodyBold },
  gymMeta: { ...typography.caption, color: colors.textMuted, marginTop: 2 },
  joinBtn: { backgroundColor: colors.primary, borderRadius: radius.sm, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  joinBtnText: { color: colors.white, fontWeight: '700', fontSize: 13 },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.lg },
  input: {
    borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm,
    padding: 14, marginBottom: spacing.sm, fontSize: 16,
    backgroundColor: colors.glassFill, color: colors.text,
  },
  primaryBtn: {
    backgroundColor: colors.primary, borderRadius: radius.sm, padding: 16,
    alignItems: 'center', marginTop: spacing.sm, ...shadow.button,
  },
  btnDisabled: { opacity: 0.5 },
  primaryBtnText: { color: colors.white, fontSize: 16, fontWeight: '700' },
});

export default AddGymScreen;
