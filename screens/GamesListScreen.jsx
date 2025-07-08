import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import GameTile from '../components/GameTile';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { gameIds } from '../games';
import themeVariables from '../styles/theme';

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
};

const iconMap = {
  practice: 'book-outline',
  tapGame: 'hand-left',
  scrambleGame: 'shuffle',
  nextWordGame: 'arrow-forward',
  memoryGame: 'analytics',
  flashGame: 'flash',
  revealGame: 'eye',
  firstLetterGame: 'text',
  letterScrambleGame: 'reorder-four',
  fastTypeGame: 'keypad',
  hangmanGame: 'body',
  fillBlankGame: 'pencil',
  shapeBuilderGame: 'extension-puzzle',
  colorSwitchGame: 'color-palette',
  rhythmRepeatGame: 'musical-notes',
  silhouetteSearchGame: 'search',
  memoryMazeGame: 'map',
  sceneChangeGame: 'images',
  wordSwapGame: 'swap-horizontal',
  buildRecallGame: 'build',
};

const GamesListScreen = ({ onSelect }) => (
  <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
    <Text style={styles.title}>Games</Text>
    <View style={styles.tileContainer}>
      {gameIds.map(id => (
        <GameTile
          key={id}
          title={titles[id] || id}
          icon={iconMap[id] || 'game-controller'}
          onPress={() => onSelect(id)}
        />
      ))}
    </View>
  </ScrollView>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: themeVariables.darkGreyColor,
  },
  contentContainer: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: 16,
  },
  title: {
    fontSize: 24,
    marginBottom: 16,
  },
  tileContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
  },
});

export default GamesListScreen;
