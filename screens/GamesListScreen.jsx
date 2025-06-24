import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
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

const GamesListScreen = ({ onSelect }) => (
  <View style={styles.container}>
    <Text style={styles.title}>Games</Text>
    <View style={styles.tileContainer}>
      {gameIds.map(id => (
        <TouchableOpacity key={id} style={styles.tile} onPress={() => onSelect(id)}>
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
    backgroundColor: '#f0f0f0',
    width: '48%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderRadius: 8,
  },
  tileText: {
    fontSize: 16,
    textAlign: 'center',
  },
});

export default GamesListScreen;
