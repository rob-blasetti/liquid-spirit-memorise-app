import React, { createContext, useContext, useState } from 'react';

const DifficultyContext = createContext();

export const DifficultyProvider = ({ children }) => {
  const [level, setLevel] = useState(1); // default easy
  return (
    <DifficultyContext.Provider value={{ level, setLevel }}>
      {children}
    </DifficultyContext.Provider>
  );
};

export const useDifficulty = () => useContext(DifficultyContext);
