// services/achievementsService.js
// Business logic for achievements management
import { achievements as defaultAchievements } from '../data/achievements';
import { saveProfile as persistProfile } from './profileService';

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
 * @param profile - current user profile object
 * @param id - achievement id to award
 * @returns updated profile and notification or null if not awarded
 */
export async function awardAchievement(profile, id) {
  if (!profile) {
    throw new Error('Profile is required to award achievement');
  }
  // initialize or use existing achievements
  const current = initAchievements(profile);
  const { achievementsList, notification, totalPoints } = awardAchievementData(current, id);
  if (!notification) {
    return { profile, notification: null };
  }
  // build updated profile with new achievements and score
  const updatedProfile = {
    ...profile,
    achievements: achievementsList,
    score: totalPoints,
  };
  // persist to storage
  await persistProfile(updatedProfile);
  return { profile: updatedProfile, notification };
}