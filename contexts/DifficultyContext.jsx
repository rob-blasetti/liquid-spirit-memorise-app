import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';

const DifficultyContext = createContext();

export const DifficultyProvider = ({ children }) => {
  const [level, setLevelState] = useState(1); // default easy
  const [activeGame, setActiveGameState] = useState(null);

  const setLevel = useCallback((nextLevel) => {
    setLevelState(typeof nextLevel === 'number' ? nextLevel : 1);
  }, []);

  const setActiveGame = useCallback((gameId, initialLevel) => {
    setActiveGameState(gameId || null);
    if (Number.isFinite(Number(initialLevel))) {
      setLevelState(Number(initialLevel));
    } else {
      setLevelState(1);
    }
  }, []);

  const contextValue = useMemo(
    () => ({
      level,
      setLevel,
      activeGame,
      setActiveGame,
    }),
    [level, setLevel, activeGame, setActiveGame],
  );

  return (
    <DifficultyContext.Provider value={contextValue}>
      {children}
    </DifficultyContext.Provider>
  );
};

export const useDifficulty = () => useContext(DifficultyContext);
