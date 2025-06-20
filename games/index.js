// games/index.js
// Registry of available games for Daily Challenge

// List of game IDs. Each ID corresponds to a game component and route in App.
export const gameIds = [
  'practice',
  'tapGame',
  'scrambleGame',
  'nextWordGame',
  'memoryGame',
  'flashGame',
  'revealGame',
  'firstLetterGame',
  'letterScrambleGame',
  'fastTypeGame',
];

/**
 * Pick a random game ID from the registry.
 * @returns {string} one of the game IDs
 */
export function pickRandomGame() {
  const idx = Math.floor(Math.random() * gameIds.length);
  return gameIds[idx];
}
