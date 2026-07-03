import React from 'react';
import { View, Text, Image, StyleSheet, StyleProp, ViewStyle, ImageStyle } from 'react-native';
import { ThemeColors } from '@/utils/theme';
import { useTheme, useThemedStyles } from '@/theme/ThemeContext';
import { initials } from '@/utils/format';

interface Props {
  displayName: string;
  photoUrl?: string;
  size?: number;
  style?: StyleProp<ViewStyle | ImageStyle>;
  presence?: boolean; // green "here now" dot
}

const Avatar = ({ displayName, photoUrl, size = 40, style, presence }: Props) => {
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  const dim = { width: size, height: size, borderRadius: size / 2 };

  const inner = photoUrl ? (
    <Image source={{ uri: photoUrl }} style={[styles.image, dim]} />
  ) : (
    <View style={[styles.fallback, dim]}>
      <Text style={[styles.text, { fontSize: size * 0.38 }]}>{initials(displayName)}</Text>
    </View>
  );

  return (
    <View style={[{ width: size, height: size }, style]}>
      {inner}
      {presence && (
        <View
          style={[
            styles.presence,
            {
              width: size * 0.3,
              height: size * 0.3,
              borderRadius: size * 0.15,
              borderColor: colors.background,
            },
          ]}
        />
      )}
    </View>
  );
};

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  image: { backgroundColor: colors.primaryLight },
  fallback: { backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  text: { color: colors.primaryDark, fontWeight: '700' },
  presence: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.success,
    borderWidth: 2,
  },
});

export default Avatar;
