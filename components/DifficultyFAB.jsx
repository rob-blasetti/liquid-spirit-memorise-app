import React, { useRef, useState, useEffect, useMemo, useContext } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated,
  Easing,
  TouchableWithoutFeedback,
} from 'react-native';
import { SafeAreaInsetsContext } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useDifficulty } from '../contexts/DifficultyContext';
import theme from '../styles/theme';
import themeVariables from '../styles/theme';
import { BlurView } from '@react-native-community/blur';

export const FAB_BOTTOM_MARGIN = 12;

const DifficultyFAB = () => {
  const { level, setLevel, activeGame, getProgressForGame } = useDifficulty();
  const safeInsets = useContext(SafeAreaInsetsContext);
  const topInset = Math.max(safeInsets?.top || 0, 0);
  const bottomInset = Math.max(safeInsets?.bottom || 0, 0);
  const leftInset = Math.max(safeInsets?.left || 0, 0);
  const rightInset = Math.max(safeInsets?.right || 0, 0);
  const hasBottomInset = bottomInset > 0;
  const fabBottomMargin = hasBottomInset ? 2 : FAB_BOTTOM_MARGIN;
  const fabBottomSpacing = bottomInset + fabBottomMargin;
  const [open, setOpen] = useState(false);
  const openAnim = useRef(new Animated.Value(0)).current; // 0 closed -> 1 open
  const overlayBounds = useMemo(
    () => ({
      top: -topInset,
      bottom: -bottomInset,
      left: -leftInset,
      right: -rightInset,
    }),
    [topInset, bottomInset, leftInset, rightInset],
  );

  const progressForActiveGame =
    typeof getProgressForGame === 'function'
      ? getProgressForGame(activeGame) || { completed: {}, highestUnlocked: 1 }
      : { completed: {}, highestUnlocked: 1 };

  const completedForActiveGame = progressForActiveGame?.completed || {};

  const levelOrder = useMemo(() => [1, 2, 3], []);

  const highestDefinedLevel = levelOrder[levelOrder.length - 1];

  const nextUnlockedLevel = useMemo(() => {
    if (Number.isFinite(progressForActiveGame?.highestUnlocked)) {
      return Math.max(1, Math.min(progressForActiveGame.highestUnlocked, highestDefinedLevel));
    }
    let highest = 1;
    for (let idx = 0; idx < levelOrder.length; idx += 1) {
      const levelValue = levelOrder[idx];
      if (completedForActiveGame?.[levelValue]) {
        highest = Math.min(levelValue + 1, highestDefinedLevel);
      } else {
        break;
      }
    }
    return highest;
  }, [completedForActiveGame, progressForActiveGame, levelOrder, highestDefinedLevel]);

  const highestUnlocked = nextUnlockedLevel;

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
    <View style={[styles.container, overlayBounds]} pointerEvents="box-none">
      {open && (
        <TouchableWithoutFeedback onPress={() => setOpen(false)}>
          <View style={[styles.scrim, overlayBounds]} pointerEvents="auto" />
        </TouchableWithoutFeedback>
      )}
      <View
        style={[styles.fabWrap, { bottom: fabBottomSpacing, right: rightInset + 24 }]}
        pointerEvents="box-none"
      >
        <View style={styles.levelContainer} pointerEvents="box-none">
          {levelOrder.map((val, idx) => (
            <LevelButton key={val} value={val} index={idx} />
          ))}
        </View>
        <TouchableOpacity style={styles.fab} onPress={() => setOpen(!open)} activeOpacity={0.85}>
          <BlurView
            style={StyleSheet.absoluteFill}
            blurType="light"
            blurAmount={18}
            reducedTransparencyFallbackColor="rgba(255,255,255,0.12)"
          />
          <View style={styles.fabContent}>
            <Ionicons name="options-outline" size={24} color={theme.whiteColor} />
          </View>
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
    alignItems: 'center',
  },
  fab: {
    backgroundColor: 'rgba(49,39,131,0.18)',
    borderColor: 'rgba(255,255,255,0.55)',
    borderWidth: 1,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 10,
    elevation: 4,
  },
  fabContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
