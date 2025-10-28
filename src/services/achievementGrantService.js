import { updateAchievementOnServer, fetchUserAchievements, getTotalPoints } from './achievementsService';
import { achievements as defaultAchievements } from '../utils/data/core/achievements';
import { filterEnabledAchievements, isAchievementEnabled } from '../config/achievementsConfig';

const debugGrant = (...args) => {
  const isDev = typeof __DEV__ === 'boolean' ? __DEV__ : process.env.NODE_ENV !== 'production';
  if (isDev) {
    // eslint-disable-next-line no-console
    console.log('[AchievementGrantService]', ...args);
  }
};

const ENABLED_DEFAULT_ACHIEVEMENTS = filterEnabledAchievements(defaultAchievements);

// Prevent re-entrant or repeated awards for the same user/achievement
const inProgress = new Set();

// Map of game screen to achievement IDs by difficulty level
const GAME_ACHIEVEMENT_MAP = {
  memoryGame: { 1: 'memory1', 2: 'memory2', 3: 'memory3' },
  shapeBuilderGame: { 1: 'shape1', 2: 'shape2', 3: 'shape3' },
  hangmanGame: { 1: 'hangman1', 2: 'hangman2', 3: 'hangman3' },
  bubblePopOrderGame: { 1: 'bubble1', 2: 'bubble2', 3: 'bubble3' },
  wordRacerGame: { 1: 'wordRacer1', 2: 'wordRacer2', 3: 'wordRacer3' },
  // Tap Missing Words game achievement for perfect completion
  tapGame: { 1: 'tapPerfect', 2: 'tapPerfect', 3: 'tapPerfect' },
};

const CHAINED_GAME_SCREENS = new Set(['wordRacerGame']);

const sortNumericKeys = (mapping = {}) =>
  Object.keys(mapping)
    .map((key) => Number(key))
    .filter((value) => Number.isFinite(value))
    .sort((a, b) => a - b);

export function getAchievementIdsForGame(screen, level) {
  const mapping = GAME_ACHIEVEMENT_MAP[screen];
  if (!mapping) return [];

  if (CHAINED_GAME_SCREENS.has(screen)) {
    const sortedLevels = sortNumericKeys(mapping);
    return sortedLevels
      .filter((lvl) => (typeof level === 'number' ? lvl <= level : true))
      .map((lvl) => mapping[lvl])
      .filter(Boolean);
  }

  const id = mapping[level];
  return id ? [id] : [];
}

export function getAchievementIdForGame(screen, level) {
  const ids = getAchievementIdsForGame(screen, level);
  return ids.length > 0 ? ids[ids.length - 1] : null;
}

/**
 * Call server to grant achievement, then update local context/profile.
 * @param {Object} opts
 * @param {string} opts.id - Achievement ID to grant
 * @param {Object} opts.profile - Current user profile
 * @param {Array} opts.achievements - Current achievements array
 * @param {Function} opts.setAchievements - Setter from AchievementsContext
 * @param {Function} opts.setNotification - Setter for notification banner
 * @param {Function} opts.saveProfile - Persists profile to storage
 * @param {Function} opts.setTotalPoints - Setter for total points in context
 */
