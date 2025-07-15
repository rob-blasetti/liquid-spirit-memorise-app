// games/index.js
// Registry of available games for Daily Challenge

// List of game IDs. Each ID corresponds to a game component and route in App.
export const gameIds = [
  'memoryGame',
  'shapeBuilderGame',
  'hangmanGame',
  'bubblePopOrderGame',
  // 'practice',
  // 'tapGame',
  // 'scrambleGame',
  // 'nextWordGame',
  // 'flashGame',
  // 'revealGame',
  // 'firstLetterGame',
  // 'letterScrambleGame',
  // 'fastTypeGame',
  // 'fillBlankGame',
  // 'colorSwitchGame',
  // 'rhythmRepeatGame',
  // 'silhouetteSearchGame',
  // 'memoryMazeGame',
  // 'sceneChangeGame',
  // 'wordSwapGame',
  // 'buildRecallGame',
];

/**
 * Pick a random game ID from the registry.
 * @returns {string} one of the game IDs
 */
export function pickRandomGame() {
  const idx = Math.floor(Math.random() * gameIds.length);
  return gameIds[idx];
}
