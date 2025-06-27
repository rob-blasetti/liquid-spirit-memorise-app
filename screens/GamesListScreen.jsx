import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import GameTile from '../components/GameTile';
import {
  faBookOpen,
  faHandPointer,
  faRandom,
  faArrowRight,
  faBrain,
  faBolt,
  faEye,
  faFont,
  faSortAlphaDown,
  faKeyboard,
  faUserNinja,
  faPen,
} from '@fortawesome/free-solid-svg-icons';
import { gameIds } from '../games';

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
  practice: faBookOpen,
  tapGame: faHandPointer,
  scrambleGame: faRandom,
  nextWordGame: faArrowRight,
  memoryGame: faBrain,
  flashGame: faBolt,
  revealGame: faEye,
  firstLetterGame: faFont,
  letterScrambleGame: faSortAlphaDown,
  fastTypeGame: faKeyboard,
  hangmanGame: faUserNinja,
  fillBlankGame: faPen,
};

const GamesListScreen = ({ onSelect }) => (
  <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
    <Text style={styles.title}>Games</Text>
    <View style={styles.tileContainer}>
      {gameIds.map(id => (
        <GameTile
          key={id}
          title={titles[id] || id}
          icon={iconMap[id]}
          onPress={() => onSelect(id)}
        />
      ))}
    </View>
  </ScrollView>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // offset parent container's horizontal padding for full-width
    marginHorizontal: -16,
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
