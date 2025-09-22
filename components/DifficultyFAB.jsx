import React, { useRef, useState, useEffect, useMemo } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Animated, Easing, TouchableWithoutFeedback } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useDifficulty } from '../contexts/DifficultyContext';
import { useUser } from '../contexts/UserContext';
import theme from '../styles/theme';
import themeVariables from '../styles/theme';

const DifficultyFAB = () => {
  const { level, setLevel } = useDifficulty();
  const { completedDifficulties } = useUser();
  const [open, setOpen] = useState(false);
  const openAnim = useRef(new Animated.Value(0)).current; // 0 closed -> 1 open

  const levelOrder = useMemo(() => {
    const keys = Object.keys(completedDifficulties || {});
    if (keys.length === 0) {
      return [1, 2, 3];
    }
    const parsed = keys
      .map(key => Number(key))
      .filter(lvl => Number.isFinite(lvl) && lvl > 0);
    if (!parsed.includes(1)) {
      parsed.push(1);
    }
    return parsed.sort((a, b) => a - b);
  }, [completedDifficulties]);

  const highestDefinedLevel = levelOrder[levelOrder.length - 1] || 1;

  const highestUnlocked = useMemo(() => {
    let highest = 1;
    while (highest < highestDefinedLevel && completedDifficulties?.[highest]) {
      highest += 1;
    }
    return Math.min(highest, highestDefinedLevel);
  }, [completedDifficulties, highestDefinedLevel]);

  useEffect(() => {
    if (level > highestUnlocked) {
      setLevel(highestUnlocked);
    }
  }, [highestUnlocked, level, setLevel]);

  useEffect(() => {
    Animated.timing(openAnim, {
      toValue: open ? 1 : 0,
      duration: open ? 220 : 180,
      easing: open ? Easing.out(Easing.cubic) : Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [open, openAnim]);

  const LevelButton = ({ value, index }) => {
    const disabled = value > highestUnlocked;
    const spacing = 44; // vertical spacing between items
    // Arrange items vertically upward from the FAB: 1 -> closest, 2 -> above, 3 -> highest
    const offsets = [-1 * spacing, -2 * spacing, -3 * spacing];
    const baseLift = 12; // raise all chips slightly higher from the FAB
    const targetY = (offsets[index] || (-(index + 1) * spacing)) - baseLift;
    const translateY = openAnim.interpolate({ inputRange: [0, 1], outputRange: [0, targetY] });
    const translateX = openAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 0] });
    const scale = openAnim.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1] });
    const opacity = openAnim.interpolate({ inputRange: [0, 0.3, 1], outputRange: [0, 0.6, 1] });
    return (
      <Animated.View
        pointerEvents={open ? 'auto' : 'none'}
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          width: 56,
          alignItems: 'center',
          transform: [{ translateY }, { scale }],
          opacity,
        }}
      >
        <TouchableOpacity
          style={[
            styles.levelButton,
            level === value && styles.selected,
            disabled && styles.disabled,
          ]}
          onPress={() => {
            if (disabled) return;
            setLevel(value);
            setOpen(false);
          }}
          disabled={disabled}
        >
          <Text style={styles.levelText}>{value}</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container} pointerEvents="box-none">
      {open && (
        <TouchableWithoutFeedback onPress={() => setOpen(false)}>
          <View style={styles.scrim} pointerEvents="auto" />
        </TouchableWithoutFeedback>
      )}
      <View style={styles.fabWrap} pointerEvents="box-none">
        <View style={styles.levelContainer} pointerEvents="box-none">
          {levelOrder.map((val, idx) => (
            <LevelButton key={val} value={val} index={idx} />
          ))}
        </View>
        <TouchableOpacity style={styles.fab} onPress={() => setOpen(!open)}>
          <Ionicons name="options-outline" size={24} color={theme.whiteColor} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  fabWrap: {
    position: 'absolute',
    right: 24,
    bottom: 54,
    alignItems: 'center',
  },
  fab: {
    backgroundColor: theme.primaryColor,
    borderColor: themeVariables.whiteColor,
    borderWidth: 1,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
  levelContainer: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 56,
    height: 200,
    zIndex: 10,
  },
  levelButton: {
    backgroundColor: theme.whiteColor,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginBottom: 4,
    borderRadius: theme.borderRadiusPill,
    borderWidth: 1,
    borderColor: theme.primaryColor,
    alignItems: 'center',
  },
  levelText: {
    fontSize: 16,
    color: theme.primaryColor,
    fontWeight: 'bold',
  },
  selected: {
    backgroundColor: theme.primaryLightColor,
  },
  disabled: {
    opacity: 0.4,
  },
  scrim: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
});

export default DifficultyFAB;
