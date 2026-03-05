import { useState, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { grade1Lessons } from '../utils/data/core/grade1';
import { GRADE_SCREEN_CONFIG } from '../utils/data/core/gradesConfig';

// Hook for tracking and overriding lesson progress
// Accepts profile (to derive grade-specific defaults) and awardAchievement callback
// Hook to track completed lessons and per-profile override progress
export default function useLessonProgress(profile, awardAchievement, recordLessonCompletion) {
  const [completedLessons, setCompletedLessons] = useState({});
  // Map overrides by profile key in-memory
  const overrideMap = useRef({});
  // Current override for active profile
  const [overrideProgress, setOverrideProgressInternal] = useState(null);
  const [journeyProgressByGrade, setJourneyProgressByGrade] = useState({});

  const getJourneyDefaults = () => ({
    1: { lessonNumber: 1 },
    2: { setNumber: 1, lessonNumber: 1 },
    '2b': { setNumber: 4, lessonNumber: 1 },
  });

  const getJourneyKey = () => {
    const profileId =
      profile?._id ??
      profile?.id ??
      profile?.nuriUserId ??
      profile?.profileId;
    if (profileId) {
      return `journey:${profileId}`;
    }
    return 'journey:default';
  };

  const normalizeJourneyMap = (rawMap) => {
    const defaults = getJourneyDefaults();
    if (!rawMap || typeof rawMap !== 'object') {
      return defaults;
    }
    return {
      1: {
        lessonNumber: Number(rawMap?.[1]?.lessonNumber ?? rawMap?.['1']?.lessonNumber ?? 1) || 1,
      },
      2: {
        setNumber: Number(rawMap?.[2]?.setNumber ?? rawMap?.['2']?.setNumber ?? 1) || 1,
        lessonNumber: Number(rawMap?.[2]?.lessonNumber ?? rawMap?.['2']?.lessonNumber ?? 1) || 1,
      },
      '2b': {
        setNumber: Number(rawMap?.['2b']?.setNumber ?? 4) || 4,
        lessonNumber: Number(rawMap?.['2b']?.lessonNumber ?? 1) || 1,
      },
    };
  };

  const persistJourneyMap = async (nextMap) => {
    const key = getJourneyKey();
    try {
      await AsyncStorage.setItem(key, JSON.stringify(nextMap));
    } catch (error) {
      console.error('Error saving journey progress:', error);
    }
  };

  const getProgressForGrade = (grade) => {
    const key = String(grade);
    const defaults = getJourneyDefaults();
    if (!Object.prototype.hasOwnProperty.call(defaults, key)) {
      return { setNumber: 1, lessonNumber: 1 };
    }
    return journeyProgressByGrade?.[key] || defaults[key];
  };

  const getNextProgressForGrade = (grade, currentProgress = {}) => {
    const gradeKey = String(grade);
    if (gradeKey === '1') {
      const maxLesson = Math.max(1, grade1Lessons.length);
      const currentLesson = Number(currentProgress?.lessonNumber) || 1;
      return { lessonNumber: Math.min(currentLesson + 1, maxLesson) };
    }
    if (gradeKey === '2' || gradeKey === '2b') {
      const config = GRADE_SCREEN_CONFIG[gradeKey] || GRADE_SCREEN_CONFIG[Number(gradeKey)];
      const sets = Array.isArray(config?.sets) ? config.sets : [1];
      const lessons = Array.isArray(config?.lessonNumbers) ? config.lessonNumbers : [1];
      const firstSet = sets[0];
      const firstLesson = lessons[0];

      const currentSet = Number(currentProgress?.setNumber);
      const currentLesson = Number(currentProgress?.lessonNumber);
      const setIndex = sets.indexOf(currentSet);
      const lessonIndex = lessons.indexOf(currentLesson);
      const resolvedSetIndex = setIndex >= 0 ? setIndex : 0;
      const resolvedLessonIndex = lessonIndex >= 0 ? lessonIndex : 0;

      if (resolvedLessonIndex < lessons.length - 1) {
        return { setNumber: sets[resolvedSetIndex], lessonNumber: lessons[resolvedLessonIndex + 1] };
      }
      if (resolvedSetIndex < sets.length - 1) {
        return { setNumber: sets[resolvedSetIndex + 1], lessonNumber: firstLesson };
      }
      return { setNumber: sets[resolvedSetIndex] || firstSet, lessonNumber: lessons[resolvedLessonIndex] || firstLesson };
    }
    return currentProgress;
  };

  const setProgressForGrade = (grade, progress) => {
    const gradeKey = String(grade);
    const defaults = getJourneyDefaults();
    const nextProgress = (() => {
      if (gradeKey === '1') {
        return {
          lessonNumber: Number(progress?.lessonNumber) || defaults[1].lessonNumber,
        };
      }
      if (gradeKey === '2' || gradeKey === '2b') {
        const fallback = defaults[gradeKey];
        return {
          setNumber: Number(progress?.setNumber) || fallback.setNumber,
          lessonNumber: Number(progress?.lessonNumber) || fallback.lessonNumber,
        };
      }
      return progress;
    })();

    let computedMap;
    setJourneyProgressByGrade((prev) => {
      computedMap = {
        ...normalizeJourneyMap(prev),
        [gradeKey]: nextProgress,
      };
      return computedMap;
    });
    if (computedMap) {
      persistJourneyMap(computedMap);
    }
  };

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
      const nextProgress = getNextProgressForGrade(1, { lessonNumber });
      setProgressForGrade(1, nextProgress);
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
    const journeyGrade = String(meta?.grade ?? 2);
    const nextProgress = getNextProgressForGrade(journeyGrade, { setNumber, lessonNumber });
    setProgressForGrade(journeyGrade, nextProgress);
  };

  /**
   * Compute current progress: override if present, else default by grade
   */
  const getCurrentProgress = () => {
    if (overrideProgress) return overrideProgress;
    const grade = profile?.grade;
    return getProgressForGrade(grade);
  };

  /**
   * Generate storage key per profile
   */
  const getProgressKey = () => {
    // Use unique profile ID for persistence; fallback to default
    const profileId =
      profile?._id ??
      profile?.id ??
      profile?.nuriUserId ??
      profile?.profileId;
    if (profileId) {
      return `progress:${profileId}`;
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
    const profileGrade = String(profile?.grade || '');
    if (profileGrade === '1') {
      setProgressForGrade(1, { lessonNumber: progress?.lessonNumber || 1 });
    } else if (profileGrade === '2' || profileGrade === '2b') {
      const fallbackSet = profileGrade === '2b' ? 4 : 1;
      setProgressForGrade(profileGrade, {
        setNumber: progress?.setNumber || fallbackSet,
        lessonNumber: progress?.lessonNumber || 1,
      });
    }
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

  useEffect(() => {
    let cancelled = false;
    const key = getJourneyKey();
    AsyncStorage.getItem(key)
      .then((raw) => {
        if (cancelled) return;
        const parsed = raw ? JSON.parse(raw) : null;
        setJourneyProgressByGrade(normalizeJourneyMap(parsed));
      })
      .catch((error) => {
        if (cancelled) return;
        console.error('Error loading journey progress:', error);
        setJourneyProgressByGrade(normalizeJourneyMap(null));
      });
    return () => {
      cancelled = true;
    };
  }, [profile]);

  return {
    completedLessons,
    overrideProgress,
    setOverrideProgress,
    completeLesson,
    getCurrentProgress,
    getProgressForGrade,
    setProgressForGrade,
    getNextProgressForGrade,
  };
}
