import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
  useRef,
} from 'react';
import {
  createDefaultEntry,
  loadDifficultyProgress,
  markLevelCompleted,
  persistDifficultyProgress,
  resolveProgressEntry,
  setSelectedLevel,
} from '../../services/difficultyProgressService';

const DifficultyContext = createContext();

const clampLevel = (value) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric < 1) return 1;
  return Math.min(Math.max(Math.floor(numeric), 1), 3);
};

export const DifficultyProvider = ({ children }) => {
  const [level, setLevelState] = useState(1);
  const [activeGame, setActiveGameState] = useState(null);
  const [progressMap, setProgressMap] = useState({});
  const [loaded, setLoaded] = useState(false);

  const progressRef = useRef(progressMap);
  const activeGameRef = useRef(activeGame);

  useEffect(() => {
    progressRef.current = progressMap;
  }, [progressMap]);

  useEffect(() => {
    activeGameRef.current = activeGame;
  }, [activeGame]);

  useEffect(() => {
    let cancelled = false;
    const hydrate = async () => {
      const stored = await loadDifficultyProgress();
      if (cancelled) return;
      setProgressMap(stored);
      setLoaded(true);
      const currentEntry = resolveProgressEntry(stored, activeGameRef.current);
      setLevelState(currentEntry.currentLevel || currentEntry.highestUnlocked || 1);
    };
    hydrate();
    return () => {
      cancelled = true;
    };
  }, []);

  const persist = useCallback((next) => {
    persistDifficultyProgress(next);
  }, []);

  const setLevel = useCallback((nextLevel) => {
    const resolved = clampLevel(nextLevel);
    setLevelState(resolved);
    const gameId = activeGameRef.current;
    if (!gameId) return;
    setProgressMap((prev) => {
      const updated = setSelectedLevel(prev, gameId, resolved);
      if (updated === prev) {
        const entry = resolveProgressEntry(prev, gameId, { fallbackToGlobal: false });
        const clampedSelection = Math.min(resolved, entry.highestUnlocked || resolved);
        if (clampedSelection !== resolved) {
          setLevelState(clampedSelection);
        }
        return prev;
      }
      const entry = resolveProgressEntry(updated, gameId, { fallbackToGlobal: false });
      setLevelState(entry.currentLevel || entry.highestUnlocked || resolved);
      persist(updated);
      return updated;
    });
  }, [persist]);

  const setActiveGame = useCallback((gameId) => {
    const normalizedId = gameId ? String(gameId) : null;
    setActiveGameState(normalizedId);
    const entry = resolveProgressEntry(progressRef.current, normalizedId, { fallbackToGlobal: false });
    setLevelState(entry.currentLevel || entry.highestUnlocked || 1);
  }, []);

  const markLevelComplete = useCallback((gameId, completedLevel) => {
    if (completedLevel == null) return;
    const targetGame = gameId ? String(gameId) : activeGameRef.current;
    if (!targetGame) return;
    setProgressMap((prev) => {
      const updated = markLevelCompleted(prev, targetGame, completedLevel);
      if (updated === prev) return prev;
      persist(updated);
      const entry = resolveProgressEntry(updated, targetGame, { fallbackToGlobal: false });
      if (targetGame === activeGameRef.current) {
        setLevelState(entry.currentLevel || entry.highestUnlocked || clampLevel(completedLevel));
      }
      return updated;
    });
  }, [persist]);

  const resetProgress = useCallback(() => {
    setProgressMap({});
    setLevelState(1);
    setActiveGameState(null);
    persist({});
  }, [persist]);

  const getProgressForGame = useCallback(
    (gameId, options = {}) =>
      resolveProgressEntry(progressMap, gameId, { fallbackToGlobal: false, ...options }),
    [progressMap],
  );

  const ensureEntryForGame = useCallback((gameId) => {
    const key = gameId ? String(gameId) : null;
    if (!key) return;
    setProgressMap((prev) => {
      if (prev[key]) return prev;
      const next = { ...prev, [key]: createDefaultEntry() };
      persist(next);
      return next;
    });
  }, [persist]);

  useEffect(() => {
    if (!activeGame) return;
    ensureEntryForGame(activeGame);
  }, [activeGame, ensureEntryForGame]);

  const contextValue = useMemo(
    () => ({
      level,
      setLevel,
      activeGame,
      setActiveGame,
      markLevelComplete,
      getProgressForGame,
      progressMap,
      loaded,
      resetProgress,
    }),
    [level, setLevel, activeGame, setActiveGame, markLevelComplete, getProgressForGame, progressMap, loaded, resetProgress],
  );

  return (
    <DifficultyContext.Provider value={contextValue}>
      {children}
    </DifficultyContext.Provider>
  );
};

export const useDifficulty = () => useContext(DifficultyContext);
