import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '@/navigation/types';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { signUp, clearError } from '@/store/slices/authSlice';
import ScreenBackground from '@/components/ScreenBackground';
import Icon from '@/components/Icon';
import { spacing, radius, ThemeColors, Typography, Shadow } from '@/utils/theme';
import { useTheme, useThemedStyles } from '@/theme/ThemeContext';

type Props = NativeStackScreenProps<AuthStackParamList, 'SignUp'>;

const SignUpScreen = ({ navigation }: Props) => {
  const dispatch = useAppDispatch();
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const { isLoading, error } = useAppSelector((state) => state.auth);
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignUp = () => {
    dispatch(clearError());
    dispatch(signUp({ email, password, displayName }));
  };

  return (
    <ScreenBackground plain>
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.logoCircle}>
          <Icon name="arm-flex" size={30} color={colors.primary} />
        </View>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Join friends. Build streaks. Show up.</Text>

        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.error}>{error}</Text>
          </View>
        )}

        <View style={styles.card}>
          <Text style={styles.label}>Display Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Alex Johnson"
            placeholderTextColor={colors.textMuted}
            value={displayName}
            onChangeText={setDisplayName}
            autoCapitalize="words"
          />
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="you@example.com"
            placeholderTextColor={colors.textMuted}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            placeholderTextColor={colors.textMuted}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity style={styles.button} onPress={handleSignUp} disabled={isLoading} activeOpacity={0.85}>
            {isLoading ? <ActivityIndicator color={colors.white} /> : <Text style={styles.buttonText}>Sign Up</Text>}
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.link}>
            Already have an account? <Text style={styles.linkBold}>Log in</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
    </ScreenBackground>
  );
};

const createStyles = (colors: ThemeColors, typography: Typography, shadow: Shadow) => StyleSheet.create({
  flex: { flex: 1, backgroundColor: 'transparent' },
  container: { flexGrow: 1, justifyContent: 'center', padding: spacing.lg },
  logoCircle: {
    width: 64,
    height: 64,
    borderRadius: radius.full,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  logoEmoji: { fontSize: 30 },
  title: { ...typography.h1, textAlign: 'center', marginBottom: spacing.xs },
  subtitle: { ...typography.body, color: colors.textSecondary, textAlign: 'center', marginBottom: spacing.lg },
  errorBox: {
    backgroundColor: colors.dangerBg,
    borderRadius: radius.sm,
    padding: spacing.sm,
    marginBottom: spacing.md,
  },
  error: { color: colors.danger, textAlign: 'center', fontSize: 13, fontWeight: '600' },
  card: {
    backgroundColor: colors.glassFill,
    borderRadius: radius.lg,
    padding: spacing.lg,
    ...shadow.card,
  },
  label: { ...typography.label, marginBottom: spacing.xs, marginTop: spacing.sm },
  input: {
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderRadius: radius.sm,
    padding: 14,
    fontSize: 16,
    backgroundColor: colors.glassFill,
    color: colors.text,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
    padding: 16,
    alignItems: 'center',
    marginTop: spacing.lg,
    ...shadow.button,
  },
  buttonText: { color: colors.white, fontSize: 16, fontWeight: '700' },
  link: { color: colors.textSecondary, textAlign: 'center', marginTop: spacing.lg, fontSize: 14 },
  linkBold: { color: colors.primary, fontWeight: '700' },
});

export default SignUpScreen;
