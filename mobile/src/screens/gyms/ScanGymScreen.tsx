import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import apiService from '@/services/apiService';
import { getCurrentCoords } from '@/utils/location';
import { GymCheckinResult } from '@/types';
import ScreenBackground from '@/components/ScreenBackground';
import { spacing, radius, ThemeColors, Typography, Shadow } from '@/utils/theme';
import { useTheme, useThemedStyles } from '@/theme/ThemeContext';

// Accepts a raw token or a deep link like gymconnect://gym/<token>.
function extractToken(scanned: string): string {
  const trimmed = scanned.trim();
  const marker = '/gym/';
  const idx = trimmed.indexOf(marker);
  return idx >= 0 ? trimmed.slice(idx + marker.length).replace(/[/?#].*$/, '') : trimmed;
}

const ScanGymScreen = () => {
  const navigation = useNavigation<any>();
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);

  const [permission, requestPermission] = useCameraPermissions();
  const [manualCode, setManualCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<GymCheckinResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [scannedOnce, setScannedOnce] = useState(false);

  const isWeb = Platform.OS === 'web';

  const doCheckin = async (token: string) => {
    if (!token) return;
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      const coords = await getCurrentCoords();
      const res = await apiService.checkinViaQr(token, coords.lat, coords.lng);
      setResult(res);
    } catch (e: any) {
      setError(e?.response?.data?.message || e.message || 'Check-in failed. Try again.');
      setScannedOnce(false); // allow re-scan after an error
    } finally {
      setBusy(false);
    }
  };

  const onBarcodeScanned = ({ data }: { data: string }) => {
    if (scannedOnce || busy) return;
    setScannedOnce(true);
    doCheckin(extractToken(data));
  };

  // Result screen (success or "too far")
  if (result) {
    return (
      <ScreenBackground plain>
      <View style={styles.center}>
        <Text style={styles.resultEmoji}>{result.verified ? '✅' : '📍'}</Text>
        <Text style={styles.resultTitle}>{result.verified ? 'Checked in!' : 'Not quite there'}</Text>
        <Text style={styles.resultMsg}>{result.message}</Text>
        <TouchableOpacity style={styles.primaryBtn} onPress={() => navigation.goBack()} activeOpacity={0.85}>
          <Text style={styles.primaryBtnText}>Done</Text>
        </TouchableOpacity>
        {!result.verified && (
          <TouchableOpacity onPress={() => { setResult(null); setScannedOnce(false); }}>
            <Text style={styles.link}>Try again</Text>
          </TouchableOpacity>
        )}
      </View>
      </ScreenBackground>
    );
  }

  return (
    <ScreenBackground plain>
    <View style={styles.container}>
      {!isWeb && permission?.granted && (
        <View style={styles.cameraWrap}>
          <CameraView
            style={styles.camera}
            barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
            onBarcodeScanned={onBarcodeScanned}
          />
          <Text style={styles.scanHint}>Point at the gym's QR code</Text>
        </View>
      )}

      {!isWeb && !permission?.granted && (
        <TouchableOpacity style={styles.permBtn} onPress={requestPermission} activeOpacity={0.85}>
          <Text style={styles.permBtnText}>📷 Enable camera to scan</Text>
        </TouchableOpacity>
      )}

      <View style={styles.manualBox}>
        <Text style={styles.manualLabel}>{isWeb ? 'Enter the gym code' : 'Or enter the gym code'}</Text>
        <TextInput
          style={styles.input}
          placeholder="Gym code"
          placeholderTextColor={colors.textMuted}
          value={manualCode}
          onChangeText={setManualCode}
          autoCapitalize="none"
        />
        <TouchableOpacity
          style={[styles.primaryBtn, (busy || !manualCode.trim()) && styles.btnDisabled]}
          onPress={() => doCheckin(extractToken(manualCode))}
          disabled={busy || !manualCode.trim()}
          activeOpacity={0.85}
        >
          {busy ? <ActivityIndicator color={colors.white} /> : <Text style={styles.primaryBtnText}>Check in</Text>}
        </TouchableOpacity>
        {error && <Text style={styles.error}>{error}</Text>}
      </View>
    </View>
    </ScreenBackground>
  );
};

const createStyles = (colors: ThemeColors, typography: Typography, shadow: Shadow) => StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent', padding: spacing.lg },
  center: { flex: 1, backgroundColor: 'transparent', alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
  cameraWrap: { alignItems: 'center', marginBottom: spacing.lg },
  camera: { width: '100%', aspectRatio: 1, borderRadius: radius.lg, overflow: 'hidden' },
  scanHint: { ...typography.caption, marginTop: spacing.sm },
  permBtn: {
    backgroundColor: colors.glassFill, borderRadius: radius.sm, padding: 16,
    alignItems: 'center', borderWidth: 1, borderColor: colors.border, marginBottom: spacing.lg,
  },
  permBtnText: { color: colors.text, fontWeight: '700' },
  manualBox: { marginTop: spacing.sm },
  manualLabel: { ...typography.label, marginBottom: spacing.sm },
  input: {
    borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm,
    padding: 14, fontSize: 16, backgroundColor: colors.glassFill, color: colors.text, marginBottom: spacing.sm,
  },
  primaryBtn: {
    backgroundColor: colors.primary, borderRadius: radius.sm, padding: 16,
    alignItems: 'center', ...shadow.button,
  },
  btnDisabled: { opacity: 0.5 },
  primaryBtnText: { color: colors.white, fontSize: 16, fontWeight: '700' },
  error: { color: colors.danger, marginTop: spacing.md, textAlign: 'center', fontWeight: '600' },
  resultEmoji: { fontSize: 56, marginBottom: spacing.md },
  resultTitle: { ...typography.h1, fontSize: 24, marginBottom: spacing.sm },
  resultMsg: { ...typography.body, color: colors.textSecondary, textAlign: 'center', marginBottom: spacing.xl },
  link: { color: colors.primary, fontWeight: '700', marginTop: spacing.md },
});

export default ScanGymScreen;
