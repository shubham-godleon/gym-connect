import React, { useEffect } from 'react';
import { Text, View } from 'react-native';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { restoreToken } from '@/store/slices/authSlice';
import { fetchPendingRequests } from '@/store/slices/friendSlice';
import { fetchLeaderboard } from '@/store/slices/checkinSlice';
import { ThemeColors } from '@/utils/theme';
import { useTheme } from '@/theme/ThemeContext';
import { registerForPushNotifications } from '@/services/notificationService';
import apiService from '@/services/apiService';

import LoginScreen from '@/screens/auth/LoginScreen';
import SignUpScreen from '@/screens/auth/SignUpScreen';
import ProfileSetupScreen from '@/screens/auth/ProfileSetupScreen';
import WeeklyGoalGateScreen from '@/screens/WeeklyGoalGateScreen';
import HomeScreen from '@/screens/main/HomeScreen';
import FriendsScreen from '@/screens/main/FriendsScreen';
import MeScreen from '@/screens/main/MeScreen';
import GymsScreen from '@/screens/gyms/GymsScreen';
import GymDetailScreen from '@/screens/gyms/GymDetailScreen';
import AddGymScreen from '@/screens/gyms/AddGymScreen';
import ScanGymScreen from '@/screens/gyms/ScanGymScreen';
import ProfileDetailScreen from '@/screens/ProfileDetailScreen';
import EditProfileScreen from '@/screens/EditProfileScreen';
import CheckinCalendarScreen from '@/screens/CheckinCalendarScreen';
import SplashScreen from '@/screens/SplashScreen';

import { RootStackParamList, AuthStackParamList, MainTabParamList } from './types';

const RootStack = createNativeStackNavigator<RootStackParamList>();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const MainTab = createBottomTabNavigator<MainTabParamList>();

const TabIcon = ({ emoji, focused, showDot }: { emoji: string; focused: boolean; showDot?: boolean }) => {
  const { colors } = useTheme();
  return (
    <View>
      <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.5 }}>{emoji}</Text>
      {showDot ? (
        <View
          style={{
            position: 'absolute',
            top: -2,
            right: -4,
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: colors.danger,
          }}
        />
      ) : null}
    </View>
  );
};

const makeHeaderOptions = (colors: ThemeColors) => ({
  headerStyle: { backgroundColor: colors.surface },
  headerTitleStyle: { color: colors.text, fontWeight: '700' as const },
  headerShadowVisible: false,
});

function AuthNavigator() {
  return (
    <AuthStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="SignUp" component={SignUpScreen} />
    </AuthStack.Navigator>
  );
}

function MainTabNavigator() {
  const { colors } = useTheme();
  const pendingRequests = useAppSelector((state) => state.friend.pendingRequests);
  const hasNewFriends = pendingRequests.length > 0;

  return (
    <MainTab.Navigator
      screenOptions={{
        headerShown: true,
        ...makeHeaderOptions(colors),
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      <MainTab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: 'Home',
          tabBarLabel: 'Home',
          tabBarIcon: ({ focused }) => <TabIcon emoji="🏠" focused={focused} />,
        }}
      />
      <MainTab.Screen
        name="Friends"
        component={FriendsScreen}
        options={{
          title: 'Friends',
          tabBarLabel: 'Friends',
          tabBarIcon: ({ focused }) => <TabIcon emoji="🤝" focused={focused} showDot={hasNewFriends} />,
        }}
      />
      <MainTab.Screen
        name="Gyms"
        component={GymsScreen}
        options={{
          title: 'Gyms',
          tabBarLabel: 'Gyms',
          tabBarIcon: ({ focused }) => <TabIcon emoji="🏋️" focused={focused} />,
        }}
      />
    </MainTab.Navigator>
  );
}

function RootNavigator() {
  const { colors } = useTheme();
  const headerOptions = makeHeaderOptions(colors);
  const user = useAppSelector((state) => state.auth.user);
  const isLoading = useAppSelector((state) => state.auth.isLoading);
  const needsProfileSetup = useAppSelector((state) => state.auth.needsProfileSetup);
  const dispatch = useAppDispatch();

  useEffect(() => {
    const bootstrapAsync = async () => {
      await dispatch(restoreToken());
    };

    bootstrapAsync();
  }, [dispatch]);

  useEffect(() => {
    if (!user) return;
    registerForPushNotifications().then((token) => {
      if (token) {
        apiService.updateFcmToken(user.id, token).catch((err) => {
          console.warn('Failed to save push token:', err);
        });
      }
    });
  }, [user]);

  useEffect(() => {
    if (!user) return;
    dispatch(fetchPendingRequests(user.id));
    dispatch(fetchLeaderboard(user.id));
  }, [dispatch, user]);

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      {user == null ? (
        <RootStack.Screen name="Auth" component={AuthNavigator} />
      ) : needsProfileSetup ? (
        <RootStack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
      ) : user.weeklyGoal == null ? (
        <RootStack.Screen name="WeeklyGoalGate" component={WeeklyGoalGateScreen} />
      ) : (
        <>
          <RootStack.Screen name="Main" component={MainTabNavigator} />
          <RootStack.Screen
            name="Me"
            component={MeScreen}
            options={{ title: 'Me', headerShown: true, ...headerOptions }}
          />
          <RootStack.Screen
            name="ProfileDetail"
            component={ProfileDetailScreen}
            options={{
              title: 'Profile',
              headerShown: true,
              ...headerOptions,
            }}
          />
          <RootStack.Screen
            name="EditProfile"
            component={EditProfileScreen}
            options={{
              title: 'Edit Profile',
              headerShown: true,
              ...headerOptions,
            }}
          />
          <RootStack.Screen
            name="CheckinCalendar"
            component={CheckinCalendarScreen}
            options={{
              title: 'Activity',
              headerShown: true,
              ...headerOptions,
            }}
          />
          <RootStack.Screen
            name="GymDetail"
            component={GymDetailScreen}
            options={{ title: 'Gym', headerShown: true, ...headerOptions }}
          />
          <RootStack.Screen
            name="AddGym"
            component={AddGymScreen}
            options={{ title: 'Find a gym', headerShown: true, ...headerOptions }}
          />
          <RootStack.Screen
            name="ScanGym"
            component={ScanGymScreen}
            options={{ title: 'Check in', headerShown: true, ...headerOptions }}
          />
        </>
      )}
    </RootStack.Navigator>
  );
}

export function Navigation() {
  const { isDark, colors } = useTheme();
  const navTheme = isDark
    ? { ...DarkTheme, colors: { ...DarkTheme.colors, background: colors.background, card: colors.surface, text: colors.text, border: colors.border, primary: colors.primary } }
    : { ...DefaultTheme, colors: { ...DefaultTheme.colors, background: colors.background, card: colors.surface, text: colors.text, border: colors.border, primary: colors.primary } };
  return (
    <NavigationContainer theme={navTheme}>
      <RootNavigator />
    </NavigationContainer>
  );
}
