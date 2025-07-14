import React from 'react';
import { View } from 'react-native';
import { gameScreens } from '../games/gameRoutes';
import DifficultyFAB from './DifficultyFAB';

const GameRenderer = ({ screen, quote, onBack, level, awardAchievement }) => {
  const GameComponent = gameScreens[screen];
  if (!GameComponent) return null;
  const gameProps = { quote, onBack };
  if (screen === 'memoryGame') {
    gameProps.onWin = () => awardAchievement(`memory${level}`);
  } else if (screen === 'shapeBuilderGame') {
    gameProps.onWin = () => awardAchievement(`shape${level}`);
  } else if (screen === 'hangmanGame') {
    gameProps.onWin = () => awardAchievement(`hangman${level}`);
  }
  return (
    <View style={{ flex: 1 }}>
      <GameComponent {...gameProps} />
      <DifficultyFAB />
    </View>
  );
};

export default GameRenderer;
