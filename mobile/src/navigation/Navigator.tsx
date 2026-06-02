import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { restoreToken } from '@/store/slices/authSlice';

import LoginScreen from '@/screens/auth/LoginScreen';
import SignUpScreen from '@/screens/auth/SignUpScreen';
import HomeScreen from '@/screens/main/HomeScreen';
import FriendsScreen from '@/screens/main/FriendsScreen';
import FeedScreen from '@/screens/main/FeedScreen';
import RankingsScreen from '@/screens/main/RankingsScreen';
import ProfileDetailScreen from '@/screens/ProfileDetailScreen';
import SplashScreen from '@/screens/SplashScreen';

import { RootStackParamList, AuthStackParamList, MainTabParamList } from './types';

const RootStack = createNativeStackNavigator<RootStackParamList>();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const MainTab = createBottomTabNavigator<MainTabParamList>();

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
  return (
    <MainTab.Navigator
      screenOptions={{
        headerShown: true,
      }}
    >
      <MainTab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: 'Home',
          tabBarLabel: 'Home',
          tabBarIcon: () => null,
        }}
      />
      <MainTab.Screen
        name="Friends"
        component={FriendsScreen}
        options={{
          title: 'Friends',
          tabBarLabel: 'Friends',
          tabBarIcon: () => null,
        }}
      />
      <MainTab.Screen
        name="Feed"
        component={FeedScreen}
        options={{
          title: 'Feed',
          tabBarLabel: 'Feed',
          tabBarIcon: () => null,
        }}
      />
      <MainTab.Screen
        name="Rankings"
        component={RankingsScreen}
        options={{
          title: 'Rankings',
          tabBarLabel: 'Rankings',
          tabBarIcon: () => null,
        }}
      />
    </MainTab.Navigator>
  );
}

function RootNavigator() {
  const user = useAppSelector((state) => state.auth.user);
  const isLoading = useAppSelector((state) => state.auth.isLoading);
  const dispatch = useAppDispatch();

  useEffect(() => {
    const bootstrapAsync = async () => {
      await dispatch(restoreToken());
    };

    bootstrapAsync();
  }, [dispatch]);

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      {user == null ? (
        <RootStack.Screen name="Auth" component={AuthNavigator} />
      ) : (
        <>
          <RootStack.Screen name="Main" component={MainTabNavigator} />
          <RootStack.Screen
            name="ProfileDetail"
            component={ProfileDetailScreen}
            options={{
              title: 'Profile',
              headerShown: true,
            }}
          />
        </>
      )}
    </RootStack.Navigator>
  );
}

export function Navigation() {
  return (
    <NavigationContainer>
      <RootNavigator />
    </NavigationContainer>
  );
}
