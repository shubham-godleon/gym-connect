import React, { useEffect } from 'react';
import { Text, View } from 'react-native';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { restoreToken } from '@/store/slices/authSlice';
import { fetchPendingRequests } from '@/store/slices/friendSlice';
import { fetchLeaderboard, fetchKudosCount, restoreKudosSeen } from '@/store/slices/checkinSlice';
import { ThemeColors } from '@/utils/theme';
import { useTheme } from '@/theme/ThemeContext';
import GlassTabBar from './GlassTabBar';
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

const makeHeaderOptions = (colors: ThemeColors) => ({
  // Match the gradient's top colour so the header blends into each screen's backdrop.
  headerStyle: { backgroundColor: colors.gradientA },
  headerTitleStyle: { color: colors.text, fontWeight: '700' as const },
  headerTintColor: colors.text,
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

  return (
    <MainTab.Navigator
      tabBar={(props) => <GlassTabBar {...props} />}
      screenOptions={{
        headerShown: true,
        ...makeHeaderOptions(colors),
      }}
    >
      <MainTab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          headerShown: false,
          tabBarLabel: 'Home',
        }}
      />
      <MainTab.Screen
        name="Friends"
        component={FriendsScreen}
        options={{ headerShown: false, tabBarLabel: 'Friends' }}
      />
      <MainTab.Screen
        name="Gyms"
        component={GymsScreen}
        options={{ headerShown: false, tabBarLabel: 'Gyms' }}
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
    dispatch(restoreKudosSeen());
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
    dispatch(fetchKudosCount(user.id));
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