export async function grantAchievement({
  id,
  profile,
  achievements,
  setAchievements,
  setNotification,
  saveProfile,
  setTotalPoints,
}) {
  if (!profile || !id) return;
  if (!isAchievementEnabled(id)) {
    debugGrant('grantAchievement:disabled-achievement', { id });
    return;
  }
  const isGuest = Boolean(profile?.type === 'guest' || profile?.guest);
  const previousTotalPoints =
    typeof profile?.totalPoints === 'number'
      ? profile.totalPoints
      : getTotalPoints(achievements);
  debugGrant('grantAchievement:start', {
    id,
    isGuest,
    previousTotalPoints,
    profileId: profile?._id || profile?.id || profile?.nuriUserId,
  });

  // Avoid duplicate awards
  const alreadyEarned = achievements.some(a => a.id === id && a.earned);
  if (alreadyEarned) {
    debugGrant('grantAchievement:skip-already-earned-local', {
      id,
      profileId: profile?._id || profile?.id || profile?.nuriUserId,
    });
    return;
  }

  const userId = profile._id || profile.id || profile.nuriUserId || 'local';
  const key = `${userId}:${id}`;
  if (inProgress.has(key)) {
    debugGrant('grantAchievement:skip-in-progress', { id, userId });
    return;
  }
  inProgress.add(key);
  debugGrant('grantAchievement:optimistic-award', {
    id,
    userId,
    beforeEarned: achievements.filter((a) => a.earned).map((a) => a.id),
  });

  // Optimistically award the achievement locally so the UI can react
  let optimisticAchievements = achievements.map(a =>
    a.id === id ? { ...a, earned: true, slug: a.slug || id } : a,
  );
  let earned = optimisticAchievements.find(a => a.id === id);
  // If the achievement is not present locally, seed it from defaults
  if (!earned) {
    const def = ENABLED_DEFAULT_ACHIEVEMENTS.find(a => a.id === id);
    const newEntry = {
      id,
      slug: def?.slug || id,
      serverId: def?.serverId || null,
      title: def?.title || id,
      points: def?.points || 0,
      earned: true,
    };
    optimisticAchievements = [...optimisticAchievements, newEntry];
    earned = newEntry;
  }
  setNotification({ id: earned.id, title: earned.title });
  setAchievements(optimisticAchievements);
  // Persist optimistic profile state including total points if available
  const optimisticProfile = {
    ...profile,
    achievements: optimisticAchievements,
    totalPoints: (profile.totalPoints || 0) + (earned?.points || 0),
  };
  debugGrant('grantAchievement:optimistic-profile', {
    totalPoints: optimisticProfile.totalPoints,
    earnedAchievement: id,
  });
  saveProfile(optimisticProfile);
  if (typeof setTotalPoints === 'function') {
    setTotalPoints(optimisticProfile.totalPoints);
  }

  try {
    if (isGuest) {
      // Guests never sync with server; keep optimistic local state only
      return;
    }
    const serverUserId = profile._id || profile.id || profile.nuriUserId;
    if (!serverUserId) {
      console.warn('grantAchievement: missing userId, skipping server sync');
      return; // keep optimistic local state
    }
    const serverAchievementId = earned?.serverId || null;
    await updateAchievementOnServer(
      serverUserId,
      serverAchievementId || id,
      optimisticProfile.totalPoints,
      {
        slug: earned?.slug || id,
      },
    );

    const {
      achievements: serverAchievements = optimisticAchievements,
      totalPoints: serverTotal = optimisticProfile.totalPoints,
    } = await fetchUserAchievements(serverUserId);
    debugGrant('grantAchievement:server-sync-complete', {
      id,
      serverTotal,
      resolvedCount: serverAchievements.length,
    });

    const resolvedAchievements = serverAchievements.length ? serverAchievements : optimisticAchievements;
    const resolvedTotal = typeof serverTotal === 'number' ? serverTotal : optimisticProfile.totalPoints;

    const updatedProfile = {
      ...profile,
      achievements: resolvedAchievements,
      totalPoints: resolvedTotal,
    };
    setAchievements(resolvedAchievements);
    saveProfile(updatedProfile);
    if (typeof setTotalPoints === 'function') {
      setTotalPoints(resolvedTotal);
    }
  } catch (e) {
    if (e?.code === 'ALREADY_EARNED') {
      console.warn('grantAchievement: already earned on server, syncing state');
      debugGrant('grantAchievement:already-earned', {
        id,
        profileId: profile?._id || profile?.id || profile?.nuriUserId,
      });
      if (!isGuest) {
        const syncUserId = profile._id || profile.id || profile.nuriUserId;
        if (syncUserId) {
          try {
            const {
              achievements: serverAchievements = [],
              totalPoints: serverTotal,
            } = await fetchUserAchievements(syncUserId);
            debugGrant('grantAchievement:already-earned-sync-result', {
              id,
              serverTotal,
              resolvedCount: serverAchievements.length,
            });
            const resolvedAchievements = serverAchievements.length
              ? serverAchievements
              : achievements;
            const resolvedTotal =
              typeof serverTotal === 'number'
                ? serverTotal
                : getTotalPoints(resolvedAchievements);
            setAchievements(resolvedAchievements);
            const reconciledProfile = {
              ...profile,
              achievements: resolvedAchievements,
              totalPoints: resolvedTotal,
            };
            saveProfile(reconciledProfile);
            if (typeof setTotalPoints === 'function') {
              setTotalPoints(resolvedTotal);
            }
          } catch (syncError) {
            console.error('grantAchievement: sync after already-earned failed', syncError);
            const fallbackProfile = {
              ...profile,
              achievements: optimisticAchievements,
              totalPoints: previousTotalPoints,
            };
            setAchievements(optimisticAchievements);
            saveProfile(fallbackProfile);
            if (typeof setTotalPoints === 'function') {
              setTotalPoints(previousTotalPoints);
            }
            debugGrant('grantAchievement:already-earned-sync-failed', {
              id,
              error: syncError?.message,
              previousTotalPoints,
            });
          }
        } else {
          const fallbackProfile = {
            ...profile,
            achievements: optimisticAchievements,
            totalPoints: previousTotalPoints,
          };
          setAchievements(optimisticAchievements);
          saveProfile(fallbackProfile);
          if (typeof setTotalPoints === 'function') {
            setTotalPoints(previousTotalPoints);
          }
          debugGrant('grantAchievement:already-earned-no-sync-user', {
            id,
            previousTotalPoints,
          });
        }
      }
    } else if (e?.code === 'USER_NOT_FOUND') {
      // Dev/guest accounts may not exist server-side; keep optimistic local state
      console.warn('grantAchievement: user not found on server, skipping');
    } else if (e?.code === 'ACHIEVEMENT_NOT_FOUND') {
      console.warn('grantAchievement: achievement not registered on server, keeping local award');
    } else {
      console.error('grantAchievement error:', e);
    }
  } finally {
    debugGrant('grantAchievement:complete', {
      id,
      inProgress: false,
    });
    inProgress.delete(key);
  }
}

/**
 * Convenience wrapper for game wins. Determines which achievement to award
 * based on game screen and difficulty level.
 */
export async function grantGameAchievement(opts) {
  const { screen, level, ids, setAchievements, achievements } = opts;
  const targetIds = Array.isArray(ids) && ids.length > 0 ? ids : getAchievementIdsForGame(screen, level);
  if (!targetIds || targetIds.length === 0) return;

  let latestAchievements = achievements;
  const setAchievementsWrapper =
    typeof setAchievements === 'function'
      ? (next) => {
          latestAchievements = next;
          setAchievements(next);
        }
      : undefined;

  for (const id of targetIds) {
    if (!id || !isAchievementEnabled(id)) continue;
    // eslint-disable-next-line no-await-in-loop
    await grantAchievement({
      ...opts,
      id,
      achievements: latestAchievements,
      setAchievements: setAchievementsWrapper || setAchievements,
    });
  }
}
