import { useState, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Hook for tracking and overriding lesson progress
// Accepts profile (to derive grade-specific defaults) and awardAchievement callback
// Hook to track completed lessons and per-profile override progress
export default function useLessonProgress(profile, awardAchievement) {
  const [completedLessons, setCompletedLessons] = useState({});
  // Map overrides by profile key in-memory
  const overrideMap = useRef({});
  // Current override for active profile
  const [overrideProgress, setOverrideProgressInternal] = useState(null);

  /**
   * Mark a lesson complete and award any milestones
   */
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
