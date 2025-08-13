import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import themeVariables from '../styles/theme';

const WinOverlay = ({ visible, onNextLevel, onHome, gameTitle, difficultyLabel }) => {
  if (!visible) return null;
  return (
    <View style={styles.winOverlay}>
      <View style={styles.winContainer}>
        <Text style={styles.winText}>Great Job!</Text>
        {(gameTitle || difficultyLabel) ? (
          <Text style={styles.subtitle}>
            {gameTitle}
            {gameTitle && difficultyLabel ? ' — ' : ''}
            {difficultyLabel || ''}
          </Text>
        ) : null}
        <View style={styles.actionsRow}>
          <TouchableOpacity
            accessibilityLabel="Home"
            onPress={onHome}
            style={[styles.iconButton, styles.homeButton]}
          >
            <Ionicons name="home" size={22} color={themeVariables.whiteColor} />
          </TouchableOpacity>
          <TouchableOpacity
            accessibilityLabel="Next Level"
            onPress={onNextLevel}
            style={[styles.iconButton, styles.nextButton]}
          >
            <Ionicons name="chevron-forward" size={22} color={themeVariables.whiteColor} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default WinOverlay;

const styles = StyleSheet.create({
  winOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  winContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  winText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#444',
    marginBottom: 16,
    textAlign: 'center',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  iconButton: {
    backgroundColor: themeVariables.primaryColor,
    width: 56,
    height: 44,
    borderRadius: themeVariables.borderRadiusPill,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
  },
  homeButton: {},
  nextButton: {},
});
