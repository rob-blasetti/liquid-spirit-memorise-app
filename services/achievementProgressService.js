import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_PREFIX = 'achievementProgress:';

const defaultProgress = () => ({
  counters: {},
  uniques: {},
  flags: {},
  daily: {
    lastDate: null,
    streak: 0,
  },
});

const getStorageKey = (userId) => `${STORAGE_PREFIX}${userId}`;

export async function loadProgress(userId) {
  if (!userId) return defaultProgress();
  try {
    const raw = await AsyncStorage.getItem(getStorageKey(userId));
    if (!raw) return defaultProgress();
    const parsed = JSON.parse(raw);
    return {
      ...defaultProgress(),
      ...parsed,
      counters: { ...defaultProgress().counters, ...parsed?.counters },
      uniques: { ...defaultProgress().uniques, ...parsed?.uniques },
      flags: { ...defaultProgress().flags, ...parsed?.flags },
      daily: { ...defaultProgress().daily, ...parsed?.daily },
    };
  } catch (error) {
    console.error('achievementProgressService.loadProgress failed', error);
    return defaultProgress();
  }
}

export async function saveProgress(userId, progress) {
  if (!userId) return;
  try {
    await AsyncStorage.setItem(getStorageKey(userId), JSON.stringify(progress));
  } catch (error) {
    console.error('achievementProgressService.saveProgress failed', error);
  }
}

async function updateProgress(userId, updater) {
  const current = await loadProgress(userId);
  const next = updater(current);
  if (!next) return current;
  await saveProgress(userId, next);
  return next;
}

export async function incrementCounter(userId, key, amount = 1) {
  if (!userId || !key) return 0;
  let value = 0;
  await updateProgress(userId, (progress) => {
    const counters = { ...progress.counters };
    const nextValue = (counters[key] || 0) + amount;
    counters[key] = nextValue;
    value = nextValue;
    return { ...progress, counters };
  });
  return value;
}

export async function recordUniqueItem(userId, category, id) {
  if (!userId || !category || !id) return { count: 0, added: false };
  let result = { count: 0, added: false };
  await updateProgress(userId, (progress) => {
    const uniques = { ...progress.uniques };
    const categoryEntries = { ...(uniques[category] || {}) };
    if (categoryEntries[id]) {
      result = { count: Object.keys(categoryEntries).length, added: false };
      return progress;
    }
    categoryEntries[id] = true;
    uniques[category] = categoryEntries;
    result = { count: Object.keys(categoryEntries).length, added: true };
    return { ...progress, uniques };
  });
  return result;
}

const formatLocalDateKey = (date = new Date()) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getPreviousDateKey = (date = new Date()) => {
  const prev = new Date(date);
  prev.setDate(prev.getDate() - 1);
  return formatLocalDateKey(prev);
};

export async function recordDailyChallenge(userId) {
  if (!userId) return { streak: 0, repeated: false };
  const todayKey = formatLocalDateKey();
  const yesterdayKey = getPreviousDateKey();
  let payload = { streak: 0, repeated: false };
  await updateProgress(userId, (progress) => {
    const daily = { ...progress.daily };
    if (daily.lastDate === todayKey) {
      payload = { streak: daily.streak || 1, repeated: true };
      return progress;
    }
    const previousStreak = daily.streak || 0;
    const nextStreak = daily.lastDate === yesterdayKey ? previousStreak + 1 : 1;
    daily.lastDate = todayKey;
    daily.streak = nextStreak;
    payload = { streak: nextStreak, repeated: false };
    return { ...progress, daily };
  });
  return payload;
}

export async function ensureFlag(userId, flag) {
  if (!userId || !flag) return false;
  let newlySet = false;
  await updateProgress(userId, (progress) => {
    const flags = { ...progress.flags };
    if (flags[flag]) {
      newlySet = false;
      return progress;
    }
    flags[flag] = true;
    newlySet = true;
    return { ...progress, flags };
  });
  return newlySet;
}

