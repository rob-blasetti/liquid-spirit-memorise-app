import { useState, useCallback } from 'react';

const INITIAL_NAV_STATE = { screen: 'home' };

export default function useNavigationHandlers(initialState = INITIAL_NAV_STATE) {
  const [nav, setNav] = useState(initialState);
  const [visitedGrades, setVisitedGrades] = useState({ 1: false, 2: false, 3: false, 4: false });

  const goTo = useCallback((screen, extra = {}) => {
    setNav({ screen, ...extra });
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
