import React from 'react';

const lazy = (loader) => React.lazy(loader);

export const lazyGameScreens = {
  practice: lazy(() => import('./QuotePracticeScreen')),
  tapGame: lazy(() => import('./TapMissingWordsGame')),
  scrambleGame: lazy(() => import('./TapScrambledGame')),
  nextWordGame: lazy(() => import('./NextWordQuizGame')),
  memoryGame: lazy(() => import('./MemoryMatchGame')),
  flashGame: lazy(() => import('./FlashCardRecallGame')),
  revealGame: lazy(() => import('./RevealWordGame')),
  firstLetterGame: lazy(() => import('./FirstLetterQuizGame')),
  letterScrambleGame: lazy(() => import('./LetterScrambleGame')),
  fastTypeGame: lazy(() => import('./FastTypeGame')),
  hangmanGame: lazy(() => import('./HangmanGame')),
  fillBlankGame: lazy(() => import('./FillBlankTypingGame')),
  shapeBuilderGame: lazy(() => import('./ShapeBuilderGame')),
  colorSwitchGame: lazy(() => import('./ColorSwitchGame')),
  rhythmRepeatGame: lazy(() => import('./RhythmRepeatGame')),
  silhouetteSearchGame: lazy(() => import('./SilhouetteSearchGame')),
  memoryMazeGame: lazy(() => import('./MemoryMazeGame')),
  sceneChangeGame: lazy(() => import('./SceneChangeGame')),
  wordSwapGame: lazy(() => import('./WordSwapGame')),
  buildRecallGame: lazy(() => import('./BuildRecallGame')),
  bubblePopOrderGame: lazy(() => import('./BubblePopOrderGame')),
  wordRacerGame: lazy(() => import('./WordRacerGame')),
};

