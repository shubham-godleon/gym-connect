import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/navigation/types';
import ActivityCalendar from '@/components/ActivityCalendar';
import { spacing, ThemeColors } from '@/utils/theme';
import { useThemedStyles } from '@/theme/ThemeContext';

type Props = NativeStackScreenProps<RootStackParamList, 'CheckinCalendar'>;

const CheckinCalendarScreen = ({ route }: Props) => {
  const { userId } = route.params;
  const styles = useThemedStyles(createStyles);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <ActivityCalendar userId={userId} />
    </ScrollView>
  );
};

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg },
});

export default CheckinCalendarScreen;
