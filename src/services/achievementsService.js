// services/achievementsService.js
import { achievements as defaultAchievements } from '../utils/data/core/achievements';
import { saveProfile as persistProfile } from './profileService';
import { API_URL } from '../config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { filterEnabledAchievements, isAchievementEnabled } from '../config/achievementsConfig';

const ENABLED_DEFAULT_ACHIEVEMENTS = filterEnabledAchievements(defaultAchievements);
const DEFAULT_BY_ID = new Map(ENABLED_DEFAULT_ACHIEVEMENTS.map((a) => [a.id, a]));
const DEFAULT_IDS = new Set(DEFAULT_BY_ID.keys());
const DEFAULT_BY_TITLE = new Map(ENABLED_DEFAULT_ACHIEVEMENTS.map((a) => [a.title, a.id]));
const SERVER_ID_HINTS = new Map();

const registerServerIdHints = (list = []) => {
  list.forEach((item) => {
    if (item?.serverId) {
      SERVER_ID_HINTS.set(String(item.serverId), item.id);
    }
  });
};

const toMap = (list = []) => {
  const map = new Map();
  list.forEach((item) => {
    if (item?.id) map.set(item.id, item);
  });
  return map;
};

const coerceIdToDefault = (entry = {}) => {
  const candidateIds = [
    entry.slug,
    entry.id,
    entry._id,
    entry.achievement?.slug,
    entry.achievement?.id,
    entry.achievement?._id,
  ]
    .filter(Boolean)
    .map((value) => String(value));

  const serverIds = [
    entry.serverId,
    typeof entry.achievement === 'string' ? entry.achievement : null,
    entry.achievement?._id,
    entry._id && typeof entry._id === 'string' && entry._id.length === 24 ? entry._id : null,
  ].filter(Boolean).map((value) => String(value));

  serverIds.forEach((serverId) => {
    const hint = SERVER_ID_HINTS.get(serverId);
    if (hint) candidateIds.push(hint);
  });

  let resolved = candidateIds.find((value) => DEFAULT_IDS.has(value));
  if (!resolved && entry.title) {
    const byTitle = DEFAULT_BY_TITLE.get(entry.title);
    if (byTitle) resolved = byTitle;
  }
  if (!resolved && entry.achievement?.title) {
    const byTitle = DEFAULT_BY_TITLE.get(entry.achievement.title);
    if (byTitle) resolved = byTitle;
  }
  if (!resolved && entry.achievement?.title) {
    const byTitle = DEFAULT_BY_TITLE.get(entry.achievement.title);
    if (byTitle) resolved = byTitle;
  }
  if (!resolved && serverIds.length) {
    const hint = serverIds.map((sid) => SERVER_ID_HINTS.get(sid)).find(Boolean);
    if (hint) resolved = hint;
  }

  const chosen = resolved || candidateIds[0] || null;
  if (chosen) {
    serverIds.forEach((sid) => {
      SERVER_ID_HINTS.set(sid, chosen);
    });
  }
  return chosen;
};

const normalizeStoredAchievement = (entry) => {
  if (!entry) return null;
  const id = coerceIdToDefault(entry);
  if (!id) return null;
  const template = DEFAULT_BY_ID.get(id) || {};
  const achievementSource = entry.achievement || {};
  const normalized = {
    ...template,
    ...achievementSource,
    ...entry,
    id,
    slug: entry.slug || achievementSource.slug || id,
    serverId: entry.serverId || achievementSource._id || template.serverId || null,
    title: entry.title || achievementSource.title || template.title || id,
    description:
      entry.description || achievementSource.description || template.description || '',
    points:
      entry.points != null
        ? entry.points
        : achievementSource.points != null
        ? achievementSource.points
        : template.points || 0,
    earned: Boolean(entry.earned ?? entry.dateEarned != null),
    dateEarned: entry.dateEarned || null,
  };
  delete normalized.achievement;
  delete normalized._id;
  if (normalized.serverId) {
    SERVER_ID_HINTS.set(String(normalized.serverId), normalized.id);
  }
  return normalized;
};

/**
 * Initialize achievements list for a profile.
 * Uses profile.achievements if available, else defaults.
 */
