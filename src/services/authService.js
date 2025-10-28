import { API_URL } from '../config';
const LINKED = 'linked';
const ERROR_MESSAGE_OVERRIDES = new Map([
  ['guest not found', "We couldn't find an account with that username/email."],
  ['user not found', "We couldn't find an account with that username/email."],
]);

const extractErrorMessage = async (response, fallbackMessage) => {
  let message = fallbackMessage;
  let parsedBody;

  try {
    const text = await response.text();
    if (text) {
      try {
        parsedBody = JSON.parse(text);
        if (parsedBody && typeof parsedBody.message === 'string' && parsedBody.message.trim().length > 0) {
          message = parsedBody.message.trim();
        } else if (parsedBody && typeof parsedBody.error === 'string' && parsedBody.error.trim().length > 0) {
          message = parsedBody.error.trim();
        } else if (Array.isArray(parsedBody.errors) && parsedBody.errors.length > 0) {
          const firstError = parsedBody.errors.find(err => typeof err?.message === 'string' && err.message.trim().length > 0);
          if (firstError) {
            message = firstError.message.trim();
          }
        }
      } catch {
        const trimmed = text.trim();
        if (trimmed.length > 0) {
          message = trimmed;
        }
      }
    }
  } catch (parseError) {
    console.warn('Failed to parse error response', parseError);
  }

  if (typeof message === 'string') {
    const normalized = message.trim().toLowerCase();
    if (ERROR_MESSAGE_OVERRIDES.has(normalized)) {
      message = ERROR_MESSAGE_OVERRIDES.get(normalized);
    }
  }

  const error = new Error(message);
  error.status = response.status;
  error.fallbackMessage = fallbackMessage;
  if (parsedBody !== undefined) {
    error.payload = parsedBody;
    if (parsedBody && typeof parsedBody === 'object') {
      if (typeof parsedBody.code !== 'undefined') {
        error.code = parsedBody.code;
      }
      if (parsedBody.details) {
        error.details = parsedBody.details;
      }
      if (Array.isArray(parsedBody.errors)) {
        error.payloadErrors = parsedBody.errors;
      }
    }
  }
  throw error;
};

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
      await extractErrorMessage(response, 'Failed to authenticate');
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
    if (!response.ok) await extractErrorMessage(response, 'Email verification failed');
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
    if (!response.ok) await extractErrorMessage(response, 'Registration failed');
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
    if (!response.ok) await extractErrorMessage(response, 'Login failed');
    const data = await response.json();
    return data;
  } catch (e) {
    if (e?.status === 400 || e?.status === 401 || e?.status === 404) {
      console.warn('Nuri login error:', e);
    } else {
      console.error('Nuri login error:', e);
    }
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
    if (!response.ok) await extractErrorMessage(response, 'Password reset request failed');
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
    if (!response.ok) await extractErrorMessage(response, 'Liquid Spirit password reset failed');
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
