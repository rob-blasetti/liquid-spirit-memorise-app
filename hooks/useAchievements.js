import { useState, useEffect, useCallback } from 'react';
import { initAchievements, fetchUserAchievements } from '../services/achievementsService';
import {
  grantAchievement,
  grantGameAchievement,
  getAchievementIdForGame,
} from '../services/achievementGrantService';
import { getTotalPoints } from '../services/achievementsService';

export default function useAchievements(profile, saveProfile) {
  if (__DEV__) {
    // eslint-disable-next-line no-console
    console.debug('useAchievements profile:', profile);
  }

  const isGuest = Boolean(profile?.type === 'guest' || profile?.guest);
  const [achievements, setAchievements] = useState(() => {
    // Guests always use local/default achievements; never fetch
    if (isGuest) return initAchievements(profile);
    const hasServerId = Boolean(profile?._id || profile?.id || profile?.nuriUserId);
    return hasServerId ? initAchievements(profile) : initAchievements(profile);
  });
  const [totalPoints, setTotalPoints] = useState(
    typeof profile?.totalPoints === 'number'
      ? profile.totalPoints
      : getTotalPoints(initAchievements(profile)),
  );
  const [computedPoints, setComputedPoints] = useState(
    getTotalPoints(initAchievements(profile)),
  );
  const [isPointsSynced, setIsPointsSynced] = useState(true);

  // No merging needed now that server returns full catalog with earned flags

  useEffect(
    () => {
      if (isGuest) return; // never fetch for guest profiles
      // don’t run until we have a real ID
      const userId = profile?._id || profile?.id || profile?.nuriUserId;
      if (!userId) return;

      let isMounted = true;
      const load = async () => {
        try {
          // 1) fetch whatever the user already has on the server
          const {
            achievements: serverAchievements = [],
            totalPoints: serverTotal = 0,
          } = await fetchUserAchievements(userId);

          // 2) Use the server-provided catalog directly
          const list = serverAchievements.length
            ? serverAchievements
            : initAchievements(profile);

          if (isMounted) {
            // Avoid redundant state updates if identical
            const sameAsState =
              JSON.stringify(list) === JSON.stringify(achievements);
            if (!sameAsState) setAchievements(list);

            // Use server total if provided; else compute
            const nextComputed = getTotalPoints(list);
            const nextTotal = typeof serverTotal === 'number' ? serverTotal : nextComputed;
            setComputedPoints(nextComputed);
            setTotalPoints(nextTotal);
            setIsPointsSynced(nextTotal === nextComputed);

            // 3) write back only if it’s new (optional, but helps avoid extra renders)
            const haveSame = JSON.stringify(profile.achievements) === JSON.stringify(list) && profile.totalPoints === nextTotal;
            if (!haveSame) {
              saveProfile({
                ...profile,
                achievements: list,
                totalPoints: nextTotal,
              });
            }
          }
        } catch (e) {
          console.error('Failed to fetch achievements:', e);
          if (isMounted) {
            // fall back
            const list = initAchievements(profile);
            setAchievements(list);
            const nextComputed = getTotalPoints(list);
            setComputedPoints(nextComputed);
            setTotalPoints(
              typeof profile?.totalPoints === 'number'
                ? profile.totalPoints
                : nextComputed,
            );
            setIsPointsSynced(
              (typeof profile?.totalPoints === 'number'
                ? profile.totalPoints
                : nextComputed) === nextComputed,
            );
          }
        }
      };

      load();
      return () => {
        isMounted = false;
      };
    },
    // ← effect only re-runs when the user ID changes
    [profile?._id || profile?.id || profile?.nuriUserId, isGuest],
  );

  // Keep computedPoints and sync flag updated whenever achievements change
  useEffect(() => {
    const nextComputed = getTotalPoints(achievements);
    setComputedPoints(nextComputed);
    const hasServerId = Boolean(profile?._id || profile?.id || profile?.nuriUserId);
    if (!isGuest && hasServerId) {
      // When a server user exists, treat the server totalPoints as source of truth.
      // Do NOT override it with computed; just report sync status.
      setIsPointsSynced(totalPoints === nextComputed);
    } else {
      // For local/guest profiles, keep UI total in lockstep with computed.
      if (totalPoints !== nextComputed) {
        setTotalPoints(nextComputed);
        if (profile) saveProfile({ ...profile, totalPoints: nextComputed });
      }
      setIsPointsSynced(true);
    }
  }, [achievements, totalPoints, profile, saveProfile]);

  const [notification, setNotification] = useState(null);

  // Explicit refresh from server, used when entering Achievements screen
  const refreshFromServer = useCallback(async () => {
    if (isGuest) return; // guests never fetch from server
    const userId = profile?._id || profile?.id || profile?.nuriUserId;
    if (!userId) return;
    try {
      const { achievements: serverAchievements = [], totalPoints: serverTotal = 0 } = await fetchUserAchievements(userId);
      const list = serverAchievements.length ? serverAchievements : initAchievements(profile);
      setAchievements(list);
      const nextComputed = getTotalPoints(list);
      setComputedPoints(nextComputed);
      const nextTotal = typeof serverTotal === 'number' ? serverTotal : nextComputed;
      setTotalPoints(nextTotal);
      setIsPointsSynced(nextTotal === nextComputed);
      // Persist reconciled profile
      if (profile) {
        saveProfile({ ...profile, achievements: list, totalPoints: nextTotal });
      }
    } catch (e) {
      console.error('refreshFromServer failed:', e);
    }
  }, [profile, saveProfile, isGuest]);

  // Alias for external consumers: setAchievements() triggers a server refresh
  const setAchievementsFromServer = refreshFromServer;

  // Award an achievement by ID via service
  const awardAchievement = useCallback(
    async id => {
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
    [
      profile,
      achievements,
      setAchievements,
      setNotification,
      saveProfile,
      setTotalPoints,
    ],
  );

  // Award achievement for a game win based on screen and level
  const awardGameAchievement = useCallback(
    async (screen, level) => {
      // Pre-check: if user already has this achievement locally, skip
      const id = getAchievementIdForGame(screen, level);
      if (id) {
        const already = achievements.some(a => a.id === id && a.earned);
        if (already) {
          if (__DEV__)
            console.debug('awardGameAchievement: already earned, skipping', {
              screen,
              level,
              id,
            });
          return;
        }
      }
      await grantGameAchievement({
        screen,
        level,
        profile,
        achievements,
        setAchievements,
        setNotification,
        saveProfile,
        setTotalPoints,
      });
    },
    [
      profile,
      achievements,
      setAchievements,
      setNotification,
      saveProfile,
      setTotalPoints,
    ],
  );

  // Reinitialize achievements state when the active profile changes (e.g., switch guest/registered)
  useEffect(() => {
    // Establish a fresh baseline from the profile (local-only for guests)
    const baseline = initAchievements(profile);
    setAchievements(baseline);
    const nextComputed = getTotalPoints(baseline);
    setComputedPoints(nextComputed);
    // Prefer provided totalPoints if present; else fall back to computed
    const nextTotal = typeof profile?.totalPoints === 'number' ? profile.totalPoints : nextComputed;
    setTotalPoints(nextTotal);
    // Guests are always in-sync locally; for server users, report sync status
    setIsPointsSynced(isGuest ? true : nextTotal === nextComputed);
  }, [
    // switch triggers: any identifier or guest flag change
    profile?._id,
    profile?.id,
    profile?.nuriUserId,
    profile?.guest,
    profile?.type,
  ]);

  return {
    achievements,
    totalPoints,
    computedPoints,
    isPointsSynced,
    isGuest,
    notification,
    setNotification,
    awardAchievement,
    awardGameAchievement,
    // Public API: call to fetch latest from server and update context
    setAchievements: setAchievementsFromServer,
    refreshFromServer,
  };
}
