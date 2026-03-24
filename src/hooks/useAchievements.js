import { useState, useEffect, useCallback, useMemo } from 'react';
import { initAchievements, fetchUserAchievements } from '../services/achievementsService';
import {
  grantAchievement,
  grantGameAchievement,
  getAchievementIdsForGame,
} from '../services/achievementGrantService';
import { getTotalPoints } from '../services/achievementsService';
import {
  incrementCounter,
  recordUniqueItem,
  recordDailyChallenge as recordDailyProgress,
  ensureFlag,
} from '../services/achievementProgressService';
import { grade1Lessons } from '../utils/data/core/grade1';
import { ACHIEVEMENTS_ENABLED, isAchievementEnabled } from '../config/achievementsConfig';

export default function useAchievements(profile, saveProfile) {
  if (__DEV__) {
    const profileSummary = profile
      ? {
          id: profile._id || profile.id || profile.nuriUserId || profile.username || null,
          guest: Boolean(profile.guest || profile.type === 'guest'),
          grade: profile.grade ?? null,
        }
      : null;
    console.debug('useAchievements profile summary:', profileSummary);
  }

  const achievementsEnabled = ACHIEVEMENTS_ENABLED;
  const isGuest = Boolean(profile?.type === 'guest' || profile?.guest);
  const initialAchievements = useMemo(() => initAchievements(profile), [profile]);

  const [achievements, setAchievements] = useState(initialAchievements);
  const [totalPoints, setTotalPoints] = useState(
    typeof profile?.totalPoints === 'number' ? profile.totalPoints : getTotalPoints(initialAchievements),
  );
  const [computedPoints, setComputedPoints] = useState(getTotalPoints(initialAchievements));
  const [isPointsSynced, setIsPointsSynced] = useState(true);
  const [notification, setNotification] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const profileProgressKey = useMemo(() => {
    if (!profile) return null;
    const identifiers = [
      profile._id,
      profile.id,
      profile.nuriUserId,
      profile.userId,
      profile.username,
    ].filter(Boolean);
    if (identifiers.length > 0) return identifiers[0];
    if (profile.guest) {
      return `guest:${profile.avatarSeed || profile.displayName || 'default'}`;
    }
    return 'local';
  }, [profile]);

  const grade1LessonCount = grade1Lessons?.length || 0;

  useEffect(() => {
    if (!achievementsEnabled) {
      setAchievements([]);
      setTotalPoints(0);
      setComputedPoints(0);
      setIsPointsSynced(true);
      setNotification(null);
      setIsLoading(false);
      return;
    }

    const nextComputed = getTotalPoints(achievements);
    setComputedPoints(nextComputed);
    const hasServerId = Boolean(profile?._id || profile?.id || profile?.nuriUserId);
    if (!isGuest && hasServerId) {
      setIsPointsSynced(totalPoints === nextComputed);
    } else {
      if (totalPoints !== nextComputed) {
        setTotalPoints(nextComputed);
        if (profile && profile.totalPoints !== nextComputed) {
          saveProfile({ ...profile, totalPoints: nextComputed });
        }
      }
      setIsPointsSynced(true);
    }
  }, [achievementsEnabled, achievements, totalPoints, profile, saveProfile, isGuest]);

  const refreshFromServer = useCallback(async () => {
    if (!achievementsEnabled || isGuest) return;
    const userId = profile?._id || profile?.id || profile?.nuriUserId;
    if (!userId) return;
    setIsLoading(true);
    try {
      const { achievements: serverAchievements = [], totalPoints: serverTotal = 0 } = await fetchUserAchievements(userId);
      const list = serverAchievements.length ? serverAchievements : initAchievements(profile);
      setAchievements(list);
      const nextComputed = getTotalPoints(list);
      setComputedPoints(nextComputed);
      const nextTotal = typeof serverTotal === 'number' ? serverTotal : nextComputed;
      setTotalPoints(nextTotal);
      setIsPointsSynced(nextTotal === nextComputed);
      if (
        profile &&
        (profile.totalPoints !== nextTotal || profile.achievements !== list)
      ) {
        saveProfile({ ...profile, achievements: list, totalPoints: nextTotal });
      }
    } catch (e) {
      console.error('refreshFromServer failed:', e);
    } finally {
      setIsLoading(false);
    }
  }, [achievementsEnabled, profile, saveProfile, isGuest]);

  const setAchievementsFromServer = refreshFromServer;

  const awardAchievement = useCallback(
    async id => {
      if (!achievementsEnabled || !isAchievementEnabled(id)) {
        return;
      }
      await grantAchievement({
        id,
        profile,
        achievements,
        setAchievements,
        setNotification,
        saveProfile,
        setTotalPoints,
      });
    },
    [achievementsEnabled, profile, achievements, saveProfile],
  );

  const awardGameAchievement = useCallback(
    async (screen, level) => {
      if (!achievementsEnabled) return;
      const candidateIds = getAchievementIdsForGame(screen, level).filter(Boolean);
      if (!candidateIds.length) return;

      const enabledIds = candidateIds.filter(id => isAchievementEnabled(id));
      if (!enabledIds.length) return;

      const pendingIds = enabledIds.filter(
        id => !achievements.some(achievement => achievement.id === id && achievement.earned),
      );

      if (!pendingIds.length) {
        if (__DEV__) {
          console.debug('awardGameAchievement: already earned, skipping chain', {
            screen,
            level,
            ids: enabledIds,
          });
        }
        return;
      }

      await grantGameAchievement({
        screen,
        level,
        ids: pendingIds,
        profile,
        achievements,
        setAchievements,
        setNotification,
        saveProfile,
        setTotalPoints,
      });
    },
    [achievementsEnabled, achievements, profile, saveProfile],
  );

  useEffect(() => {
    if (!achievementsEnabled) return;
    const baseline = initAchievements(profile);
    setAchievements(baseline);
    const nextComputed = getTotalPoints(baseline);
    setComputedPoints(nextComputed);
    const nextTotal = typeof profile?.totalPoints === 'number' ? profile.totalPoints : nextComputed;
    setTotalPoints(nextTotal);
    setIsPointsSynced(isGuest ? true : nextTotal === nextComputed);
  }, [
    achievementsEnabled,
    profile,
    isGuest,
    profile?._id,
    profile?.id,
    profile?.nuriUserId,
    profile?.guest,
    profile?.type,
  ]);

  const recordGamePlay = useCallback(
    async ({ screen, result, perfect } = {}) => {
      if (!achievementsEnabled || !profileProgressKey) return;
      try {
        const played = await incrementCounter(profileProgressKey, 'gamesPlayed', 1);
        if (played === 1) await awardAchievement('game1');
        if (played === 10) await awardAchievement('game10');
        if (screen === 'practice' && result === 'win') {
          const practiceCount = await incrementCounter(profileProgressKey, 'practiceSessions', 1);
          if (practiceCount === 20) await awardAchievement('practice20');
        }
        if (screen === 'tapGame' && perfect) {
          const perfectWins = await incrementCounter(profileProgressKey, 'tapPerfectWins', 1);
          if (perfectWins === 1) await awardAchievement('tapPerfect');
        }
      } catch (error) {
        console.error('recordGamePlay failed', error);
      }
    },
    [achievementsEnabled, profileProgressKey, awardAchievement],
  );

  const recordLessonCompletion = useCallback(
    async ({ grade, setNumber, lessonNumber, lessonContent = {} }) => {
      if (!achievementsEnabled || !profileProgressKey) return;
      const lessonKey = [
        grade != null ? String(grade) : 'g',
        setNumber != null ? String(setNumber) : 's',
        lessonNumber != null ? String(lessonNumber) : 'l',
      ].join(':');
      try {
        if (lessonContent?.prayer) {
          const { count, added } = await recordUniqueItem(profileProgressKey, 'prayers', lessonKey);
          if (added) {
            if (count >= 1) await awardAchievement('prayer1');
            if (count >= 5) await awardAchievement('prayer5');
            if (count >= 10) await awardAchievement('prayer10');
          }
        }
        const hasQuote = Boolean(lessonContent?.text || lessonContent?.quote);
        if (hasQuote) {
          const { count, added } = await recordUniqueItem(profileProgressKey, 'quotes', lessonKey);
          if (added) {
            if (count >= 1) await awardAchievement('quote1');
            if (count >= 5) await awardAchievement('quote5');
            if (count >= 15) await awardAchievement('quote15');
          }
        }
        if (grade === 1) {
          const { count } = await recordUniqueItem(profileProgressKey, 'grade1Lessons', lessonKey);
          if (grade1LessonCount > 0 && count >= grade1LessonCount) {
            await awardAchievement('grade1');
          }
        }
      } catch (error) {
        console.error('recordLessonCompletion failed', error);
      }
    },
    [achievementsEnabled, profileProgressKey, awardAchievement, grade1LessonCount],
  );

  const recordDailyChallenge = useCallback(async () => {
    if (!achievementsEnabled || !profileProgressKey) return;
    try {
      const { streak, repeated } = await recordDailyProgress(profileProgressKey);
      if (!repeated) {
        if (streak >= 3) await awardAchievement('streak3');
        if (streak >= 7) await awardAchievement('streak7');
        if (streak >= 30) await awardAchievement('streak30');
      }
    } catch (error) {
      console.error('recordDailyChallenge failed', error);
    }
  }, [achievementsEnabled, profileProgressKey, awardAchievement]);

  const recordProfileSetup = useCallback(
    async profileSnapshot => {
      if (!achievementsEnabled || !profileProgressKey || !profileSnapshot) return;
      const hasAvatar =
        Boolean(profileSnapshot.profilePicture) ||
        Boolean(profileSnapshot.avatarUri) ||
        Boolean(profileSnapshot.avatar);
      if (!hasAvatar) return;
      try {
        const newlySet = await ensureFlag(profileProgressKey, 'profileAchievement');
        if (newlySet) {
          await awardAchievement('profile');
        }
      } catch (error) {
        console.error('recordProfileSetup failed', error);
      }
    },
    [achievementsEnabled, profileProgressKey, awardAchievement],
  );

  useEffect(() => {
    if (achievementsEnabled && profile) {
      recordProfileSetup(profile);
    }
  }, [achievementsEnabled, profile, recordProfileSetup]);

  if (!achievementsEnabled) {
    const noop = async () => undefined;
    return {
      achievements: [],
      totalPoints: 0,
      computedPoints: 0,
      isPointsSynced: true,
      isGuest,
      isLoading: false,
      notification: null,
      setNotification: () => {},
      awardAchievement: noop,
      awardGameAchievement: noop,
      setAchievements: noop,
      refreshFromServer: noop,
      recordGamePlay: noop,
      recordLessonCompletion: noop,
      recordDailyChallenge: noop,
      recordProfileSetup: noop,
    };
  }

  return {
    achievements,
    totalPoints,
    computedPoints,
    isPointsSynced,
    isGuest,
    isLoading,
    notification,
    setNotification,
    awardAchievement,
    awardGameAchievement,
    setAchievements: setAchievementsFromServer,
    refreshFromServer,
    recordGamePlay,
    recordLessonCompletion,
    recordDailyChallenge,
    recordProfileSetup,
  };
}
