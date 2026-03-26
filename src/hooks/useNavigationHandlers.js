import { startTransition, useState, useCallback, useRef } from 'react';
import { markNavigationStart } from '../services/performanceService';
import { normalizeRoute } from '../app/navigation/routes';
import { prefetchGame } from '../games/lazyGameRoutes';

const INITIAL_NAV_STATE = normalizeRoute('home');

const normalizeModule = (mod) => mod?.default || mod;
const routeLoaderCache = new Map();
const routePreloaders = {
  home: () => import('../screens/profile/HomeScreen'),
  achievements: () => import('../screens/achievements/AchievementsScreen'),
  games: () => import('../screens/games/GamesListScreen'),
  settings: () => import('../screens/profile/SettingsScreen'),
  class: () => import('../screens/profile/ClassScreen'),
  lessonJourney: () => import('../screens/profile/LessonJourneyScreen'),
  coloringGallery: () => import('../screens/games/ColoringGalleryScreen'),
  grades: () => import('../screens/profile/LibraryScreen'),
  grade1: () => import('../screens/profile/GradeScreen'),
  grade1Lesson: () => import('../screens/profile/GradeScreen'),
  grade2: () => import('../screens/profile/GradeScreen'),
  grade2Set: () => import('../screens/profile/GradeScreen'),
  grade2Lesson: () => import('../screens/profile/GradeScreen'),
  grade2b: () => import('../screens/profile/GradeScreen'),
  grade2bSet: () => import('../screens/profile/GradeScreen'),
  grade2bLesson: () => import('../screens/profile/GradeScreen'),
  grade3: () => import('../screens/profile/GradeScreen'),
  grade4: () => import('../screens/profile/GradeScreen'),
  storyMode: () => import('../screens/games/StoryModeScreen'),
  gameVictory: () => import('../screens/games/GameVictoryScreen'),
};

const runInTransition = (callback) => {
  if (typeof startTransition === 'function') {
    startTransition(callback);
    return;
  }
  callback();
};

const preloadRoute = (screen) => {
  if (!screen) return Promise.resolve(null);

  const routeLoader = routePreloaders[screen];
  if (routeLoader) {
    if (!routeLoaderCache.has(screen)) {
      const loadPromise = routeLoader()
        .then(normalizeModule)
        .catch((error) => {
          routeLoaderCache.delete(screen);
          throw error;
        });
      routeLoaderCache.set(screen, loadPromise);
    }
    return routeLoaderCache.get(screen);
  }

  return prefetchGame(screen);
};

export default function useNavigationHandlers(initialState = INITIAL_NAV_STATE) {
  const [nav, setNav] = useState(initialState);
  const [visitedGrades, setVisitedGrades] = useState({ 1: false, 2: false, 3: false, 4: false });
  const latestNavigationRequestRef = useRef(0);

  const goTo = useCallback((screen, extra = {}) => {
    if (!screen) return;

    const requestId = latestNavigationRequestRef.current + 1;
    latestNavigationRequestRef.current = requestId;

    Promise.resolve(preloadRoute(screen))
      .catch((error) => {
        if (__DEV__) {
          console.warn(`[navigation] Failed to preload route "${screen}"`, error);
        }
        return null;
      })
      .finally(() => {
        if (latestNavigationRequestRef.current !== requestId) {
          return;
        }

        runInTransition(() => {
          setNav((prevNav) => {
            const nextNav = normalizeRoute(screen, extra);
            const previousScreen = prevNav?.screen ?? null;
            if (previousScreen !== screen) {
              markNavigationStart(screen, { from: previousScreen });
            }
            return nextNav;
          });
        });
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
