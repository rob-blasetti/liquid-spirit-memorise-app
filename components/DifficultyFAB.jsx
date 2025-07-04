import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faSliders } from '@fortawesome/free-solid-svg-icons';
import { useDifficulty } from '../contexts/DifficultyContext';
import theme from '../styles/theme';

const DifficultyFAB = () => {
  const { level, setLevel } = useDifficulty();
  const [open, setOpen] = useState(false);

  const LevelButton = ({ value }) => (
    <TouchableOpacity
      style={[styles.levelButton, level === value && styles.selected]}
      onPress={() => {
        setLevel(value);
        setOpen(false);
      }}
    >
      <Text style={styles.levelText}>{value}</Text>
    </TouchableOpacity>
  );

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
        <FontAwesomeIcon icon={faSliders} size={24} color={theme.whiteColor} />
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
});

export default DifficultyFAB;
