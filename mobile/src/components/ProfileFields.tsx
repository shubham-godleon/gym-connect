import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Avatar from './Avatar';
import Icon from './Icon';
import WheelPicker from './WheelPicker';
import { WorkoutLocation } from '@/types';
import { pickAvatar } from '@/utils/photo';
import { spacing, radius, ThemeColors, Typography } from '@/utils/theme';
import { useTheme, useThemedStyles } from '@/theme/ThemeContext';

const LOCATION_OPTIONS: { value: WorkoutLocation; label: string }[] = [
  { value: 'GYM', label: '🏋️ Gym' },
  { value: 'HOME', label: '🏠 Home' },
  { value: 'BOTH', label: '🔁 Both' },
];

const HOURS = Array.from({ length: 12 }, (_, i) => String(i + 1));
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));
const PERIODS = ['AM', 'PM'];

function parseTime(time: string): { hourIndex: number; minuteIndex: number; periodIndex: number } {
  const [h, m] = time.split(':').map(Number);
  const period = h >= 12 ? 1 : 0;
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return { hourIndex: hour12 - 1, minuteIndex: m, periodIndex: period };
}

function buildTime(hourIndex: number, minuteIndex: number, periodIndex: number): string {
  let hour = hourIndex + 1;
  if (periodIndex === 1 && hour !== 12) hour += 12;
  if (periodIndex === 0 && hour === 12) hour = 0;
  return `${String(hour).padStart(2, '0')}:${String(minuteIndex).padStart(2, '0')}:00`;
}

const GOAL_OPTIONS = [1, 2, 3, 4, 5, 6, 7];

export interface ProfileFieldsValue {
  displayName: string;
  photoUri?: string; // local preview uri
  photoBase64?: string; // pending upload, set only when a new photo was picked
  workoutLocation: WorkoutLocation;
  preferredWorkoutTime?: string; // "HH:mm:ss" or undefined for no reminder
  weeklyGoal: number; // distinct days/week target, 1-7 (mandatory, no skip)
}

interface Props {
  value: ProfileFieldsValue;
  onChange: (value: ProfileFieldsValue) => void;
  hidePhoto?: boolean; // Edit Profile renders its own photo hero
}

const ProfileFields = ({ value, onChange, hidePhoto }: Props) => {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);

  const changePhoto = async () => {
    const picked = await pickAvatar();
    if (picked) onChange({ ...value, photoUri: picked.uri, photoBase64: picked.base64 });
  };

  return (
    <View>
      {!hidePhoto && (
        <TouchableOpacity onPress={changePhoto} style={styles.photoRow} activeOpacity={0.8}>
          <View>
            <Avatar displayName={value.displayName} photoUrl={value.photoUri} size={88} />
            <View style={styles.cameraBadge}>
              <Icon name="camera" size={13} color={colors.white} />
            </View>
          </View>
          <Text style={styles.photoLabel}>Change photo</Text>
        </TouchableOpacity>
      )}

      <Text style={styles.label}>How many days a week is your goal?</Text>
      <View style={styles.row}>
        {GOAL_OPTIONS.map((n) => (
          <TouchableOpacity
            key={n}
            style={[styles.chip, value.weeklyGoal === n && styles.chipActive]}
            onPress={() => onChange({ ...value, weeklyGoal: n })}
          >
            <Text style={[styles.chipText, value.weeklyGoal === n && styles.chipTextActive]}>{n}x</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Where do you usually work out?</Text>
      <View style={styles.row}>
        {LOCATION_OPTIONS.map((opt) => (
          <TouchableOpacity
            key={opt.value}
            style={[styles.chip, value.workoutLocation === opt.value && styles.chipActive]}
            onPress={() => onChange({ ...value, workoutLocation: opt.value })}
          >
            <Text style={[styles.chipText, value.workoutLocation === opt.value && styles.chipTextActive]}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Remind me before my workout</Text>
      <View style={styles.row}>
        <TouchableOpacity
          style={[styles.chip, !value.preferredWorkoutTime && styles.chipActive]}
          onPress={() => onChange({ ...value, preferredWorkoutTime: undefined })}
        >
          <Text style={[styles.chipText, !value.preferredWorkoutTime && styles.chipTextActive]}>No reminder</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.chip, !!value.preferredWorkoutTime && styles.chipActive]}
          onPress={() => onChange({ ...value, preferredWorkoutTime: value.preferredWorkoutTime || '07:00:00' })}
        >
          <Text style={[styles.chipText, !!value.preferredWorkoutTime && styles.chipTextActive]}>Set a time</Text>
        </TouchableOpacity>
      </View>

      {value.preferredWorkoutTime && (
        <WheelTimePicker
          time={value.preferredWorkoutTime}
          onChange={(time) => onChange({ ...value, preferredWorkoutTime: time })}
        />
      )}
    </View>
  );
};

interface WheelTimePickerProps {
  time: string;
  onChange: (time: string) => void;
}

const WheelTimePicker = ({ time, onChange }: WheelTimePickerProps) => {
  const styles = useThemedStyles(createStyles);
  const { hourIndex, minuteIndex, periodIndex } = parseTime(time);

  return (
    <View style={styles.wheelRow}>
      <WheelPicker data={HOURS} selectedIndex={hourIndex} onChange={(i) => onChange(buildTime(i, minuteIndex, periodIndex))} />
      <Text style={styles.wheelColon}>:</Text>
      <WheelPicker data={MINUTES} selectedIndex={minuteIndex} onChange={(i) => onChange(buildTime(hourIndex, i, periodIndex))} />
      <WheelPicker
        data={PERIODS}
        selectedIndex={periodIndex}
        onChange={(i) => onChange(buildTime(hourIndex, minuteIndex, i))}
        width={56}
      />
    </View>
  );
};

const createStyles = (colors: ThemeColors, typography: Typography) => StyleSheet.create({
  photoRow: { alignItems: 'center', marginBottom: spacing.lg },
  photoLabel: { ...typography.caption, marginTop: spacing.sm, color: colors.primary, fontWeight: '700' },
  cameraBadge: {
    position: 'absolute', bottom: 0, right: 0,
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: colors.surface,
  },
  label: { ...typography.label, marginBottom: spacing.sm, marginTop: spacing.md },
  row: { flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' },
  wheelRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: spacing.md, gap: spacing.xs },
  wheelColon: { ...typography.h2, marginHorizontal: 2 },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.glassFill,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    marginRight: spacing.sm,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { ...typography.caption, fontWeight: '600' },
  chipTextActive: { color: colors.white },
});

export default ProfileFields;
