import React, { useState, Suspense } from 'react';
import { View, StyleSheet, Text, ActivityIndicator } from 'react-native';
// NotificationBanner display is handled at the root (MainApp)
import { lazyGameScreens } from '../games/lazyGameRoutes';
import DifficultyFAB from './DifficultyFAB';
import { useDifficulty } from '../contexts/DifficultyContext';
import ThemedButton from './ThemedButton';
import WinOverlay from './WinOverlay';

const GameRenderer = ({ screen, quote, onBack, level, awardGameAchievement }) => {
  const GameComponent = lazyGameScreens[screen];
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
      <WinOverlay
        visible={gameWon}
        onNextLevel={() => {
          const next = Math.min(currLevel + 1, 3);
          // Hide the overlay first to avoid it persisting across re-renders
          setGameWon(false);
          // Remount game at new level on next tick to reset internal timers/state
          setTimeout(() => setLevel(next), 0);
        }}
        onHome={() => {
          setGameWon(false);
          onBack();
        }}
      />
      <Suspense fallback={<ActivityIndicator style={{ marginTop: 24 }} size="large" />}>
        <GameComponent key={`${screen}-${currLevel}`} {...gameProps} />
      </Suspense>
      <DifficultyFAB />
    </View>
  );
};

export default GameRenderer;
// Styles for game renderer overlay
const styles = StyleSheet.create({
  container: { flex: 1 },
});
