import React from 'react';
import { View, Text, Image, StyleSheet, StyleProp, ViewStyle, ImageStyle } from 'react-native';
import { ThemeColors } from '@/utils/theme';
import { useThemedStyles } from '@/theme/ThemeContext';
import { initials } from '@/utils/format';

interface Props {
  displayName: string;
  photoUrl?: string;
  size?: number;
  style?: StyleProp<ViewStyle | ImageStyle>;
}

const Avatar = ({ displayName, photoUrl, size = 40, style }: Props) => {
  const styles = useThemedStyles(createStyles);
  const dimensionStyle = { width: size, height: size, borderRadius: size / 2 };

  if (photoUrl) {
    return <Image source={{ uri: photoUrl }} style={[styles.image, dimensionStyle, style as StyleProp<ImageStyle>]} />;
  }

  return (
    <View style={[styles.fallback, dimensionStyle, style]}>
      <Text style={[styles.text, { fontSize: size * 0.35 }]}>{initials(displayName)}</Text>
    </View>
  );
};

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  image: { backgroundColor: colors.primaryLight },
  fallback: {
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { color: colors.primaryDark, fontWeight: '700' },
});

export default Avatar;
