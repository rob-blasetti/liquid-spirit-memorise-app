import React, { createContext, useContext } from 'react';

const AchievementsContext = createContext({
  achievements: [],
  totalPoints: 0,
  isPointsSynced: true,
  computedPoints: 0,
  notification: null,
  setNotification: () => {},
  awardAchievement: () => {},
  awardGameAchievement: () => {},
});

export const AchievementsProvider = ({ value, children }) => (
  <AchievementsContext.Provider value={value}>
    {children}
  </AchievementsContext.Provider>
);

export const useAchievementsContext = () => useContext(AchievementsContext);

export default AchievementsContext;
