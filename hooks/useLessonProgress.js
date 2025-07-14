import { useState } from 'react';

export default function useLessonProgress(awardAchievement) {
  const [completedLessons, setCompletedLessons] = useState({});
  const [overrideProgress, setOverrideProgress] = useState(null);

  const completeLesson = (setNumber, lessonNumber) => {
    setCompletedLessons(prev => {
      const lessons = prev[setNumber] || {};
      const updated = { ...prev, [setNumber]: { ...lessons, [lessonNumber]: true } };
      if (updated[setNumber] && updated[setNumber][1] && updated[setNumber][2] && updated[setNumber][3]) {
        awardAchievement(`set${setNumber}`);
      }
      if ([1,2,3].every(num => {
        const l = updated[num];
        return l && l[1] && l[2] && l[3];
      })) {
        awardAchievement('grade2');
      }
      return updated;
    });
  };

  const getCurrentProgress = () => {
    if (overrideProgress) return overrideProgress;
    return { setNumber: 1, lessonNumber: 1 };
  };

  return {
    completedLessons,
    overrideProgress,
    setOverrideProgress,
    completeLesson,
    getCurrentProgress,
  };
}
