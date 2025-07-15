import React from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { gameIds } from '../games';
import themeVariables from '../styles/theme';

const { width } = Dimensions.get('window');
const HORIZONTAL_PADDING = 16; // increased padding
const TILE_MARGIN = 12;
const TILE_SIZE = (width - HORIZONTAL_PADDING * 2 - TILE_MARGIN * 2) / 2;

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
  bubblePopOrderGame: 'Bubble Pop Order',
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
};

const GamesListScreen = ({ onSelect }) => (
  <LinearGradient
    start={{ x: 0, y: 0 }}
    end={{ x: 0, y: 1 }}
    colors={[themeVariables.gradientStart, themeVariables.gradientEnd]}
    style={styles.background}
  >
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Games</Text>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.tileContainer}>
          {gameIds.map(id => (
            <TouchableOpacity
              key={id}
              style={styles.tileWrapper}
              activeOpacity={0.7}
              onPress={() => onSelect(id)}
            >
              <LinearGradient
                colors={['#E21281', '#6E33A7']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.tile}
              >
                <Ionicons
                  name={iconMap[id] || 'game-controller-outline'}
                  size={32}
                  color={themeVariables.whiteColor}
                />
                <Text style={styles.tileTitle}>{titles[id] || id}</Text>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  </LinearGradient>
);

export default GamesListScreen;

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: HORIZONTAL_PADDING,
  },
  title: {
    color: themeVariables.whiteColor,
    fontSize: 24,
    fontWeight: '700',
    paddingTop: 12,
    paddingBottom: 20,
    paddingLeft: 20,
  },
  content: {
    paddingBottom: 24,
    paddingHorizontal: HORIZONTAL_PADDING,
  },
  tileContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  tileWrapper: {
    width: TILE_SIZE,
    marginBottom: TILE_MARGIN * 2,
  },
  tile: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: themeVariables.borderRadiusPill,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tileTitle: {
    color: themeVariables.whiteColor,
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 4,
  },
});