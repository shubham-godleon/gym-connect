import React, { useCallback, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import apiService from '@/services/apiService';
import { Gym } from '@/types';
import Icon from '@/components/Icon';
import ScreenBackground from '@/components/ScreenBackground';
import { spacing, radius, ThemeColors, Typography, Shadow } from '@/utils/theme';
import { useTheme, useThemedStyles } from '@/theme/ThemeContext';

const GymsScreen = () => {
  const navigation = useNavigation<any>();
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const insets = useSafeAreaInsets();
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    apiService.getMyGyms().then(setGyms).catch(() => {}).finally(() => setLoading(false));
  }, []);

  useFocusEffect(load);

  const renderGym = ({ item }: { item: Gym }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.8}
      onPress={() => navigation.navigate('GymDetail', { gymId: item.id })}
    >
      <View style={styles.cardMain}>
        <Text style={styles.gymName}>{item.name}</Text>
        {item.address ? <Text style={styles.gymAddress} numberOfLines={1}>{item.address}</Text> : null}
        <Text style={styles.gymMeta}>{item.memberCount} member{item.memberCount === 1 ? '' : 's'}</Text>
      </View>
      {item.hereNowCount > 0 && (
        <View style={styles.herePill}>
          <View style={styles.hereDot} />
          <Text style={styles.hereText}>{item.hereNowCount} here now</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <ScreenBackground plain>
      <View style={[styles.actions, { paddingTop: insets.top + spacing.sm }]}>
        <TouchableOpacity style={styles.primaryBtn} onPress={() => navigation.navigate('ScanGym')} activeOpacity={0.85}>
          <Icon name="qrcode-scan" size={18} color={colors.white} />
          <Text style={styles.primaryBtnText}>Scan to check in</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryBtn} onPress={() => navigation.navigate('AddGym')} activeOpacity={0.85}>
          <Icon name="map-marker-plus" size={18} color={colors.primary} />
          <Text style={styles.secondaryBtnText}>Find a gym</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={gyms}
        keyExtractor={(g) => g.id}
        renderItem={renderGym}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={colors.primary} />}
        ListHeaderComponent={gyms.length > 0 ? <Text style={styles.sectionTitle}>Your gyms</Text> : null}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Icon name="dumbbell" size={44} color={colors.textMuted} style={{ marginBottom: spacing.sm }} />
            <Text style={styles.emptyText}>You haven't joined a gym yet.</Text>
            <Text style={styles.emptySub}>Scan a gym's QR or find one nearby to join its community.</Text>
          </View>
        }
      />
    </ScreenBackground>
  );
};

const createStyles = (colors: ThemeColors, typography: Typography, shadow: Shadow) => StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  actions: { flexDirection: 'row', gap: spacing.sm, padding: spacing.md },
  primaryBtn: {
    flex: 1, flexDirection: 'row', gap: spacing.sm, backgroundColor: colors.primary, borderRadius: radius.md,
    paddingVertical: 14, alignItems: 'center', justifyContent: 'center', ...shadow.button,
  },
  primaryBtnText: { color: colors.white, fontWeight: '700', fontSize: 14 },
  secondaryBtn: {
    flex: 1, flexDirection: 'row', gap: spacing.sm, backgroundColor: colors.glassFill, borderRadius: radius.md,
    paddingVertical: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.glassBorder,
  },
  secondaryBtnText: { color: colors.text, fontWeight: '700', fontSize: 14 },
  list: { paddingHorizontal: spacing.md, paddingBottom: 110 },
  sectionTitle: { ...typography.h3, marginBottom: spacing.sm },
  card: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.glassFill, borderRadius: radius.lg,
    padding: spacing.md, marginBottom: spacing.sm, ...shadow.card,
  },
  cardMain: { flex: 1 },
  gymName: { ...typography.bodyBold },
  gymAddress: { ...typography.caption, marginTop: 2 },
  gymMeta: { ...typography.caption, color: colors.textMuted, marginTop: 2 },
  herePill: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.xs,
    backgroundColor: colors.primaryLight, borderRadius: radius.full,
    paddingHorizontal: spacing.sm, paddingVertical: spacing.xs,
  },
  hereDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.success },
  hereText: { fontSize: 12, fontWeight: '700', color: colors.primaryDark },
  empty: { alignItems: 'center', padding: spacing.xxl },
  emptyEmoji: { fontSize: 44, marginBottom: spacing.sm },
  emptyText: { ...typography.bodyBold, marginBottom: spacing.xs },
  emptySub: { ...typography.caption, textAlign: 'center' },
});

export default GymsScreen;
