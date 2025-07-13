import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useDifficulty } from '../contexts/DifficultyContext';
import { useUser } from '../contexts/UserContext';
import theme from '../styles/theme';

const DifficultyFAB = () => {
  const { level, setLevel } = useDifficulty();
  const { completedDifficulties } = useUser();
  const [open, setOpen] = useState(false);

  const LevelButton = ({ value }) => {
    // Only allow selecting this level if prior level completed
    const prereqCompleted = value === 1 ? true : completedDifficulties[value - 1];
    const disabled = !prereqCompleted;
    return (
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
    );
  };

  return (
    <View style={styles.container} pointerEvents="box-none">
      {open && (
        <View style={styles.levelContainer} pointerEvents="box-none">
          {[1, 2, 3].map((val) => (
            <LevelButton key={val} value={val} />
          ))}
        </View>
      )}
      <TouchableOpacity style={styles.fab} onPress={() => setOpen(!open)}>
        <Ionicons name="options-outline" size={24} color={theme.whiteColor} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    alignItems: 'center',
  },
  fab: {
    backgroundColor: theme.primaryColor,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
  levelContainer: {
    marginBottom: 8,
    alignItems: 'center',
  },
  levelButton: {
    backgroundColor: theme.whiteColor,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginBottom: 4,
    borderRadius: theme.borderRadiusPill,
    borderWidth: 1,
    borderColor: theme.primaryColor,
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
});

export default DifficultyFAB;
