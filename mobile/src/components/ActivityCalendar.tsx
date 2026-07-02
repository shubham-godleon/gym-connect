import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import apiService from '@/services/apiService';
import { CheckinDay } from '@/types';
import { spacing, radius, ThemeColors, Typography, Shadow } from '@/utils/theme';
import { useTheme, useThemedStyles } from '@/theme/ThemeContext';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

const MONTH_CELL = 38;
const MINI_CELL = 14;
const GAP = 4;

function levelColor(count: number, colors: ThemeColors): string {
  if (count >= 2) return colors.primary; // Molten Orange — hotter day
  if (count === 1) return colors.highlight; // Heatwave Amber — lighter
  return colors.border;
}

function levelTextColor(count: number, colors: ThemeColors): string {
  // Dark ink on the bright fire fills (both modes); themed text on empty cells.
  return count >= 1 ? colors.onAccent : colors.text;
}

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

interface MonthGridProps {
  year: number;
  month: number; // 0-11
  countByDate: Map<string, number>;
  cellSize: number;
  showNumbers: boolean;
  onSelectDate: (dateStr: string) => void;
}

const MonthGrid = ({ year, month, countByDate, cellSize, showNumbers, onSelectDate }: MonthGridProps) => {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const firstOfMonth = new Date(year, month, 1);
  const startDay = firstOfMonth.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (string | null)[] = Array(startDay).fill(null);
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(`${year}-${pad(month + 1)}-${pad(d)}`);
  }

  const containerWidth = 7 * cellSize + 6 * GAP;

  return (
    <View>
      {showNumbers && (
        <View style={[styles.weekLabels, { width: containerWidth, gap: GAP }]}>
          {DAY_LABELS.map((label, i) => (
            <Text key={i} style={[styles.weekLabel, { width: cellSize }]}>{label}</Text>
          ))}
        </View>
      )}
      <View style={[styles.grid, { width: containerWidth, gap: GAP }]}>
        {cells.map((dateStr, i) =>
          dateStr ? (
            <TouchableOpacity
              key={dateStr}
              style={[
                styles.cell,
                { width: cellSize, height: cellSize, backgroundColor: levelColor(countByDate.get(dateStr) || 0, colors) },
              ]}
              onPress={() => onSelectDate(dateStr)}
            >
              {showNumbers && (
                <Text style={[styles.cellText, { color: levelTextColor(countByDate.get(dateStr) || 0, colors) }]}>
                  {Number(dateStr.split('-')[2])}
                </Text>
              )}
            </TouchableOpacity>
          ) : (
            <View key={`empty-${i}`} style={{ width: cellSize, height: cellSize }} />
          )
        )}
      </View>
    </View>
  );
};

interface Props {
  userId: string;
}

