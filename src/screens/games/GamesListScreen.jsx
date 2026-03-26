import React, { useEffect, useMemo } from 'react';
import { SafeAreaView, StyleSheet, InteractionManager, View } from 'react-native';
import { gameIds } from '../../games';
import { prefetchGames } from '../../games/lazyGameRoutes';
import TopNav from '../../ui/components/TopNav';
import GameCarousel from '../../ui/components/GameCarousel';
const HORIZONTAL_PADDING = 16;
const HIDDEN_CAROUSEL_GAMES = new Set(['coloringBookGame', 'colorQuoteGame']);
const placeholderImages = {
  solvePuzzle: require('../../assets/img/game_placeholders/Solve_The_Puzzle.png'),
  wordRacer: require('../../assets/img/game_placeholders/Word_Racer.png'),
  bubblePop: require('../../assets/img/game_placeholders/Bubble_Pop.png'),
  memoryMatch: require('../../assets/img/game_placeholders/Memory_Match.png'),
};

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
  coloringBookGame: 'Colour In',
  colorQuoteGame: 'Colour the Quote',
};
const descriptions = {
  practice: 'Rebuild the quote by choosing the missing words.',
  tapGame: 'Tap the words in the correct order.',
  scrambleGame: 'Unscramble the quote one word at a time.',
  nextWordGame: 'Choose the next word before time runs out.',
  memoryGame: 'Match pairs and remember where they are.',
  flashGame: 'Flip through cards and test recall.',
  revealGame: 'Reveal the hidden word with each guess.',
  firstLetterGame: 'Recall the quote from first-letter hints.',
  letterScrambleGame: 'Unscramble letters to build the right word.',
  fastTypeGame: 'Type the quote quickly and accurately.',
  hangmanGame: 'Guess the word before you run out of tries.',
  fillBlankGame: 'Type the missing word into each blank.',
  shapeBuilderGame: 'Place the pieces to complete the shape.',
  colorSwitchGame: 'React fast and switch to the right colour.',
  rhythmRepeatGame: 'Listen and repeat the pattern.',
  silhouetteSearchGame: 'Find the matching silhouette before time is up.',
  memoryMazeGame: 'Memorise the path and navigate the maze.',
  sceneChangeGame: 'Spot what changed in the scene.',
  wordSwapGame: 'Swap words back into the correct places.',
  buildRecallGame: 'Rebuild the phrase from memory.',
  bubblePopOrderGame: 'Pop the bubbles in the right quote order.',
  wordRacerGame: 'Steer the car to collect words in order.',
  coloringBookGame: 'Colour the image and save your artwork.',
  colorQuoteGame: 'Match colours to words and paint the scene.',
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
  coloringBookGame: 'color-palette-outline',
  colorQuoteGame: 'brush-outline',
};
const imageMap = {
  memoryGame: placeholderImages.memoryMatch,
  wordRacerGame: placeholderImages.wordRacer,
  bubblePopOrderGame: placeholderImages.bubblePop,
};
const GamesListScreen = ({ onSelect, onBack }) => {
  const carouselData = useMemo(
    () =>
      gameIds.filter((id) => !HIDDEN_CAROUSEL_GAMES.has(id)).map((id) => {
        const baseTitle =
          titles[id] ||
          id
            .replace(/([a-z])([A-Z])/g, '$1 $2')
            .replace(/[-_]/g, ' ')
            .replace(/\b\w/g, (char) => char.toUpperCase());
        return {
          id,
          title: baseTitle,
          description: descriptions[id] || 'Play and practise the lesson in a new way.',
          icon: iconMap[id] || 'game-controller-outline',
          cardImage: imageMap[id] || placeholderImages.solvePuzzle,
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
      <View style={styles.carouselWrap}>
        <GameCarousel data={carouselData} onSelect={onSelect} />
      </View>
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
  carouselWrap: {
    flex: 1,
    justifyContent: 'center',
    paddingBottom: 28,
  },
});
