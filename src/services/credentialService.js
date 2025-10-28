import * as Keychain from 'react-native-keychain';

export const saveCredentials = async (email, password) => {
  try {
    await Keychain.setGenericPassword(email, password);
  } catch (e) {
    console.warn('Failed to save credentials', e);
  }
};

export const loadCredentials = async () => {
  try {
    const creds = await Keychain.getGenericPassword();
    if (creds) {
      return { email: creds.username, password: creds.password };
    }
  } catch (e) {
    console.warn('Failed to load credentials', e);
  }
  return { email: '', password: '' };
};

export const clearCredentials = async () => {
  try {
    await Keychain.resetGenericPassword();
  } catch (e) {
    console.warn('Failed to clear credentials', e);
  }
};
