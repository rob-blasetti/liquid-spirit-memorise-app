import { useState, useCallback } from 'react';
import { markNavigationStart } from '../services/performanceService';
import { normalizeRoute } from '../app/navigation/routes';

const INITIAL_NAV_STATE = normalizeRoute('home');

export default function useNavigationHandlers(initialState = INITIAL_NAV_STATE) {
  const [nav, setNav] = useState(initialState);
  const [visitedGrades, setVisitedGrades] = useState({ 1: false, 2: false, 3: false, 4: false });

  const goTo = useCallback((screen, extra = {}) => {
    if (!screen) return;
    setNav((prevNav) => {
      const nextNav = normalizeRoute(screen, extra);
      const previousScreen = prevNav?.screen ?? null;
      if (previousScreen !== screen) {
        markNavigationStart(screen, { from: previousScreen });
      }
      return nextNav;
    });
  }, []);

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
