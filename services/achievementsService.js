// services/achievementsService.js
import { achievements as defaultAchievements } from '../data/achievements';
import { saveProfile as persistProfile } from './profileService';
import { API_URL } from '../config';
import AsyncStorage from '@react-native-async-storage/async-storage';

const toMap = (list = []) => {
  const map = new Map();
  list.forEach((item) => {
    if (item?.id) map.set(item.id, item);
  });
  return map;
};

/**
 * Initialize achievements list for a profile.
 * Uses profile.achievements if available, else defaults.
 */
export function initAchievements(profile) {
  if (profile && Array.isArray(profile.achievements)) {
    return profile.achievements.map(a => ({ ...a }));
  }
  return defaultAchievements.map(a => ({ ...a }));
}

/**
 * Calculate total points from an achievements array.
 */
export function getTotalPoints(achievementsList) {
  return achievementsList.reduce(
    (sum, a) => sum + (a.earned && a.points ? a.points : 0),
    0
  );
}

export async function fetchUserAchievements(userId) {
  if (!userId) {
    return { achievements: [], totalPoints: 0 };
  }

  try {
    const token = await AsyncStorage.getItem('token');
    const headers = token
      ? { Authorization: `Bearer ${token}` }
      : undefined;
    const res = await fetch(`${API_URL}/api/nuri/achievements/${userId}`,
      headers ? { headers } : undefined,
    );
    if (!res.ok) {
      throw new Error('Failed to fetch achievements');
    }
    const raw = await res.json();
    const { achievements: serverAchievements = [], totalPoints = 0 } = raw || {};
    // Normalize server achievements; preserve earned and description
    const normalizedEarned = (serverAchievements || [])
      .map((a) => {
        // Shape A: { achievement: { _id, title, points, description }, earned, dateEarned }
        if (a && a.achievement) {
          const earnedFlag =
            typeof a.earned === 'boolean' ? a.earned : true;
          return {
            id: a.achievement._id || a.achievement.id,
            title: a.achievement.title,
            description: a.achievement.description,
            points: a.achievement.points || 0,
            earned: earnedFlag,
            dateEarned: a.dateEarned || null,
          };
        }
        // Shape B: flat: { id, title, description, points, earned, dateEarned }
        if (a && (a._id || a.id)) {
          const earnedFlag =
            typeof a.earned === 'boolean' ? a.earned : true;
          return {
            id: a._id || a.id,
            title: a.title,
            description: a.description,
            points: a.points || 0,
            earned: earnedFlag,
            dateEarned: a.dateEarned || null,
          };
        }
        // Shape C: legacy string id list (earned-only)
        if (typeof a === 'string') {
          const def = defaultAchievements.find((d) => d.id === a);
          return {
            id: a,
            title: def?.title || a,
            description: def?.description,
            points: def?.points || 0,
            earned: true,
            dateEarned: null,
          };
        }
        return null;
      })
      .filter(Boolean);

    const normalizedMap = toMap(normalizedEarned);
    const merged = defaultAchievements.map((def) => {
      const earned = normalizedMap.get(def.id);
      if (earned) {
        normalizedMap.delete(def.id);
        return {
          ...def,
          ...earned,
          id: def.id,
          points: earned.points != null ? earned.points : def.points || 0,
          earned: Boolean(earned.earned),
          dateEarned: earned.dateEarned || null,
        };
      }
      return {
        ...def,
        earned: false,
        dateEarned: null,
      };
    });

    const extras = Array.from(normalizedMap.values()).map((item) => ({
      id: item.id,
      title: item.title || item.id,
      description: item.description || '',
      points: item.points || 0,
      earned: Boolean(item.earned),
      dateEarned: item.dateEarned || null,
    }));

    const achievements = [...merged, ...extras];
    const computedTotal = getTotalPoints(achievements);

    if (__DEV__) {
      // eslint-disable-next-line no-console
      console.debug('Fetched achievements:', achievements, 'Total points:', totalPoints);
    }
    const resolvedTotal = typeof totalPoints === 'number' ? totalPoints : computedTotal;
    return { achievements, totalPoints: resolvedTotal };
  } catch (err) {
    console.error('fetchUserAchievements error:', err);
    return { achievements: [], totalPoints: 0 };
  }
}

/**
 * Notify backend that an achievement was awarded.
 * Updates the user's total points on the server.
 * @param {string} userId - NuriUser _id
 * @param {string} achievementId - ID of the awarded achievement
 * @returns {Promise<object>} - The server response JSON containing the updated user
 */
