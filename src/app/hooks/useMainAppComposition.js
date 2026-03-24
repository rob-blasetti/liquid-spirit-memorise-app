import { useMemo } from 'react';
import { canSwitchProfiles } from '../../services/profileSelectionService';
import { createNavigationActions } from '../../services/navigationService';
import { createAppActions } from '../../services/appFlowService';
import { createAvatarActions } from '../../services/avatarService';

export default function useMainAppComposition({
  profile,
  registeredProfile,
  guestProfile,
  children,
  setProfile,
  saveProfile,
  goTo,
  nav,
  markGradeVisited,
  visitedGrades,
  awardAchievement,
  getCurrentProgress,
  recordDailyChallenge,
  completeLesson,
  overrideProgress,
  setOverrideProgress,
  getProgressForGrade,
  completedLessons,
}) {
  const profileSwitchEligible = useMemo(
    () =>
      canSwitchProfiles({
        profile,
        registeredProfile,
        guestProfile,
        children,
        authType: 'ls-login',
      }),
    [profile, registeredProfile, guestProfile, children],
  );

  const avatarActions = useMemo(() => {
    if (!profile) return null;
    return createAvatarActions({ profile, setProfile, saveProfile });
  }, [profile, setProfile, saveProfile]);

  const navigationActions = useMemo(
    () =>
      createNavigationActions({
        goTo,
        nav,
        markGradeVisited,
        visitedGrades,
        awardAchievement,
      }),
    [goTo, nav, markGradeVisited, visitedGrades, awardAchievement],
  );

  const appActions = useMemo(
    () =>
      createAppActions({
        profile,
        goTo,
        nav,
        getCurrentProgress,
        awardAchievement,
        recordDailyChallenge,
      }),
    [profile, goTo, nav, getCurrentProgress, awardAchievement, recordDailyChallenge],
  );

  const lessonState = useMemo(
    () => ({
      completeLesson,
      overrideProgress,
      setOverrideProgress,
      getCurrentProgress,
      getProgressForGrade,
      completedLessons,
    }),
    [
      completeLesson,
      overrideProgress,
      setOverrideProgress,
      getCurrentProgress,
      getProgressForGrade,
      completedLessons,
    ],
  );

  return {
    profileSwitchEligible,
    avatarActions,
    navigationActions,
    appActions,
    lessonState,
  };
}
