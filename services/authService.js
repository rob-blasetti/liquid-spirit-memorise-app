import { API_URL } from '../config';

/**
 * Authenticate a user with Liquid Spirit using Bahai ID and password.
 * @param {string} bahaiID - The user's Bahai ID.
 * @param {string} password - The user's password.
 * @returns {Promise<object>} Authenticated user data.
 */
export const signInWithLiquidSpirit = async (bahaiId, password) => {
  console.log('API_URL in authService:', API_URL, 'bahaiId:', bahaiId, 'password', password);
  try {
    const response = await fetch(`${API_URL}/api/nuri/login-ls`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ identifier: bahaiId, password, type: 'auth' }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to authenticate');
    }

    const responseData = await response.json();
    console.log('Fetched auth with LS:', responseData);
    return responseData;
  } catch (e) {
    console.error('Sign in failed', e);
    throw e;
  }
};

/**
 * Register a guest user with username and password.
 * @param {string} username - The guest's username.
 * @param {string} password - The guest's password.
 * @returns {Promise<object>} Registered guest data.
 */
export const registerGuest = async (username, password) => {
  try {
    const response = await fetch(`${API_URL}/api/nuri/register-guest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    console.log('response: ', response);
    if (!response.ok) throw new Error('Guest registration failed');
    const data = await response.json();
    return data;
  } catch (e) {
    console.error('Guest registration error:', e);
    throw e;
  }
};

export const loginGuest = async (username, password) => {
  try {
    const response = await fetch(`${API_URL}/api/nuri/login-guest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: username, password }),
    });

    if (!response.ok) throw new Error('Guest login failed');

    const data = await response.json();
    return data;
  } catch (e) {
    console.error('Guest login error:', e);
    throw e;
  }
};
/**
 * Verify a Bahá'í ID by sending an email to the associated address.
 * @param {string} bahaiId - The user's Bahá'í ID.
 * @param {string} email - The email associated with the Bahá'í ID.
 * @returns {Promise<object>} Response data.
 */
export const verifyBahaiEmail = async (bahaiId, email) => {
  try {
    const response = await fetch(`${API_URL}/api/nuri/login-ls`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: bahaiId, email, type: 'verify-email' }),
    });
    if (!response.ok) throw new Error('Email verification failed');
    const data = await response.json();
    return data;
  } catch (e) {
    console.error('Email verification failed', e);
    throw e;
  }
};
