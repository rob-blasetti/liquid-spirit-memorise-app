import React, { createContext, useContext } from 'react';

const AchievementsContext = createContext({
  achievements: [],
  notification: null,
  setNotification: () => {},
  awardAchievement: () => {},
});

export const AchievementsProvider = ({ value, children }) => (
  <AchievementsContext.Provider value={value}>
    {children}
  </AchievementsContext.Provider>
);

export const useAchievementsContext = () => useContext(AchievementsContext);

export default AchievementsContext;
