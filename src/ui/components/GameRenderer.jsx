import React, { useState, Suspense, useMemo, useRef, useEffect, useLayoutEffect } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { lazyGameScreens } from '../../games/lazyGameRoutes';
import DifficultyFAB from './DifficultyFAB';
import { useDifficulty } from '../../app/contexts/DifficultyContext';
import LostOverlay from './LostOverlay';
import { sanitizeQuoteText } from '../../services/quoteSanitizer';

const GAME_TITLES = {
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
  coloringBookGame: 'Colour In',
  colorQuoteGame: 'Colour the Quote',
};

const GameRenderer = ({
  screen,
  quote,
  rawQuote: rawQuoteProp,
  sanitizedQuote: sanitizedQuoteProp,
  requestedLevel,
  onBack,
  initialImageId,
  awardGameAchievement,
  recordGamePlay,
  onVictory,
  coloringInitialDrawing,
  onSaveColoring,
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
  const preferredLevel = useMemo(() => {
    const numericRequested = Number(requestedLevel);
    if (Number.isFinite(numericRequested) && numericRequested > 0) {
      return Math.min(Math.max(Math.floor(numericRequested), 1), highestUnlocked || 1);
    }
    const persistedLevel = progressEntry?.currentLevel || highestUnlocked || 1;
    return Math.min(Math.max(persistedLevel, 1), highestUnlocked || 1);
  }, [requestedLevel, progressEntry, highestUnlocked]);

  const currentLevel = useMemo(() => {
    if (activeGame === screen) {
      const resolvedContextLevel = Math.min(Math.max(contextLevel || 1, 1), highestUnlocked || 1);
      if (resolvedContextLevel === preferredLevel) {
        return resolvedContextLevel;
      }
      return preferredLevel;
    }
    return preferredLevel;
  }, [activeGame, screen, contextLevel, highestUnlocked, preferredLevel]);

  useEffect(() => {
    suppressWinsRef.current = false;
  }, [currentLevel, screen]);

  const difficultyLabel = useMemo(() => {
    const map = { 1: 'Easy', 2: 'Medium', 3: 'Hard' };
    return map[currentLevel] || `Level ${currentLevel}`;
  }, [currentLevel]);

  useLayoutEffect(() => {
    if (!screen) return;
    if (activeGame !== screen) {
      setActiveGame(screen);
    }
    if (contextLevel !== preferredLevel) {
      setContextLevel(preferredLevel);
    }
  }, [screen, activeGame, contextLevel, preferredLevel, setActiveGame, setContextLevel]);

  const screenTitle = useMemo(() => {
    if (GAME_TITLES[screen]) return GAME_TITLES[screen];
    const cleaned = String(screen || '')
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/[-_]/g, ' ')
      .trim();
    return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  }, [screen]);

  const gameProps = useMemo(() => {
    const nextProps = {
      quote,
      onBack,
      rawQuote: resolvedRawQuote,
      sanitizedQuote: resolvedSanitizedQuote,
      level: currentLevel,
    };

    if (screen === 'bubblePopOrderGame') {
      nextProps.level = currentLevel;
    }
    if (initialImageId) {
      nextProps.initialImageId = initialImageId;
    }
    if (screen === 'coloringBookGame') {
      if (coloringInitialDrawing) {
        nextProps.initialDrawing = coloringInitialDrawing;
      }
      if (typeof onSaveColoring === 'function') {
        nextProps.onSaveDrawing = onSaveColoring;
      }
    }

    return nextProps;
  }, [
    quote,
    onBack,
    resolvedRawQuote,
    resolvedSanitizedQuote,
    currentLevel,
    screen,
    initialImageId,
    coloringInitialDrawing,
    onSaveColoring,
  ]);

  if (!GameComponent) return null;

  gameProps.onWin = (details = {}) => {
    if (suppressWinsRef.current) {
      console.log('[GameRenderer:onWin] suppressed', { screen, level: currentLevel });
      return;
    }
    suppressWinsRef.current = true;
    markLevelComplete?.(screen, currentLevel);
    if (typeof recordGamePlay === 'function') {
      Promise.resolve(
        recordGamePlay({
          screen,
          level: currentLevel,
          result: 'win',
          perfect: Boolean(details?.perfect),
        }),
      ).catch(error => console.error('recordGamePlay (win) failed', error));
    }
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

  gameProps.onLose = () => {
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
      ).catch(error => console.error('recordGamePlay (lose) failed', error));
    }
  };

  const showDifficultyFab = screen !== 'coloringBookGame';

  return (
    <View style={styles.container}>
      <LostOverlay
        visible={gameLost}
        gameTitle={screenTitle}
        difficultyLabel={difficultyLabel}
        onRetry={() => {
          suppressWinsRef.current = false;
          setGameLost(false);
          setRetryTick(k => k + 1);
        }}
        onHome={() => {
          suppressWinsRef.current = false;
          setGameLost(false);
          onBack();
        }}
      />
      <Suspense fallback={<ActivityIndicator style={styles.loadingIndicator} size="large" />}>
        <GameComponent key={`${screen}-${currentLevel}-${retryTick}`} {...gameProps} />
      </Suspense>
      {showDifficultyFab && <DifficultyFAB gameId={screen} />}
    </View>
  );
};

export default GameRenderer;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  loadingIndicator: { marginTop: 24 },
});
