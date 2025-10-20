import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'difficultyProgress';
const LEGACY_STORAGE_KEY = 'completedDifficulties';
const LEGACY_LEVEL_KEYS = ['1', '2', '3'];
const GLOBAL_GAME_KEY = '__global';
export const MAX_DIFFICULTY_LEVEL = 3;

const clampLevel = (value) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric < 1) {
    return 1;
  }
  return Math.min(Math.max(Math.floor(numeric), 1), MAX_DIFFICULTY_LEVEL);
};

const computeHighestUnlocked = (completed = {}) => {
  let highest = 1;
  for (let lvl = 1; lvl <= MAX_DIFFICULTY_LEVEL; lvl += 1) {
    if (completed?.[lvl]) {
      highest = Math.min(lvl + 1, MAX_DIFFICULTY_LEVEL);
    } else {
      break;
    }
  }
  return highest;
};

const normalizeLevelMap = (value) => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  return Object.keys(value).reduce((acc, key) => {
    const level = Number(key);
    if (Number.isFinite(level) && level > 0) {
      acc[level] = Boolean(value[key]);
    }
    return acc;
  }, {});
};

export const createDefaultEntry = () => ({
  completed: {},
  highestUnlocked: 1,
  currentLevel: 1,
});

const normalizeEntry = (raw) => {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return createDefaultEntry();
  }

  const completed = normalizeLevelMap(raw.completed || raw);
  const fallbackHighest = computeHighestUnlocked(completed);

  const numericHighest = Number(raw.highestUnlocked);
  const highestUnlocked = Number.isFinite(numericHighest)
    ? clampLevel(numericHighest)
    : fallbackHighest;

  const numericCurrent = Number(raw.currentLevel);
  const currentLevel = Number.isFinite(numericCurrent)
    ? clampLevel(Math.min(numericCurrent, highestUnlocked))
    : highestUnlocked;

  return {
    completed,
    highestUnlocked,
    currentLevel,
  };
};

const toEntryFromLegacy = (raw) => {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return createDefaultEntry();
  }

  const hasStructuredShape =
    Object.prototype.hasOwnProperty.call(raw, 'completed')
    || Object.prototype.hasOwnProperty.call(raw, 'highestUnlocked')
    || Object.prototype.hasOwnProperty.call(raw, 'currentLevel');

  if (hasStructuredShape) {
    return normalizeEntry(raw);
  }

  return normalizeEntry({ completed: raw });
};

const normalizeProgressMap = (raw) => {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return {};
  }

  const keys = Object.keys(raw);
  const isLegacyRoot = keys.every((key) => LEGACY_LEVEL_KEYS.includes(key));

  if (isLegacyRoot) {
    return { [GLOBAL_GAME_KEY]: toEntryFromLegacy(raw) };
  }

  return keys.reduce((acc, key) => {
    acc[key] = toEntryFromLegacy(raw[key]);
    return acc;
  }, {});
};

export const loadDifficultyProgress = async () => {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return normalizeProgressMap(parsed);
    }

    const legacy = await AsyncStorage.getItem(LEGACY_STORAGE_KEY);
    if (legacy) {
      const parsedLegacy = JSON.parse(legacy);
      const normalizedLegacy = normalizeProgressMap(parsedLegacy);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(normalizedLegacy));
      await AsyncStorage.removeItem(LEGACY_STORAGE_KEY);
      return normalizedLegacy;
    }
  } catch (error) {
    console.error('Failed to load difficulty progress:', error);
  }
  return {};
};

export const persistDifficultyProgress = async (progress) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (error) {
    console.error('Failed to persist difficulty progress:', error);
  }
};

export const resolveProgressEntry = (progressMap, gameId, { fallbackToGlobal = true } = {}) => {
  if (!progressMap || typeof progressMap !== 'object') {
    return createDefaultEntry();
  }

  const key = gameId ? String(gameId) : null;
  if (key && progressMap[key]) {
    return normalizeEntry(progressMap[key]);
  }

  if (fallbackToGlobal && progressMap[GLOBAL_GAME_KEY]) {
    return normalizeEntry(progressMap[GLOBAL_GAME_KEY]);
  }

  return createDefaultEntry();
};

export const updateProgressEntry = (progressMap, gameId, updater) => {
  if (typeof updater !== 'function') return progressMap;

  const key = gameId ? String(gameId) : null;
  if (!key) return progressMap;

  const currentEntry = resolveProgressEntry(progressMap, key, { fallbackToGlobal: false });
  const nextEntry = normalizeEntry(updater(currentEntry));

  const entriesEqual =
    currentEntry.highestUnlocked === nextEntry.highestUnlocked
    && currentEntry.currentLevel === nextEntry.currentLevel
    && shallowEqual(currentEntry.completed, nextEntry.completed);

  if (entriesEqual) {
    return progressMap;
  }

  return {
    ...progressMap,
    [key]: nextEntry,
  };
};

const shallowEqual = (a = {}, b = {}) => {
  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);
  if (aKeys.length !== bKeys.length) return false;
  for (let i = 0; i < aKeys.length; i += 1) {
    const key = aKeys[i];
    if (a[key] !== b[key]) return false;
  }
  return true;
};

export const markLevelCompleted = (progressMap, gameId, level) => {
  const numericLevel = clampLevel(level);
  return updateProgressEntry(progressMap, gameId, (entry) => {
    const completed = { ...entry.completed, [numericLevel]: true };
    const unlockedCandidate = clampLevel(numericLevel + 1);
    const highestUnlocked = Math.max(entry.highestUnlocked || 1, unlockedCandidate, numericLevel);
    const currentLevel = Math.max(entry.currentLevel || 1, highestUnlocked);
    return {
      completed,
      highestUnlocked,
      currentLevel,
    };
  });
};

export const setSelectedLevel = (progressMap, gameId, level) => {
  const numericLevel = clampLevel(level);
  return updateProgressEntry(progressMap, gameId, (entry) => {
    const clamped = Math.min(numericLevel, entry.highestUnlocked || numericLevel);
    return {
      ...entry,
      currentLevel: clamped,
    };
  });
};

export const clearDifficultyProgress = async () => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear difficulty progress:', error);
  }
};

export { GLOBAL_GAME_KEY };
