import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
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
import theme from '../styles/theme';

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
  <View style={styles.container}>
    <Text style={styles.title}>Games</Text>
    <View style={styles.tileContainer}>
      {gameIds.map(id => (
        <TouchableOpacity key={id} style={styles.tile} onPress={() => onSelect(id)}>
          <View style={styles.iconContainer}>
            <FontAwesomeIcon icon={iconMap[id]} size={28} color={theme.primaryColor} />
          </View>
          <Text style={styles.tileText}>{titles[id] || id}</Text>
        </TouchableOpacity>
      ))}
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  tile: {
    backgroundColor: '#fff',
    width: '48%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.borderColor,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    backgroundColor: theme.neutralLight,
    borderRadius: 30,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: theme.borderColor,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileText: {
    fontSize: 16,
    textAlign: 'center',
  },
});

export default GamesListScreen;