/**
 * Notify backend that an achievement was awarded for a user.
 * Updates the user's total points on the server.
 * @param {string|number} userId - Identifier of the nuriUser or child
 * @param {string|number} achievementId - ID of the awarded achievement
 * @param {number} totalPoints - New total points after awarding achievement
 * @returns {Promise<object>} - Server response JSON
 */
export async function updateAchievementOnServer(userId, achievementId, totalPoints) {
  try {
    const token = await AsyncStorage.getItem('token');
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers.Authorization = `Bearer ${token}`;

    const payload = { userId, achievementId };
    if (typeof totalPoints === 'number') payload.totalPoints = totalPoints;
    const response = await fetch(`${API_URL}/api/nuri/achievement`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      let info;
      try { info = JSON.parse(text); } catch { info = { message: text }; }
      const message = (info && info.message ? String(info.message) : '').toLowerCase();
      const err = new Error('Failed to update achievement on server');
      if (message.includes('already earned')) err.code = 'ALREADY_EARNED';
      else if (message.includes('user not found')) err.code = 'USER_NOT_FOUND';
      err.status = response.status;
      // Log non-noisy errors only
      if (err.code === 'ALREADY_EARNED') {
        console.warn('Achievement already earned; skipping server update');
      } else if (err.code === 'USER_NOT_FOUND') {
        console.warn('Achievement update skipped: user not found');
      } else {
        console.error('Achievement update failed:', response.status, text);
      }
      throw err;
    }
    return await response.json();
  } catch (err) {
    if (err?.code === 'ALREADY_EARNED' || err?.code === 'USER_NOT_FOUND') {
      // Swallow noisy logs; propagate for caller to decide
    } else {
      console.error('updateAchievementOnServer error:', err);
    }
    throw err;
  }
}

/**
 * Award an achievement by id, returning updated list, notification, and new total points.
 * Does not persist; leave persistence to caller.
 */
export function awardAchievementData(achievementsList, id) {
  const idx = achievementsList.findIndex(a => a.id === id);
  if (idx === -1) {
    return { achievementsList, notification: null, totalPoints: getTotalPoints(achievementsList) };
  }
  const target = achievementsList[idx];
  if (target.earned) {
    return { achievementsList, notification: null, totalPoints: getTotalPoints(achievementsList) };
  }
  const updated = achievementsList.map(a =>
    a.id === id ? { ...a, earned: true } : a
  );
  const totalPoints = getTotalPoints(updated);
  const notification = { id: target.id, title: target.title };
  return { achievementsList: updated, notification, totalPoints };
}

/**
 * Award an achievement for a profile, persist updated profile, and return notification.
 * Uses optimistic UI and reconciles with server.
 * @param {object} profile - current user profile object
 * @param {string} id - achievement id to award
 * @returns {Promise<{profile: object, notification: object|null}>}
 */
export async function awardAchievement(profile, id) {
  if (!profile) {
    throw new Error('Profile is required to award achievement');
  }

  // 1. Local optimistic update
  const current = initAchievements(profile);
  const { achievementsList, notification, totalPoints } = awardAchievementData(current, id);
  if (!notification) {
    return { profile, notification: null };
  }
  const optimisticProfile = {
    ...profile,
    achievements: achievementsList,
    totalPoints,
  };
  // Persist optimistic state
  await persistProfile(optimisticProfile);

  // 2. Sync with server
  try {
    const userId = profile._id || profile.id || profile.nuriUserId;
    if (userId) {
      await updateAchievementOnServer(userId, id, totalPoints);
    }
    const { achievements: syncedAchievements = [], totalPoints: serverTotal = totalPoints } = await fetchUserAchievements(userId);
    const resolvedAchievements = syncedAchievements.length ? syncedAchievements : achievementsList;
    const resolvedTotal = typeof serverTotal === 'number' ? serverTotal : getTotalPoints(resolvedAchievements);
    const syncedProfile = {
      ...profile,
      achievements: resolvedAchievements,
      totalPoints: resolvedTotal,
    };

    await persistProfile(syncedProfile);
    return { profile: syncedProfile, notification };
  } catch (err) {
    console.error('awardAchievement ▶ server sync failed', err);
    // Keep optimistic state if server fails
    return { profile: optimisticProfile, notification };
  }
}
