import { updateAchievementOnServer } from './achievementsService';
import { achievements as defaultAchievements } from '../data/achievements';

// Prevent re-entrant or repeated awards for the same user/achievement
const inProgress = new Set();

// Map of game screen to achievement IDs by difficulty level
const GAME_ACHIEVEMENT_MAP = {
  memoryGame: { 1: 'memory1', 2: 'memory2', 3: 'memory3' },
  shapeBuilderGame: { 1: 'shape1', 2: 'shape2', 3: 'shape3' },
  hangmanGame: { 1: 'hangman1', 2: 'hangman2', 3: 'hangman3' },
  bubblePopOrderGame: { 1: 'bubble1', 2: 'bubble2', 3: 'bubble3' },
  // Tap Missing Words game achievement for perfect completion
  tapGame: { 1: 'tapPerfect', 2: 'tapPerfect', 3: 'tapPerfect' },
};

export function getAchievementIdForGame(screen, level) {
  return GAME_ACHIEVEMENT_MAP[screen]?.[level] || null;
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
 */
export async function grantAchievement({
  id,
  profile,
  achievements,
  setAchievements,
  setNotification,
  saveProfile,
}) {
  if (!profile || !id) return;

  // Avoid duplicate awards
  const alreadyEarned = achievements.some(a => a.id === id && a.earned);
  if (alreadyEarned) return;

  const userId = profile._id || profile.id || profile.nuriUserId || 'local';
  const key = `${userId}:${id}`;
  if (inProgress.has(key)) return;
  inProgress.add(key);

  // Optimistically award the achievement locally so the UI can react
  let optimisticAchievements = achievements.map(a =>
    a.id === id ? { ...a, earned: true } : a
  );
  let earned = optimisticAchievements.find(a => a.id === id);
  // If the achievement is not present locally, seed it from defaults
  if (!earned) {
    const def = defaultAchievements.find(a => a.id === id);
    const newEntry = {
      id,
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
  saveProfile(optimisticProfile);

  try {
    const userId = profile._id || profile.id || profile.nuriUserId;
    if (!userId) {
      console.warn('grantAchievement: missing userId, skipping server sync');
      return; // keep optimistic local state
    }
    const { user } = await updateAchievementOnServer(userId, id);

    // Normalise server achievements into client shape
    const updatedAchievements = user.achievements.map(a => ({
      id: a.achievement._id,
      title: a.achievement.title,
      points: a.achievement.points,
      earned: true,
    }));

    // Persist profile and update context with server-confirmed state
    const updatedProfile = {
      ...profile,
      achievements: updatedAchievements,
      totalPoints: user.totalPoints,
    };
    setAchievements(updatedAchievements);
    saveProfile(updatedProfile);
  } catch (e) {
    if (e?.code === 'ALREADY_EARNED') {
      // No-op: already granted on server, keep optimistic local state
      console.warn('grantAchievement: already earned on server, skipping');
    } else if (e?.code === 'USER_NOT_FOUND') {
      // Dev/guest accounts may not exist server-side; keep optimistic local state
      console.warn('grantAchievement: user not found on server, skipping');
    } else {
      console.error('grantAchievement error:', e);
    }
  } finally {
    inProgress.delete(key);
  }
}

/**
 * Convenience wrapper for game wins. Determines which achievement to award
 * based on game screen and difficulty level.
 */
export async function grantGameAchievement(opts) {
  const { screen, level } = opts;
  const id = getAchievementIdForGame(screen, level);
  if (!id) return;
  await grantAchievement({ ...opts, id });
}
