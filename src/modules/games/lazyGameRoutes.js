import React from 'react';

const normalizeModule = (mod) => ({ default: mod.default || mod });

const gameLoaders = {
  practice: () => import('./QuotePracticeScreen'),
  tapGame: () => import('./TapMissingWordsGame'),
  scrambleGame: () => import('./TapScrambledGame'),
  nextWordGame: () => import('./NextWordQuizGame'),
  memoryGame: () => import('./MemoryMatchGame'),
  flashGame: () => import('./FlashCardRecallGame'),
  revealGame: () => import('./RevealWordGame'),
  firstLetterGame: () => import('./FirstLetterQuizGame'),
  letterScrambleGame: () => import('./LetterScrambleGame'),
  fastTypeGame: () => import('./FastTypeGame'),
  hangmanGame: () => import('./HangmanGame'),
  fillBlankGame: () => import('./FillBlankTypingGame'),
  shapeBuilderGame: () => import('./ShapeBuilderGame'),
  colorSwitchGame: () => import('./ColorSwitchGame'),
  rhythmRepeatGame: () => import('./RhythmRepeatGame'),
  silhouetteSearchGame: () => import('./SilhouetteSearchGame'),
  memoryMazeGame: () => import('./MemoryMazeGame'),
  sceneChangeGame: () => import('./SceneChangeGame'),
  wordSwapGame: () => import('./WordSwapGame'),
  buildRecallGame: () => import('./BuildRecallGame'),
  bubblePopOrderGame: () => import('./BubblePopOrderGame'),
  wordRacerGame: () => import('./WordRacerGame'),
};

const loaderCache = new Map();

const loadModule = (id) => {
  const loader = gameLoaders[id];
  if (!loader) {
    return Promise.reject(new Error(`Unknown game screen: ${id}`));
  }
  if (!loaderCache.has(id)) {
    const promise = loader()
      .then(normalizeModule)
      .catch((error) => {
        loaderCache.delete(id);
        throw error;
      });
    loaderCache.set(id, promise);
  }
  return loaderCache.get(id);
};

export const lazyGameScreens = Object.fromEntries(
  Object.keys(gameLoaders).map((id) => [id, React.lazy(() => loadModule(id))]),
);

export const prefetchGame = (id) => {
  const loader = gameLoaders[id];
  if (!loader) return Promise.resolve(null);
  return loadModule(id).catch((error) => {
    console.warn(`[lazyGameRoutes] Failed to preload ${id}`, error);
    return null;
  });
};

export const prefetchGames = (ids = []) => {
  if (!Array.isArray(ids) || ids.length === 0) return Promise.resolve([]);
  const unique = Array.from(new Set(ids));
  return Promise.all(unique.map(prefetchGame));
};
