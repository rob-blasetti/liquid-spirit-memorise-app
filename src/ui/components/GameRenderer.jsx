import React, { useState, Suspense, useMemo, useRef, useEffect, useLayoutEffect } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
// NotificationBanner display is handled at the root (Main)
import { lazyGameScreens } from '../../modules/games/lazyGameRoutes';
import DifficultyFAB from './DifficultyFAB';
import { useDifficulty } from '../../app/contexts/DifficultyContext';
import LostOverlay from './LostOverlay';
import { sanitizeQuoteText } from '../../services/quoteSanitizer';

const GameRenderer = ({
  screen,
  quote,
  rawQuote: rawQuoteProp,
  sanitizedQuote: sanitizedQuoteProp,
  onBack,
  awardGameAchievement,
  recordGamePlay,
  onVictory,
}) => {
  const GameComponent = lazyGameScreens[screen];
  const {
    level: contextLevel,
    setLevel: setContextLevel,
    activeGame,
    setActiveGame,
    markLevelComplete,
    getProgressForGame,
  } = useDifficulty();
  const [gameLost, setGameLost] = useState(false);
  const [retryTick, setRetryTick] = useState(0);
  const suppressWinsRef = useRef(false);
  if (!GameComponent) return null;
  const resolvedRawQuote = useMemo(() => {
    if (typeof rawQuoteProp === 'string') return rawQuoteProp;
    if (typeof quote === 'string') return quote;
    if (quote && typeof quote.text === 'string') return quote.text;
    return '';
  }, [rawQuoteProp, quote]);
  const resolvedSanitizedQuote = useMemo(() => {
    if (typeof sanitizedQuoteProp === 'string' && sanitizedQuoteProp.length > 0) {
      return sanitizedQuoteProp;
    }
    return sanitizeQuoteText(resolvedRawQuote);
  }, [sanitizedQuoteProp, resolvedRawQuote]);
  const progressEntry = useMemo(() => {
    if (typeof getProgressForGame === 'function') {
      return getProgressForGame(screen);
    }
    return { completed: {}, highestUnlocked: 1, currentLevel: 1 };
  }, [getProgressForGame, screen]);

  const highestUnlocked = progressEntry?.highestUnlocked || 1;

  const currentLevel = useMemo(() => {
    if (activeGame === screen) {
      return Math.min(Math.max(contextLevel || 1, 1), highestUnlocked || 1);
    }
    return progressEntry?.currentLevel || highestUnlocked || 1;
  }, [activeGame, screen, contextLevel, highestUnlocked, progressEntry]);

  // Clear suppression when level OR screen changes (e.g., switching games)
  useEffect(() => { suppressWinsRef.current = false; }, [currentLevel, screen]);

  const difficultyLabel = useMemo(() => {
    const map = { 1: 'Easy', 2: 'Medium', 3: 'Hard' };
    return map[currentLevel] || `Level ${currentLevel}`;
  }, [currentLevel]);

  useLayoutEffect(() => {
    if (!screen) return;
    if (activeGame !== screen) {
      setActiveGame(screen);
      return;
    }
    const clamped = Math.min(Math.max(contextLevel || 1, 1), highestUnlocked || 1);
    if (contextLevel !== clamped) {
      setContextLevel(clamped);
    }
  }, [screen, activeGame, highestUnlocked, contextLevel, setActiveGame, setContextLevel]);

  const gameProps = {
    quote,
    onBack,
    rawQuote: resolvedRawQuote,
    sanitizedQuote: resolvedSanitizedQuote,
    level: currentLevel,
  };
  // Handle game win: award achievement then navigate to celebration screen
  gameProps.onWin = (details = {}) => {
    if (suppressWinsRef.current) {
      // eslint-disable-next-line no-console
      console.log('[GameRenderer:onWin] suppressed', { screen, level: currentLevel });
      return;
    }
    suppressWinsRef.current = true;
    markLevelComplete?.(screen, currentLevel);
    // eslint-disable-next-line no-console
    console.log('[GameRenderer:onWin]', { screen, level: currentLevel });
    if (typeof recordGamePlay === 'function') {
      Promise.resolve(
        recordGamePlay({
          screen,
          level: currentLevel,
          result: 'win',
          perfect: Boolean(details?.perfect),
        }),
      ).catch((error) => console.error('recordGamePlay (win) failed', error));
    }
    // Show win overlay; ensure lose overlay is hidden
    setGameLost(false);
    setTimeout(() => awardGameAchievement(screen, currentLevel), 120);
    onVictory?.({
      screenId: screen,
      gameTitle: screenTitle,
      level: currentLevel,
      difficultyLabel,
      perfect: Boolean(details?.perfect),
    });
  };
  // Handle game loss
  gameProps.onLose = () => {
    // eslint-disable-next-line no-console
    console.log('[GameRenderer:onLose]', { screen, level: currentLevel });
    setGameLost(true);
    if (typeof recordGamePlay === 'function') {
      Promise.resolve(
        recordGamePlay({
          screen,
          level: currentLevel,
          result: 'lose',
          perfect: false,
        }),
      ).catch((error) => console.error('recordGamePlay (lose) failed', error));
    }
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
    gameProps.level = currentLevel;
  }
  return (
    <View style={styles.container}>
      <LostOverlay
        visible={gameLost}
        gameTitle={screenTitle}
        difficultyLabel={difficultyLabel}
        onRetry={() => {
          suppressWinsRef.current = false;
          setGameLost(false);
          // Remount same game at same level
          setRetryTick((k) => k + 1);
        }}
        onHome={() => {
          suppressWinsRef.current = false;
          setGameLost(false);
          onBack();
        }}
      />
      <Suspense fallback={<ActivityIndicator style={{ marginTop: 24 }} size="large" />}>
        <GameComponent key={`${screen}-${currentLevel}-${retryTick}`} {...gameProps} />
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
