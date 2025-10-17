import Config from 'react-native-config';

const resolveBoolean = (value, defaultValue = true) => {
  if (value == null) return defaultValue;
  const normalized = String(value).trim().toLowerCase();
  if (normalized === '') return defaultValue;
  if (['1', 'true', 'yes', 'on', 'enabled'].includes(normalized)) return true;
  if (['0', 'false', 'no', 'off', 'disabled'].includes(normalized)) return false;
  return defaultValue;
};

const parseIdList = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value
      .map((item) => (item != null ? String(item).trim() : ''))
      .filter(Boolean);
  }
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) {
      return parsed
        .map((item) => (item != null ? String(item).trim() : ''))
        .filter(Boolean);
    }
  } catch (e) {
    // Fallback to comma/space separated parsing
  }
  return String(value)
    .split(/[, ]+/)
    .map((item) => item.trim())
    .filter(Boolean);
};

export const ACHIEVEMENTS_ENABLED = resolveBoolean(Config.ACHIEVEMENTS_ENABLED, true);

const ENABLED_IDS = new Set(parseIdList(Config.ACHIEVEMENTS_ENABLED_IDS));
const DISABLED_IDS = new Set(parseIdList(Config.ACHIEVEMENTS_DISABLED_IDS));

export const ENABLED_ACHIEVEMENT_IDS = ENABLED_IDS;
export const DISABLED_ACHIEVEMENT_IDS = DISABLED_IDS;

export const isAchievementEnabled = (id) => {
  if (!id) return false;
  const key = String(id).trim();
  if (!key) return false;

  if (!ACHIEVEMENTS_ENABLED) {
    return ENABLED_IDS.size > 0 ? ENABLED_IDS.has(key) : false;
  }

  if (ENABLED_IDS.size > 0 && !ENABLED_IDS.has(key)) {
    return false;
  }

  return !DISABLED_IDS.has(key);
};

export const filterEnabledAchievements = (list = []) =>
  list.filter((item) => isAchievementEnabled(item?.id));

export default {
  ACHIEVEMENTS_ENABLED,
  ENABLED_ACHIEVEMENT_IDS,
  DISABLED_ACHIEVEMENT_IDS,
  isAchievementEnabled,
  filterEnabledAchievements,
};
