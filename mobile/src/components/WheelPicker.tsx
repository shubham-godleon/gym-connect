import React, { useEffect, useRef, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { ThemeColors, Typography } from '@/utils/theme';
import { useThemedStyles } from '@/theme/ThemeContext';

const ITEM_HEIGHT = 40;
const VISIBLE_COUNT = 5;
const WHEEL_HEIGHT = ITEM_HEIGHT * VISIBLE_COUNT;
const PADDING = ITEM_HEIGHT * Math.floor(VISIBLE_COUNT / 2);

interface Props {
  data: string[];
  selectedIndex: number;
  onChange: (index: number) => void;
  width?: number;
}

const WheelPicker = ({ data, selectedIndex, onChange, width = 70 }: Props) => {
  const styles = useThemedStyles(createStyles);
  const scrollRef = useRef<ScrollView>(null);
  const [activeIndex, setActiveIndex] = useState(selectedIndex);

  useEffect(() => {
    setActiveIndex(selectedIndex);
    scrollRef.current?.scrollTo({ y: selectedIndex * ITEM_HEIGHT, animated: false });
  }, [selectedIndex, data.length]);

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.y / ITEM_HEIGHT);
    const clamped = Math.max(0, Math.min(data.length - 1, index));
    if (clamped !== activeIndex) setActiveIndex(clamped);
  };

  const handleScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.y / ITEM_HEIGHT);
    const clamped = Math.max(0, Math.min(data.length - 1, index));
    onChange(clamped);
  };

  return (
    <View style={[styles.container, { width, height: WHEEL_HEIGHT }]}>
      <View pointerEvents="none" style={styles.highlight} />
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        contentContainerStyle={{ paddingVertical: PADDING }}
        onScroll={handleScroll}
        onMomentumScrollEnd={handleScrollEnd}
        scrollEventThrottle={16}
      >
        {data.map((label, i) => (
          <View key={i} style={styles.item}>
            <Text style={[styles.itemText, i === activeIndex && styles.itemTextActive]}>{label}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const createStyles = (colors: ThemeColors, typography: Typography) => StyleSheet.create({
  container: { overflow: 'hidden' },
  highlight: {
    position: 'absolute',
    top: ITEM_HEIGHT * Math.floor(VISIBLE_COUNT / 2),
    left: 0,
    right: 0,
    height: ITEM_HEIGHT,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.primary,
    zIndex: 1,
  },
  item: { height: ITEM_HEIGHT, alignItems: 'center', justifyContent: 'center' },
  itemText: { ...typography.body, color: colors.textMuted, fontSize: 18 },
  itemTextActive: { color: colors.text, fontWeight: '700' },
});

export default WheelPicker;
