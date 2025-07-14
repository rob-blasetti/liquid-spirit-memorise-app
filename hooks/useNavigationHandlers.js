import { useState } from 'react';

export default function useNavigationHandlers() {
  const [nav, setNav] = useState({ screen: 'home' });

  const goTo = (screen, extra = {}) => setNav({ screen, ...extra });

  const visitGrade = (g, visitedGrades, setVisitedGrades, awardAchievement) => {
    setVisitedGrades(prev => {
      const updated = { ...prev, [g]: true };
      if (updated[1] && updated[2] && updated[3] && updated[4]) {
        awardAchievement('explorer');
      }
      return updated;
    });
  };

  return {
    nav,
    goTo,
    setNav,
    visitGrade,
  };
}
