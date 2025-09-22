jest.mock('../services/contentSelector', () => ({
  getContentFor: jest.fn(() => 'mock-quote'),
}));

const { getContentFor } = require('../services/contentSelector');
const { createAppActions } = require('../services/appFlowService');

describe('createAppActions', () => {
  const profile = { id: 'user-1', grade: 2 };
  let goTo;
  let getCurrentProgress;
  let awardAchievement;

  beforeEach(() => {
    goTo = jest.fn();
    getCurrentProgress = jest.fn(() => ({ setNumber: 2, lessonNumber: 3 }));
    awardAchievement = jest.fn();
    getContentFor.mockClear();
  });

  it('handles daily challenge by awarding achievement and navigating to practice', () => {
    getContentFor.mockReturnValueOnce('daily-prayer');
    const actions = createAppActions({ profile, goTo, nav: { screen: 'home' }, getCurrentProgress, awardAchievement });

    actions.handleDailyChallenge();

    expect(awardAchievement).toHaveBeenCalledWith('daily');
    expect(getCurrentProgress).toHaveBeenCalledTimes(1);
    expect(getContentFor).toHaveBeenCalledWith(profile, 2, 3, { type: 'prayer' });
    expect(goTo).toHaveBeenCalledWith('practice', {
      quote: 'daily-prayer',
      setNumber: 2,
      lessonNumber: 3,
    });
  });

  it('starts selected game with quote and progress metadata', () => {
    getCurrentProgress.mockReturnValueOnce({ setNumber: 1, lessonNumber: 4 });
    getContentFor.mockReturnValueOnce('game-quote');
    const nav = { screen: 'grade2Lesson' };
    const actions = createAppActions({ profile, goTo, nav, getCurrentProgress, awardAchievement });

    actions.playSelectedGame('tapGame');

    expect(getCurrentProgress).toHaveBeenCalledTimes(1);
    expect(getContentFor).toHaveBeenCalledWith(profile, 1, 4, { type: 'quote' });
    expect(goTo).toHaveBeenCalledWith('tapGame', {
      quote: 'game-quote',
      setNumber: 1,
      lessonNumber: 4,
      fromGames: true,
      lessonScreen: 'grade2Lesson',
    });
  });

  it('returns home progress snapshot', () => {
    const actions = createAppActions({ profile, goTo, nav: { screen: 'home' }, getCurrentProgress, awardAchievement });
    const progress = actions.getHomeProgress();

    expect(progress).toEqual({ setNumber: 2, lessonNumber: 3 });
  });
});
