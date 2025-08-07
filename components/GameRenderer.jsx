import React, { useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
// NotificationBanner display is handled at the root (MainApp)
import { gameScreens } from '../games/gameRoutes';
import DifficultyFAB from './DifficultyFAB';
import { useDifficulty } from '../contexts/DifficultyContext';
import ThemedButton from './ThemedButton';

const GameRenderer = ({ screen, quote, onBack, level, awardGameAchievement }) => {
  const GameComponent = gameScreens[screen];
  const { level: currLevel, setLevel } = useDifficulty();
  const [gameWon, setGameWon] = useState(false);
  if (!GameComponent) return null;
  const gameProps = { quote, onBack };
  // Handle game win: award achievement and show next-level overlay
  gameProps.onWin = () => {
    awardGameAchievement(screen, currLevel);
    setGameWon(true);
  };
  // Some games need the difficulty level passed through
  if (screen === 'bubblePopOrderGame') {
    gameProps.level = currLevel;
  }
  return (
    <View style={styles.container}>
      {gameWon && (
        <View style={styles.winOverlay}>
          <View style={styles.winContainer}>
            <Text style={styles.winText}>Great Job!</Text>
            <ThemedButton
              title="Next Level"
              onPress={() => {
                const next = Math.min(currLevel + 1, 3);
                setLevel(next);
                setGameWon(false);
              }}
              style={styles.actionButton}
            />
            <ThemedButton
              title="Home"
              onPress={onBack}
              style={[styles.actionButton, { marginTop: 8 }]}
            />
          </View>
        </View>
      )}
      <GameComponent {...gameProps} />
      <DifficultyFAB />
    </View>
  );
};

export default GameRenderer;
// Styles for game renderer overlay
const styles = StyleSheet.create({
  container: { flex: 1 },
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
  actionButton: {
    width: 140,
  },
});