export function initAchievements(profile) {
  const fromProfile = Array.isArray(profile?.achievements)
    ? profile.achievements
        .map(normalizeStoredAchievement)
        .filter(Boolean)
    : [];  
  const storedMap = toMap(fromProfile);
  const merged = ENABLED_DEFAULT_ACHIEVEMENTS.map((def) => {
    const stored = storedMap.get(def.id);
    if (stored) {
      storedMap.delete(def.id);
      return {
        ...def,
        ...stored,
        id: def.id,
        slug: stored.slug || def.slug || def.id,
        serverId: stored.serverId || null,
        points: stored.points != null ? stored.points : def.points || 0,
        earned: Boolean(stored.earned),
        dateEarned: stored.dateEarned || null,
      };
    }
    return {
      ...def,
      slug: def.slug || def.id,
      serverId: def.serverId || null,
      earned: false,
      dateEarned: null,
    };
  });

  const extras = Array.from(storedMap.values())
    .filter((item) => isAchievementEnabled(item?.id))
    .map((item) => ({
      ...item,
      slug: item.slug || item.id,
      serverId: item.serverId || null,
      earned: Boolean(item.earned),
      dateEarned: item.dateEarned || null,
    }));

  if (extras.length) {
    debugAchievements(
      'initAchievements: extra stored achievements',
      extras.map((a) => `${a.id}:${a.earned ? 'earned' : 'open'}`),
    );
  }

  const combined = filterEnabledAchievements([...merged, ...extras]);
  registerServerIdHints(combined);
  return combined;
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
          const achievementId =
            coerceIdToDefault({
              slug: a.achievement.slug,
              id: a.achievement.id,
              _id: a.achievement._id,
              title: a.achievement.title,
            }) ||
            a.achievement.slug ||
            a.achievement.id ||
            a.achievement._id;
          if (!achievementId) return null;
          const earnedFlag =
            typeof a.earned === 'boolean' ? a.earned : true;
          if (a.achievement._id) {
            SERVER_ID_HINTS.set(String(a.achievement._id), achievementId);
          }
          return {
            id: achievementId,
            slug: achievementId,
            serverId: a.achievement._id || null,
            title: a.achievement.title,
            description: a.achievement.description,
            points: a.achievement.points || 0,
            earned: earnedFlag,
            dateEarned: a.dateEarned || null,
          };
        }
        if (a && typeof a.achievement === 'string') {
          const serverId = String(a.achievement);
          let achievementId = SERVER_ID_HINTS.get(serverId) || null;
          if (!achievementId && a.slug) achievementId = DEFAULT_IDS.has(a.slug) ? a.slug : null;
          if (!achievementId && a.title) {
            const byTitle = DEFAULT_BY_TITLE.get(a.title);
            if (byTitle) achievementId = byTitle;
          }
          if (!achievementId) {
            achievementId = coerceIdToDefault({ serverId, achievement: serverId, title: a.title }) || serverId;
          }
          const earnedFlag = typeof a.earned === 'boolean' ? a.earned : true;
          SERVER_ID_HINTS.set(serverId, achievementId);
          return {
            id: achievementId,
            slug: achievementId,
            serverId,
            title: a.title || achievementId,
            description: a.description || '',
            points: a.points || 0,
            earned: earnedFlag,
            dateEarned: a.dateEarned || null,
          };
        }
        // Shape B: flat: { id, slug, title, description, points, earned, dateEarned }
        if (a && (a._id || a.id || a.slug)) {
          const achievementId =
            coerceIdToDefault({ slug: a.slug, id: a.id, _id: a._id, title: a.title }) ||
            a.slug ||
            a.id ||
            a._id;
          if (!achievementId) return null;
          const earnedFlag =
            typeof a.earned === 'boolean' ? a.earned : true;
          if (a._id) {
            SERVER_ID_HINTS.set(String(a._id), achievementId);
          }
          return {
            id: achievementId,
            slug: achievementId,
            serverId: a._id || null,
            title: a.title,
            description: a.description,
            points: a.points || 0,
            earned: earnedFlag,
            dateEarned: a.dateEarned || null,
          };
        }
        // Shape C: legacy string id list (earned-only)
        if (typeof a === 'string') {
          const def = ENABLED_DEFAULT_ACHIEVEMENTS.find((d) => d.id === a);
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

    const filteredEarned = filterEnabledAchievements(normalizedEarned);
    const normalizedMap = toMap(filteredEarned);
    const merged = ENABLED_DEFAULT_ACHIEVEMENTS.map((def) => {
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

    const extras = Array.from(normalizedMap.values())
      .filter((item) => isAchievementEnabled(item?.id))
      .map((item) => ({
        id: item.slug || item.id,
        slug: item.slug || item.id,
        serverId: item.serverId || null,
        title: item.title || item.id,
        description: item.description || '',
        points: item.points || 0,
        earned: Boolean(item.earned),
        dateEarned: item.dateEarned || null,
      }));

    const achievements = filterEnabledAchievements([...merged, ...extras]);
    const computedTotal = getTotalPoints(achievements);
    registerServerIdHints(achievements);

    if (__DEV__) {
      const summary = {
        total: achievements.length,
        earned: achievements.filter((item) => item?.earned).length,
        sample: achievements.slice(0, 3).map((item) => item?.id),
        totalPoints,
      };
      // eslint-disable-next-line no-console
      console.debug('Fetched achievements summary:', summary);
    }
    const resolvedTotal =
      Number.isFinite(totalPoints) && totalPoints >= 0
        ? totalPoints
        : computedTotal;
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
export async function updateAchievementOnServer(userId, achievementId, totalPoints, options = {}) {
  try {
    const token = await AsyncStorage.getItem('token');
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers.Authorization = `Bearer ${token}`;

    const slugValue = options.slug || achievementId || null;
    const payload = { userId };
    if (slugValue) payload.slug = slugValue;
    if (slugValue && slugValue !== achievementId) {
      payload.achievementId = slugValue;
      payload.legacyId = achievementId || null;
    } else if (achievementId) {
      payload.achievementId = achievementId;
    }
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
      else if (message.includes('achievement not found') || response.status === 404) {
        err.code = 'ACHIEVEMENT_NOT_FOUND';
      }
      err.status = response.status;
      // Log non-noisy errors only
      if (err.code === 'ALREADY_EARNED') {
        console.warn('Achievement already earned; skipping server update');
      } else if (err.code === 'USER_NOT_FOUND') {
        console.warn('Achievement update skipped: user not found');
      } else if (err.code === 'ACHIEVEMENT_NOT_FOUND') {
        console.warn('Achievement update skipped: achievement not registered on server');
      } else {
        console.error('Achievement update failed:', response.status, text);
      }
      throw err;
    }
    return await response.json();
  } catch (err) {
    if (
      err?.code === 'ALREADY_EARNED' ||
      err?.code === 'USER_NOT_FOUND' ||
      err?.code === 'ACHIEVEMENT_NOT_FOUND'
    ) {
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
  const filteredList = filterEnabledAchievements(achievementsList);
  if (!isAchievementEnabled(id)) {
    return {
      achievementsList: filteredList,
      notification: null,
      totalPoints: getTotalPoints(filteredList),
    };
  }
  const idx = achievementsList.findIndex(a => a.id === id);
  if (idx === -1) {
    return {
      achievementsList: filteredList,
      notification: null,
      totalPoints: getTotalPoints(filteredList),
    };
  }
  const target = achievementsList[idx];
  if (target.earned) {
    return {
      achievementsList: filteredList,
      notification: null,
      totalPoints: getTotalPoints(filteredList),
    };
  }
  const updated = achievementsList.map(a =>
    a.id === id ? { ...a, earned: true } : a
  );
  const enabledUpdated = filterEnabledAchievements(updated);
  const totalPoints = getTotalPoints(enabledUpdated);
  const notification = { id: target.id, title: target.title };
  return { achievementsList: enabledUpdated, notification, totalPoints };
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
  if (!isAchievementEnabled(id)) {
    return { profile, notification: null };
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
      const targetEntry = achievementsList.find((a) => a.id === id) || null;
      const serverAchievementId = targetEntry?.serverId || null;
      await updateAchievementOnServer(userId, serverAchievementId || id, totalPoints, {
        slug: targetEntry?.slug || id,
      });
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
    if (
      err?.code !== 'ALREADY_EARNED' &&
      err?.code !== 'USER_NOT_FOUND' &&
      err?.code !== 'ACHIEVEMENT_NOT_FOUND'
    ) {
      console.error('awardAchievement ▶ server sync failed', err);
    } else {
      console.warn('awardAchievement ▶ server sync skipped', err?.code);
    }
    // Keep optimistic state if server fails
    return { profile: optimisticProfile, notification };
  }
}
