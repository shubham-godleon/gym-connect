import { NavigatorScreenParams } from '@react-navigation/native';

export type RootStackParamList = {
  Auth: undefined;
  ProfileSetup: undefined;
  WeeklyGoalGate: undefined;
  Main: NavigatorScreenParams<MainTabParamList>;
  ProfileDetail: { userId: string };
  EditProfile: undefined;
  CheckinCalendar: { userId: string };
};

export type AuthStackParamList = {
  Login: undefined;
  SignUp: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Friends: undefined;
  Feed: undefined;
  Rankings: undefined;
  Me: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