const ActivityCalendar = ({ userId }: Props) => {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const today = new Date();
  const [mode, setMode] = useState<'month' | 'year'>('month');
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [days, setDays] = useState<CheckinDay[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selected, setSelected] = useState<CheckinDay | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setSelected(null);
    apiService
      .getCalendar(userId, year)
      .then(setDays)
      .finally(() => setIsLoading(false));
  }, [userId, year]);

  const countByDate = useMemo(() => {
    const map = new Map<string, number>();
    days.forEach((d) => map.set(d.date, d.count));
    return map;
  }, [days]);

  const monthTotal = useMemo(() => {
    const prefix = `${year}-${pad(month + 1)}`;
    return days.filter((d) => d.date.startsWith(prefix)).reduce((sum, d) => sum + d.count, 0);
  }, [days, year, month]);

  const yearTotal = useMemo(() => days.reduce((sum, d) => sum + d.count, 0), [days]);

  const handleSelectDate = (dateStr: string) => {
    setSelected({ date: dateStr, count: countByDate.get(dateStr) || 0 });
  };

  return (
    <View>
      <View style={styles.toggleRow}>
        <TouchableOpacity
          style={[styles.toggleButton, mode === 'month' && styles.toggleButtonActive]}
          onPress={() => setMode('month')}
        >
          <Text style={[styles.toggleText, mode === 'month' && styles.toggleTextActive]}>Month</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleButton, mode === 'year' && styles.toggleButtonActive]}
          onPress={() => setMode('year')}
        >
          <Text style={[styles.toggleText, mode === 'year' && styles.toggleTextActive]}>Year</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        {isLoading ? (
          <ActivityIndicator color={colors.primary} />
        ) : mode === 'month' ? (
          <View>
            <View style={styles.header}>
              <TouchableOpacity onPress={() => setMonth((m) => (m === 0 ? 11 : m - 1))}>
                <Text style={styles.arrow}>‹</Text>
              </TouchableOpacity>
              <Text style={styles.headerLabel}>{MONTH_NAMES[month]} {year}</Text>
              <TouchableOpacity onPress={() => setMonth((m) => (m === 11 ? 0 : m + 1))}>
                <Text style={styles.arrow}>›</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.centered}>
              <MonthGrid
                year={year}
                month={month}
                countByDate={countByDate}
                cellSize={MONTH_CELL}
                showNumbers
                onSelectDate={handleSelectDate}
              />
            </View>
          </View>
        ) : (
          <View>
            <View style={styles.header}>
              <TouchableOpacity onPress={() => setYear((y) => y - 1)}>
                <Text style={styles.arrow}>‹</Text>
              </TouchableOpacity>
              <Text style={styles.headerLabel}>{year}</Text>
              <TouchableOpacity onPress={() => setYear((y) => y + 1)}>
                <Text style={styles.arrow}>›</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.monthsWrap}>
              {MONTH_NAMES.map((_, m) => (
                <View key={m} style={styles.miniMonth}>
                  <Text style={styles.miniMonthLabel}>{MONTH_SHORT[m]}</Text>
                  <MonthGrid
                    year={year}
                    month={m}
                    countByDate={countByDate}
                    cellSize={MINI_CELL}
                    showNumbers={false}
                    onSelectDate={handleSelectDate}
                  />
                </View>
              ))}
            </View>
          </View>
        )}

        {selected && (
          <Text style={styles.selectedText}>
            {selected.date} — {selected.count} check-in{selected.count === 1 ? '' : 's'}
          </Text>
        )}
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{monthTotal}</Text>
          <Text style={styles.statLabel}>This month</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{yearTotal}</Text>
          <Text style={styles.statLabel}>This year</Text>
        </View>
      </View>
    </View>
  );
};

const createStyles = (colors: ThemeColors, typography: Typography, shadow: Shadow) => StyleSheet.create({
  toggleRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  toggleButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  toggleButtonActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  toggleText: { ...typography.caption, fontWeight: '600' },
  toggleTextActive: { color: colors.white },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    ...shadow.card,
  },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md },
  headerLabel: { ...typography.h3 },
  arrow: { fontSize: 24, color: colors.primary, paddingHorizontal: spacing.md },
  centered: { alignItems: 'center' },
  weekLabels: { flexDirection: 'row', marginBottom: spacing.xs },
  weekLabel: { textAlign: 'center', ...typography.caption },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.sm,
  },
  cellText: { fontSize: 12, fontWeight: '600' },
  monthsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, justifyContent: 'center' },
  miniMonth: { width: 18 * 7 + 6 * 4, alignItems: 'center' },
  miniMonthLabel: { ...typography.caption, fontWeight: '700', marginBottom: spacing.xs },
  selectedText: { ...typography.caption, marginTop: spacing.md, textAlign: 'center' },
  statsRow: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.lg },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    alignItems: 'center',
    ...shadow.card,
  },
  statValue: { fontSize: 24, fontWeight: '800', color: colors.primary },
  statLabel: { ...typography.caption, marginTop: spacing.xs },
});

export default ActivityCalendar;
