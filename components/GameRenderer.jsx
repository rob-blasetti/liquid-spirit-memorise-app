import React, { useState, Suspense, useMemo, useRef, useEffect } from 'react';
import { View, StyleSheet, Text, ActivityIndicator } from 'react-native';
import themeVariables from '../styles/theme';
// NotificationBanner display is handled at the root (MainApp)
import { lazyGameScreens } from '../games/lazyGameRoutes';
import DifficultyFAB from './DifficultyFAB';
import { useDifficulty } from '../contexts/DifficultyContext';
import ThemedButton from './ThemedButton';
import WinOverlay from './WinOverlay';
import LostOverlay from './LostOverlay';

const GameRenderer = ({ screen, quote, onBack, level, awardGameAchievement }) => {
  const GameComponent = lazyGameScreens[screen];
  const { level: currLevel, setLevel } = useDifficulty();
  const [gameWon, setGameWon] = useState(false);
  const [gameLost, setGameLost] = useState(false);
  const [retryTick, setRetryTick] = useState(0);
  const suppressWinsRef = useRef(false);
  // Clear suppression when level OR screen changes (e.g., switching games)
  useEffect(() => { suppressWinsRef.current = false; }, [currLevel, screen]);
  if (!GameComponent) return null;
  const gameProps = { quote, onBack };
  // Handle game win: award achievement and show next-level overlay
  gameProps.onWin = () => {
    if (suppressWinsRef.current) {
      // eslint-disable-next-line no-console
      console.log('[GameRenderer:onWin] suppressed', { screen, level: currLevel });
      return;
    }
    // eslint-disable-next-line no-console
    console.log('[GameRenderer:onWin]', { screen, level: currLevel });
    // Show win overlay; ensure lose overlay is hidden
    setGameLost(false);
    setGameWon(true);
    setTimeout(() => awardGameAchievement(screen, currLevel), 120);
  };
  // Handle game loss
  gameProps.onLose = () => {
    // eslint-disable-next-line no-console
    console.log('[GameRenderer:onLose]', { screen, level: currLevel });
    setGameWon(false);
    setGameLost(true);
  };
  // Title mapping for overlay display
  const screenTitle = useMemo(() => {
    const map = {
      practice: 'Quote Practice',
      tapGame: 'Tap Missing Words',
      scrambleGame: 'Tap Scrambled',
      nextWordGame: 'Next Word Quiz',
      memoryGame: 'Memory Match',
      flashGame: 'Flash Cards',
      revealGame: 'Reveal Word',
      firstLetterGame: 'First Letter',
      letterScrambleGame: 'Letter Scramble',
      fastTypeGame: 'Fast Type',
      hangmanGame: 'Hangman',
      fillBlankGame: 'Fill the Blank',
      shapeBuilderGame: 'Shape Builder',
      colorSwitchGame: 'Color Switch',
      rhythmRepeatGame: 'Rhythm Repeat',
      silhouetteSearchGame: 'Silhouette Search',
      memoryMazeGame: 'Memory Maze',
      sceneChangeGame: 'Scene Change',
      wordSwapGame: 'Word Swap',
      buildRecallGame: 'Build Recall',
      bubblePopOrderGame: 'Bubble Pop',
      wordRacerGame: 'Word Racer',
    };
    if (map[screen]) return map[screen];
    // Fallback: Title Case the screen id
    const cleaned = String(screen || '')
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/[-_]/g, ' ')
      .trim();
    return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  }, [screen]);
  // Some games need the difficulty level passed through
  if (screen === 'bubblePopOrderGame') {
    gameProps.level = currLevel;
  }
  return (
    <View style={styles.container}>
      <LostOverlay
        visible={gameLost}
        gameTitle={screenTitle}
        difficultyLabel={(() => {
          const map = { 1: 'Easy', 2: 'Medium', 3: 'Hard' };
          return map[currLevel] || `Level ${currLevel}`;
        })()}
        onRetry={() => {
          setGameLost(false);
          // Remount same game at same level
          setRetryTick((k) => k + 1);
        }}
        onHome={() => {
          setGameLost(false);
          onBack();
        }}
      />
      <WinOverlay
        visible={gameWon}
        gameTitle={screenTitle}
        difficultyLabel={(() => {
          const map = { 1: 'Easy', 2: 'Medium', 3: 'Hard' };
          return map[currLevel] || `Level ${currLevel}`;
        })()}
        onNextLevel={() => {
          const next = Math.min(currLevel + 1, 3);
          // Hide the overlay first to avoid it persisting across re-renders
          setGameWon(false);
          // eslint-disable-next-line no-console
          console.log('[GameRenderer:nextLevel]', { from: currLevel, to: next, screen });
          // Suppress wins while transitioning to the next level to avoid immediate re-trigger
          suppressWinsRef.current = true;
          // Remount game at new level on next tick to reset internal timers/state
          setTimeout(() => setLevel(next), 0);
        }}
        onHome={() => {
          setGameWon(false);
          onBack();
        }}
      />
      <Suspense fallback={<ActivityIndicator style={{ marginTop: 24 }} size="large" />}>
        <GameComponent key={`${screen}-${currLevel}-${retryTick}`} {...gameProps} />
      </Suspense>
      <DifficultyFAB />
    </View>
  );
};

export default GameRenderer;
// Styles for game renderer overlay
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
});
