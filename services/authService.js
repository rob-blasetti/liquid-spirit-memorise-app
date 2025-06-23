import { API_URL } from '../config';

/**
 * Authenticate a user with Liquid Spirit using Bahai ID and password.
 * @param {string} bahaiID - The user's Bahai ID.
 * @param {string} password - The user's password.
 * @returns {Promise<object>} Authenticated user data.
 */
export const signInWithLiquidSpirit = async (bahaiId, password) => {
  console.log('API_URL in authService:', API_URL, 'bahaiId:', bahaiId);
  try {
    const response = await fetch(`${API_URL}/api/nuri/authenticate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ bahaiId, password }),
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
