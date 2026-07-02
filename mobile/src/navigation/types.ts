import { NavigatorScreenParams } from '@react-navigation/native';

export type RootStackParamList = {
  Auth: undefined;
  ProfileSetup: undefined;
  WeeklyGoalGate: undefined;
  Main: NavigatorScreenParams<MainTabParamList>;
  Me: undefined;
  ProfileDetail: { userId: string };
  EditProfile: undefined;
  CheckinCalendar: { userId: string };
  GymDetail: { gymId: string };
  AddGym: undefined;
  ScanGym: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  SignUp: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Friends: undefined;
  Gyms: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
