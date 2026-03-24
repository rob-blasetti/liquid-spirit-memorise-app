import { routes } from '../app/navigation/routes';

const EXPLORER_GRADES = [1, 2, 3, 4];

export const createNavigationActions = ({
  goTo,
  nav,
  markGradeVisited,
  visitedGrades,
  awardAchievement,
}) => {
  const markAndMaybeAward = (grade) => {
    const alreadyCompleted = EXPLORER_GRADES.every(g => visitedGrades[g]);
    markGradeVisited(grade);
    if (!awardAchievement) return;
    const updated = { ...visitedGrades, [grade]: true };
    const allVisited = EXPLORER_GRADES.every(g => updated[g]);
    if (!alreadyCompleted && allVisited) {
      awardAchievement('explorer');
    }
  };

  const goHome = () => goTo(routes.home().screen);
  const goGrade1 = () => {
    markAndMaybeAward(1);
    goTo(routes.grade1().screen);
  };
  const goGrade2 = () => {
    markAndMaybeAward(2);
    goTo(routes.grade2().screen);
  };
  const goGrade3 = () => {
    markAndMaybeAward(3);
    goTo('grade3');
  };
  const goGrade4 = () => {
    markAndMaybeAward(4);
    goTo('grade4');
  };

  const goGrade2Set = (setNumber) => {
    const route = routes.grade2Set(setNumber);
    goTo(route.screen, { setNumber: route.setNumber });
  };
  const goGrade2Lesson = (lessonNumber) => {
    const route = routes.grade2Lesson(nav.setNumber, lessonNumber);
    goTo(route.screen, { setNumber: route.setNumber, lessonNumber: route.lessonNumber });
  };
  const goGrade2b = () => {
    markAndMaybeAward(2);
    goTo(routes.grade2b().screen);
  };
  const goGrade2bSet = (setNumber) => {
    const route = routes.grade2bSet(setNumber);
    goTo(route.screen, { setNumber: route.setNumber });
  };
  const goGrade2bLesson = (lessonNumber) => {
    const route = routes.grade2bLesson(nav.setNumber, lessonNumber);
    goTo(route.screen, { setNumber: route.setNumber, lessonNumber: route.lessonNumber });
  };

  const goBackToGrade2Set = () => {
    const route = routes.grade2Set(nav.setNumber);
    goTo(route.screen, { setNumber: route.setNumber });
  };
  const goBackToGrade2bSet = () => {
    const route = routes.grade2bSet(nav.setNumber);
    goTo(route.screen, { setNumber: route.setNumber });
  };
  const goBackToLesson = () => {
    const lessonScreen = nav.lessonScreen || 'grade2Lesson';
    const route = lessonScreen === 'grade2bLesson'
      ? routes.grade2bLesson(nav.setNumber, nav.lessonNumber)
      : lessonScreen === 'grade1Lesson'
      ? routes.grade1Lesson(nav.lessonNumber)
      : routes.grade2Lesson(nav.setNumber, nav.lessonNumber);
    goTo(route.screen, {
      ...(route.setNumber != null ? { setNumber: route.setNumber } : {}),
      ...(route.lessonNumber != null ? { lessonNumber: route.lessonNumber } : {}),
    });
  };
  const goStoryMode = () => {
    goTo(routes.storyMode().screen);
  };

  return {
    goHome,
    goGrade1,
    goGrade2,
    goGrade3,
    goGrade4,
    goGrade2Set,
    goGrade2Lesson,
    goGrade2b,
    goGrade2bSet,
    goGrade2bLesson,
    goBackToGrade2Set,
    goBackToGrade2bSet,
    goBackToLesson,
    goStoryMode,
  };
};
