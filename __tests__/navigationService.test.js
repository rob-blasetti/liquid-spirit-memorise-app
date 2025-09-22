const { createNavigationActions } = require('../services/navigationService');

describe('createNavigationActions', () => {
  let goTo;
  let visitedGrades;
  let awardAchievement;

  beforeEach(() => {
    goTo = jest.fn();
    awardAchievement = jest.fn();
    visitedGrades = { 1: false, 2: false, 3: false, 4: false };
  });

  it('awards explorer achievement after visiting each grade once', () => {
    const markGradeVisited = jest.fn((grade) => {
      visitedGrades[grade] = true;
    });
    const actions = createNavigationActions({
      goTo,
      nav: {},
      markGradeVisited,
      visitedGrades,
      awardAchievement,
    });

    actions.goGrade1();
    actions.goGrade2();
    actions.goGrade3();
    actions.goGrade4();

    expect(goTo).toHaveBeenCalledWith('grade1');
    expect(goTo).toHaveBeenCalledWith('grade2');
    expect(goTo).toHaveBeenCalledWith('grade3');
    expect(goTo).toHaveBeenCalledWith('grade4');
    expect(awardAchievement).toHaveBeenCalledWith('explorer');
    expect(awardAchievement).toHaveBeenCalledTimes(1);
  });

  it('returns to remembered lesson when navigating back to lesson screen', () => {
    const nav = { setNumber: 2, lessonNumber: 5, lessonScreen: 'grade2Lesson' };
    const markGradeVisited = jest.fn();
    const actions = createNavigationActions({
      goTo,
      nav,
      markGradeVisited,
      visitedGrades,
      awardAchievement,
    });

    actions.goBackToLesson();

    expect(goTo).toHaveBeenCalledWith('grade2Lesson', {
      setNumber: 2,
      lessonNumber: 5,
    });
  });
});
