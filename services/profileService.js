import AsyncStorage from '@react-native-async-storage/async-storage';

export const loadProfile = async () => {
  try {
    const data = await AsyncStorage.getItem('profile');
    return data ? JSON.parse(data) : null;
  } catch (e) {
    console.error('Error loading profile:', e);
    return null;
  }
};

export const loadGuestProfile = async () => {
  try {
    const data = await AsyncStorage.getItem('guestProfile');
    return data ? JSON.parse(data) : null;
  } catch (e) {
    console.error('Error loading guest profile:', e);
    return null;
  }
};

export const saveProfile = async (profile) => {
  try {
    // Store registered and guest profiles separately
    if (profile.guest) {
      await AsyncStorage.setItem('guestProfile', JSON.stringify(profile));
    } else {
      await AsyncStorage.setItem('profile', JSON.stringify(profile));
    }
  } catch (e) {
    console.error('Error saving profile:', e);
  }
};

export const deleteGuestProfile = async () => {
  try {
    await AsyncStorage.removeItem('guestProfile');
  } catch (e) {
    console.error('Error deleting guest profile:', e);
  }
};

export const clearProfile = async () => {
  try {
    await AsyncStorage.removeItem('profile');
  } catch {
    // ignore errors
  }
};
