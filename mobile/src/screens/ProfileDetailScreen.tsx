import React from 'react';
import { View, Text } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'ProfileDetail'>;

const ProfileDetailScreen = ({ route }: Props) => {
  const { userId } = route.params;

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Profile Detail Screen - User: {userId}</Text>
    </View>
  );
};

export default ProfileDetailScreen;
