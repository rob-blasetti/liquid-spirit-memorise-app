import { API_URL } from '../config';
const LINKED = 'linked';

export const signInWithLiquidSpirit = async (email, password) => {
  try {
    const response = await fetch(`${API_URL}/api/nuri/login-ls`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password, type: LINKED }),
    });
    console.log('Response from Liquid Spirit login:', response);
    
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

export const registerNuriUser = async (username, email, password, grade) => {
  try {
    const response = await fetch(`${API_URL}/api/nuri/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password, grade }),
    });
    if (!response.ok) throw new Error('Registration failed');
    const data = await response.json();
    console.log('data token and user: ', data.token, data.user);
    return data;
  } catch (e) {
    console.error('Nuri registration error:', e);
    throw e;
  }
};

export const loginNuriUser = async (email, password) => {
  try {
    const response = await fetch(`${API_URL}/api/nuri/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!response.ok) throw new Error('Login failed');
    const data = await response.json();
    return data;
  } catch (e) {
    console.error('Nuri login error:', e);
    throw e;
  }
};

export const requestPasswordReset = async identifier => {
  try {
    const response = await fetch(`${API_URL}/api/nuri/request-password-reset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier }),
    });
    if (!response.ok) throw new Error('Password reset request failed');
    return await response.json();
  } catch (e) {
    console.error('Password reset request failed:', e);
    throw e;
  }
};

export const requestLiquidSpiritPasswordReset = async email => {
  try {
    const response = await fetch(`${API_URL}/api/nuri/nuriForgotPassword`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    if (!response.ok) throw new Error('Liquid Spirit password reset failed');
    return await response.json();
  } catch (e) {
    console.error('Liquid Spirit password reset request failed:', e);
    throw e;
  }
};

export const deleteNuriUser = async ({ token, userId } = {}) => {
  if (!token) {
    throw new Error('Missing authentication token.');
  }

  try {
    const headers = {
      Authorization: `Bearer ${token}`,
    };
    const body = userId ? JSON.stringify({ userId }) : undefined;
    if (body) {
      headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(`${API_URL}/api/nuri/user`, {
      method: 'DELETE',
      headers,
      body,
    });

    if (response.status === 204) {
      return null;
    }

    const responseText = await response.text();
    if (!response.ok) {
      let parsed;
      let message = 'Failed to delete account.';
      if (responseText) {
        message = responseText;
        try {
          parsed = JSON.parse(responseText);
          if (parsed && typeof parsed.message === 'string') {
            message = parsed.message;
          }
        } catch {
          // responseText was not JSON; fall back to raw string
        }
      }

      if (/linked nuri users/i.test(message)) {
        message = 'This account is linked to other Nuri profiles and cannot be deleted from the app. Please go to settings in your Liquid Spirit profile to delete this account or associated accounts.';
      }

      const error = new Error(message);
      error.status = response.status;
      error.payload = parsed;
      throw error;
    }

    if (!responseText) {
      return null;
    }

    try {
      return JSON.parse(responseText);
    } catch (parseError) {
      return responseText;
    }
  } catch (e) {
    console.error('Nuri account deletion failed:', e?.message || e);
    throw e;
  }
};
