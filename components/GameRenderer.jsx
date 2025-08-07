import React from 'react';
import { View } from 'react-native';
import { gameScreens } from '../games/gameRoutes';
import DifficultyFAB from './DifficultyFAB';

const GameRenderer = ({ screen, quote, onBack, level, awardGameAchievement }) => {
  const GameComponent = gameScreens[screen];
  if (!GameComponent) return null;
  const gameProps = { quote, onBack };
  // Handle game win for all games via service mapping
  gameProps.onWin = () => awardGameAchievement(screen, level);
  // Some games need the level passed through
  if (screen === 'bubblePopOrderGame') {
    gameProps.level = level;
  }
  return (
    <View style={{ flex: 1 }}>
      <GameComponent {...gameProps} />
      <DifficultyFAB />
    </View>
  );
};

export default GameRenderer;
