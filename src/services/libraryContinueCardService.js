import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY_PREFIX = 'libraryContinueCardHidden:';

const buildKey = (profileId) => `${KEY_PREFIX}${profileId || 'default'}`;

export const getLibraryContinueCardHidden = async (profileId) => {
  const key = buildKey(profileId);
  const raw = await AsyncStorage.getItem(key);
  return raw === '1';
};

export const setLibraryContinueCardHidden = async (profileId, hidden) => {
  const key = buildKey(profileId);
  if (hidden) {
    await AsyncStorage.setItem(key, '1');
    return;
  }
  await AsyncStorage.removeItem(key);
};

export default {
  getLibraryContinueCardHidden,
  setLibraryContinueCardHidden,
};
