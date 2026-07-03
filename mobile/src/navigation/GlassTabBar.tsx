import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon, { IconName } from '@/components/Icon';
import { useAppSelector } from '@/store/hooks';
import { useTheme } from '@/theme/ThemeContext';
import { radius, spacing } from '@/utils/theme';

const ICONS: Record<string, { on: IconName; off: IconName }> = {
  Home: { on: 'home-variant', off: 'home-variant-outline' },
  Friends: { on: 'account-group', off: 'account-group-outline' },
  Gyms: { on: 'dumbbell', off: 'dumbbell' },
};

// Floating, blurred, pill-shaped tab bar — the "smoked glass" navbar.
const GlassTabBar = ({ state, navigation }: BottomTabBarProps) => {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const pending = useAppSelector((s) => s.friend.pendingRequests.length);
  const hasNewKudos = useAppSelector((s) => s.checkin.kudosCount > s.checkin.kudosSeen);

  return (
    <View style={[styles.wrap, { bottom: insets.bottom + 12 }]} pointerEvents="box-none">
      <BlurView
        intensity={isDark ? 40 : 60}
        tint={isDark ? 'dark' : 'light'}
        style={[styles.pill, { borderColor: colors.glassBorder, backgroundColor: colors.glassHeavy }]}
      >
        {state.routes.map((route, i) => {
          const focused = state.index === i;
          const icons = ICONS[route.name] ?? { on: 'circle', off: 'circle-outline' };
          const onPress = () => {
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!focused && !event.defaultPrevented) navigation.navigate(route.name as never);
          };
          return (
            <TouchableOpacity key={route.key} style={styles.tab} onPress={onPress} activeOpacity={0.75}>
              <Icon name={focused ? icons.on : icons.off} size={26} color={focused ? colors.primary : colors.textMuted} />
              {route.name === 'Friends' && pending > 0 && <View style={[styles.badge, { backgroundColor: colors.danger }]} />}
              {route.name === 'Home' && hasNewKudos && <View style={[styles.badge, { backgroundColor: colors.primary }]} />}
            </TouchableOpacity>
          );
        })}
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 0, right: 0, alignItems: 'center' },
  pill: {
    flexDirection: 'row',
    borderRadius: radius.full,
    borderWidth: 1,
    overflow: 'hidden',
    paddingHorizontal: spacing.sm,
    height: 62,
    alignItems: 'center',
    // soft floating shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  tab: { width: 74, height: '100%', alignItems: 'center', justifyContent: 'center' },
  dot: { position: 'absolute', bottom: 10, width: 5, height: 5, borderRadius: 3 },
  badge: { position: 'absolute', top: 12, right: 20, width: 9, height: 9, borderRadius: 5 },
});

export default GlassTabBar;
