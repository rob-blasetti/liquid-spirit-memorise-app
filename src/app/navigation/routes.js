const HOME_SCREEN = 'home';

export const APP_ROUTE_NAMES = Object.freeze([
  'home',
  'achievements',
  'games',
  'settings',
  'class',
  'lessonJourney',
  'coloringGallery',
  'grades',
  'grade1',
  'grade1Lesson',
  'grade2',
  'grade2Set',
  'grade2Lesson',
  'grade2b',
  'grade2bSet',
  'grade2bLesson',
  'grade3',
  'grade4',
  'storyMode',
  'gameVictory',
]);

export const createRoute = (screen, params = {}) => ({ screen, ...params });

export const normalizeRoute = (screen, params = {}) => {
  if (!screen || typeof screen !== 'string') {
    return createRoute(HOME_SCREEN);
  }

  const normalizedScreen = APP_ROUTE_NAMES.includes(screen) ? screen : HOME_SCREEN;
  return createRoute(normalizedScreen, params && typeof params === 'object' ? params : {});
};

export const routes = {
  home: () => createRoute('home'),
  achievements: (params = {}) => createRoute('achievements', params),
  games: () => createRoute('games'),
  settings: () => createRoute('settings'),
  class: () => createRoute('class'),
  lessonJourney: () => createRoute('lessonJourney'),
  coloringGallery: (params = {}) => createRoute('coloringGallery', params),
  grades: () => createRoute('grades'),
  grade1: () => createRoute('grade1'),
  grade1Lesson: (lessonNumber, extra = {}) =>
    createRoute('grade1Lesson', { lessonNumber, ...extra }),
  grade2: () => createRoute('grade2'),
  grade2Set: (setNumber) => createRoute('grade2Set', { setNumber }),
  grade2Lesson: (setNumber, lessonNumber, extra = {}) =>
    createRoute('grade2Lesson', { setNumber, lessonNumber, ...extra }),
  grade2b: () => createRoute('grade2b'),
  grade2bSet: (setNumber) => createRoute('grade2bSet', { setNumber }),
  grade2bLesson: (setNumber, lessonNumber, extra = {}) =>
    createRoute('grade2bLesson', { setNumber, lessonNumber, ...extra }),
  storyMode: () => createRoute('storyMode'),
  gameVictory: (params = {}) => createRoute('gameVictory', params),
};
