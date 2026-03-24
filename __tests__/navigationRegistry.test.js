const fs = require('fs');
const path = require('path');

const { APP_ROUTE_NAMES, normalizeRoute } = require('../src/app/navigation/routes');
const { lazyGameScreens } = require('../src/games/lazyGameRoutes');
const { isGameScreen } = require('../src/app/navigation/router');

describe('navigation registry', () => {
  it('includes every lazy game route in the normalized app route list', () => {
    const appRoutes = new Set(APP_ROUTE_NAMES);
    Object.keys(lazyGameScreens).forEach((gameRoute) => {
      expect(appRoutes.has(gameRoute)).toBe(true);
      expect(isGameScreen(gameRoute)).toBe(true);
      expect(normalizeRoute(gameRoute).screen).toBe(gameRoute);
    });
  });

  it('normalizes known top-level screens without falling back to home', () => {
    const expectedScreens = [
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
    ];

    expectedScreens.forEach((screen) => {
      expect(normalizeRoute(screen).screen).toBe(screen);
    });
  });

  it('falls back unknown routes to home', () => {
    expect(normalizeRoute('definitelyNotARoute').screen).toBe('home');
  });

  it('keeps renderer-handled screen names registered', () => {
    const rendererPath = path.join(__dirname, '..', 'src', 'ui', 'components', 'ScreenRenderer.jsx');
    const source = fs.readFileSync(rendererPath, 'utf8');
    const caseMatches = [...source.matchAll(/case\s+'([^']+)'/g)].map(match => match[1]);
    const appRoutes = new Set(APP_ROUTE_NAMES);

    caseMatches.forEach((screen) => {
      expect(appRoutes.has(screen)).toBe(true);
    });
  });
});
