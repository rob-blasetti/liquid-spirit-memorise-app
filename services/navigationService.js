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

  const goHome = () => goTo('home');
  const goGrade1 = () => {
    markAndMaybeAward(1);
    goTo('grade1');
  };
  const goGrade2 = () => {
    markAndMaybeAward(2);
    goTo('grade2');
  };
  const goGrade3 = () => {
    markAndMaybeAward(3);
    goTo('grade3');
  };
  const goGrade4 = () => {
    markAndMaybeAward(4);
    goTo('grade4');
  };

  const goGrade2Set = (setNumber) => goTo('grade2Set', { setNumber });
  const goGrade2Lesson = (lessonNumber) =>
    goTo('grade2Lesson', { setNumber: nav.setNumber, lessonNumber });
  const goGrade2b = () => {
    markAndMaybeAward(2);
    goTo('grade2b');
  };
  const goGrade2bSet = (setNumber) => goTo('grade2bSet', { setNumber });
  const goGrade2bLesson = (lessonNumber) =>
    goTo('grade2bLesson', { setNumber: nav.setNumber, lessonNumber });

  const goBackToGrade2Set = () => goTo('grade2Set', { setNumber: nav.setNumber });
  const goBackToGrade2bSet = () => goTo('grade2bSet', { setNumber: nav.setNumber });
  const goBackToLesson = () =>
    goTo(nav.lessonScreen || 'grade2Lesson', {
      setNumber: nav.setNumber,
      lessonNumber: nav.lessonNumber,
    });

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
  };
};
