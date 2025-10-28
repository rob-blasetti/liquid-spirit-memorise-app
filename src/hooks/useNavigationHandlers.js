import { useState, useCallback } from 'react';
import { markNavigationStart } from '../services/performanceService';

const INITIAL_NAV_STATE = { screen: 'home' };

export default function useNavigationHandlers(initialState = INITIAL_NAV_STATE) {
  const [nav, setNav] = useState(initialState);
  const [visitedGrades, setVisitedGrades] = useState({ 1: false, 2: false, 3: false, 4: false });

  const goTo = useCallback(
    (screen, extra = {}) => {
      if (!screen) return;
      setNav((prevNav) => {
        const nextNav = { screen, ...extra };
        const previousScreen = prevNav?.screen ?? null;
        if (previousScreen !== screen) {
          markNavigationStart(screen, { from: previousScreen });
        }
        return nextNav;
      });
    },
    [markNavigationStart],
  );

  const markGradeVisited = useCallback((grade) => {
    setVisitedGrades(prev => {
      if (prev[grade]) return prev;
      return { ...prev, [grade]: true };
    });
  }, []);

  return {
    nav,
    goTo,
    setNav,
    visitedGrades,
    markGradeVisited,
  };
}
