import React from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@/theme/ThemeContext';

export type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

interface Props {
  name: IconName;
  size?: number;
  color?: string;
  style?: any;
}

// Thin wrapper so icon colour defaults to the themed text colour.
const Icon = ({ name, size = 22, color, style }: Props) => {
  const { colors } = useTheme();
  return <MaterialCommunityIcons name={name} size={size} color={color ?? colors.text} style={style} />;
};

export default Icon;
