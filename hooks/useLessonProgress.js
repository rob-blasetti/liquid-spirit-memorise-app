import { useState, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { grade1Lessons } from '../data/grade1';

// Hook for tracking and overriding lesson progress
// Accepts profile (to derive grade-specific defaults) and awardAchievement callback
// Hook to track completed lessons and per-profile override progress
export default function useLessonProgress(profile, awardAchievement, recordLessonCompletion) {
  const [completedLessons, setCompletedLessons] = useState({});
  // Map overrides by profile key in-memory
  const overrideMap = useRef({});
  // Current override for active profile
  const [overrideProgress, setOverrideProgressInternal] = useState(null);

  /**
   * Mark a lesson complete and award any milestones
   */
  const completeLesson = (setNumber, lessonNumber, lessonContent = {}, meta = {}) => {
    const grade = meta?.grade;
    if (grade === 1) {
      let isNew = false;
      setCompletedLessons(prev => {
        const lessons = prev.grade1 || {};
        if (lessons[lessonNumber]) {
          return prev;
        }
        isNew = true;
        const updatedLessons = { ...lessons, [lessonNumber]: true };
        return { ...prev, grade1: updatedLessons };
      });
      if (isNew && recordLessonCompletion) {
        recordLessonCompletion({ grade: 1, setNumber: meta?.setNumber ?? 0, lessonNumber, lessonContent });
      }
      return;
    }

    let isNew = false;
    setCompletedLessons(prev => {
      const lessons = prev[setNumber] || {};
      if (lessons[lessonNumber]) {
        return prev;
      }
      isNew = true;
      const updatedLessons = { ...lessons, [lessonNumber]: true };
      const updated = { ...prev, [setNumber]: updatedLessons };
      if (
        awardAchievement &&
        typeof setNumber === 'number' &&
        setNumber >= 1 &&
        setNumber <= 4 &&
        updatedLessons[1] &&
        updatedLessons[2] &&
        updatedLessons[3]
      ) {
        awardAchievement(`set${setNumber}`);
      }
      if (awardAchievement) {
        const gradeTwoSets = [1, 2, 3];
        const allGradeTwoComplete = gradeTwoSets.every((num) => {
          const lessonMap = updated[num];
          return lessonMap && lessonMap[1] && lessonMap[2] && lessonMap[3];
        });
        if (allGradeTwoComplete) {
          awardAchievement('grade2');
        }
      }
      return updated;
    });
    if (isNew && recordLessonCompletion) {
      recordLessonCompletion({ grade: meta?.grade ?? 2, setNumber, lessonNumber, lessonContent });
    }
  };

  /**
   * Compute current progress: override if present, else default by grade
   */
  const getCurrentProgress = () => {
    if (overrideProgress) return overrideProgress;
    const grade = profile && profile.grade;
    const gradeStr = String(grade);
    // Default starting point based on grade
    if (gradeStr === '1') {
      // Grade 1 has no sets; starts at Lesson 1
      return { lessonNumber: 1 };
    }
    if (gradeStr === '2') {
      // Grade 2 starts at Set 1, Lesson 1
      return { setNumber: 1, lessonNumber: 1 };
    }
    if (gradeStr === '2b') {
      // Grade 2b starts at Set 4, Lesson 1
      return { setNumber: 4, lessonNumber: 1 };
    }
    // Fallback: start at first set and lesson
    return { setNumber: 1, lessonNumber: 1 };
  };

  /**
   * Generate storage key per profile
   */
  const getProgressKey = () => {
    // Use unique profile ID for persistence; fallback to default
    if (profile && profile._id) {
      return `progress:${profile._id}`;
    }
    return 'progress:default';
  };

  /**
   * Set override for current profile and persist
   */
  const setOverrideProgress = async (progress) => {
    setOverrideProgressInternal(progress);
    const key = getProgressKey();
    overrideMap.current[key] = progress;
    try {
      if (progress) {
        await AsyncStorage.setItem(key, JSON.stringify(progress));
      } else {
        await AsyncStorage.removeItem(key);
      }
    } catch (e) {
      console.error('Error saving progress override:', e);
    }
  };

  // On profile change, load saved override from memory or storage
  useEffect(() => {
    const key = getProgressKey();
    const mem = overrideMap.current[key];
    if (mem !== undefined) {
      setOverrideProgressInternal(mem);
    } else {
      AsyncStorage.getItem(key)
        .then(str => {
          const saved = str ? JSON.parse(str) : null;
          overrideMap.current[key] = saved;
          setOverrideProgressInternal(saved);
        })
        .catch(e => console.error('Error loading progress override:', e));
    }
  }, [profile]);

  return {
    completedLessons,
    overrideProgress,
    setOverrideProgress,
    completeLesson,
    getCurrentProgress,
  };
}
