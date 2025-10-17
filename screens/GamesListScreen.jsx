import React, { useEffect, useMemo } from 'react';
import { SafeAreaView, StyleSheet, InteractionManager } from 'react-native';
import { gameIds } from '../games';
import { prefetchGames } from '../games/lazyGameRoutes';
import TopNav from '../components/TopNav';
import GameCarousel from '../components/GameCarousel';
const HORIZONTAL_PADDING = 16;

const titles = {
  practice: 'Practice',
  tapGame: 'Tap Missing Words',
  scrambleGame: 'Scrambled Words',
  nextWordGame: 'Next Word',
  memoryGame: 'Memory Match',
  flashGame: 'Flash Cards',
  revealGame: 'Reveal Word',
  firstLetterGame: 'First Letter',
  letterScrambleGame: 'Letter Scramble',
  fastTypeGame: 'Fast Type',
  hangmanGame: 'Hangman',
  fillBlankGame: 'Fill in the Blank',
  shapeBuilderGame: 'Shape Builder',
  colorSwitchGame: 'Color Switch',
  rhythmRepeatGame: 'Rhythm Repeat',
  silhouetteSearchGame: 'Silhouette Search',
  memoryMazeGame: 'Memory Maze',
  sceneChangeGame: 'Scene Change',
  wordSwapGame: 'Word Swap',
  buildRecallGame: 'Build & Recall',
  bubblePopOrderGame: 'Bubble Pop',
  wordRacerGame: 'Word Racer',
};
const iconMap = {
  practice: 'book-outline',
  tapGame: 'hand-left-outline',
  scrambleGame: 'shuffle-outline',
  nextWordGame: 'arrow-forward-outline',
  memoryGame: 'analytics-outline',
  flashGame: 'flash-outline',
  revealGame: 'eye-outline',
  firstLetterGame: 'text-outline',
  letterScrambleGame: 'reorder-four-outline',
  fastTypeGame: 'keypad-outline',
  hangmanGame: 'person-outline',
  fillBlankGame: 'pencil-outline',
  shapeBuilderGame: 'extension-puzzle-outline',
  colorSwitchGame: 'color-palette-outline',
  rhythmRepeatGame: 'musical-notes-outline',
  silhouetteSearchGame: 'search-outline',
  memoryMazeGame: 'map-outline',
  sceneChangeGame: 'images-outline',
  wordSwapGame: 'swap-horizontal-outline',
  buildRecallGame: 'build-outline',
  bubblePopOrderGame: 'water-outline',
  wordRacerGame: 'car-sport-outline',
};

const GamesListScreen = ({ onSelect, onBack }) => {
  const carouselData = useMemo(
    () =>
      gameIds.map((id) => {
        const baseTitle =
          titles[id] ||
          id
            .replace(/([a-z])([A-Z])/g, '$1 $2')
            .replace(/[-_]/g, ' ')
            .replace(/\b\w/g, (char) => char.toUpperCase());
        return {
          id,
          title: baseTitle,
          icon: iconMap[id] || 'game-controller-outline',
          buttonLabel: 'Play',
          gradient: ['#E21281', '#6E33A7'],
        };
      }),
    [],
  );

  useEffect(() => {
    const task = InteractionManager.runAfterInteractions(() => {
      const preloadTargets = Array.from(new Set([...gameIds, 'practice'])).slice(0, 6);
      prefetchGames(preloadTargets);
    });
    return () => {
      if (task && typeof task.cancel === 'function') {
        task.cancel();
      }
    };
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <TopNav title="Games" onBack={onBack} containerStyle={styles.header} />
      <GameCarousel data={carouselData} onSelect={onSelect} />
    </SafeAreaView>
  );
};

export default GamesListScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 12,
    paddingBottom: 16,
    paddingHorizontal: HORIZONTAL_PADDING,
  },
});
