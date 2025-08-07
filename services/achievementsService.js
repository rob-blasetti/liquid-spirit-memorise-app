// services/achievementsService.js
import { achievements as defaultAchievements } from '../data/achievements';
import { saveProfile as persistProfile } from './profileService';
import { API_URL } from '../config';

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

/**
 * Fetch a user's achievements from the backend.
 * @param {string|number} userId
 * @returns {Promise<{achievements: Array, totalPoints: number}>}
 */
export async function fetchUserAchievements(userId) {
  if (!userId) {
    return { achievements: [], totalPoints: 0 };
  }
  try {
    const response = await fetch(`${API_URL}/api/nuri/achievements/${userId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch achievements');
    }
    const data = await response.json();

    // Handle various possible response shapes
    if (Array.isArray(data)) {
      return { achievements: data, totalPoints: getTotalPoints(data) };
    }

    if (Array.isArray(data.achievements)) {
      return {
        achievements: data.achievements,
        totalPoints: data.totalPoints || getTotalPoints(data.achievements),
      };
    }

    if (data.user) {
      const arr = data.user.achievements || [];
      const mapped = arr.map((a) => {
        if (a.achievement) {
          return {
            id: a.achievement._id || a.achievement.id,
            title: a.achievement.title,
            points: a.achievement.points,
            earned: true,
          };
        }
        return a;
      });
      return {
        achievements: mapped,
        totalPoints: data.user.totalPoints || getTotalPoints(mapped),
      };
    }

    return { achievements: [], totalPoints: 0 };
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
export async function updateAchievementOnServer(userId, achievementId) {
  try {
    // Call existing backend achievement endpoint
    const response = await fetch(
      `${API_URL}/api/nuri/achievement`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, achievementId }),
      }
    );
    if (!response.ok) {
      throw new Error('Failed to update achievement on server');
    }
    return await response.json();
  } catch (err) {
    console.error('updateAchievementOnServer error:', err);
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
    score: totalPoints,
  };
  // Persist optimistic state
  await persistProfile(optimisticProfile);

  // 2. Sync with server
  try {
    const { user } = await updateAchievementOnServer(profile.id, id);

    // 3. Reconcile server state to local shape
    const syncedAchievements = user.achievements.map(a => ({
      id: a.achievement._id,
      title: a.achievement.title,
      points: a.achievement.points,
      earned: true,
    }));
    const syncedProfile = {
      ...profile,
      achievements: syncedAchievements,
      score: user.totalPoints,
    };

    await persistProfile(syncedProfile);
    return { profile: syncedProfile, notification };
  } catch (err) {
    console.error('awardAchievement ▶ server sync failed', err);
    // Keep optimistic state if server fails
    return { profile: optimisticProfile, notification };
  }
}
