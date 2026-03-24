import {
  postJson,
  deleteJson,
} from './apiClient';

const LINKED = 'linked';

const logAuthEndpoint = (label, path, payload) => {
  if (!__DEV__) return;
  console.log('[auth-endpoint]', label, path, payload);
};

export const signInWithLiquidSpirit = async (email, password) => {
  try {
    const payload = { email, password, type: LINKED };
    logAuthEndpoint('liquid-spirit-login', '/api/nuri/login-ls', { email, type: LINKED });
    return await postJson({
      path: '/api/nuri/login-ls',
      payload,
      fallbackMessage: 'Failed to authenticate',
    });
  } catch (e) {
    console.error('Sign in failed', e);
    throw e;
  }
};

export const verifyBahaiEmail = async (bahaiId, email) => {
  try {
    return await postJson({
      path: '/api/nuri/login-ls',
      payload: { identifier: bahaiId, email, type: 'verify-email' },
      fallbackMessage: 'Email verification failed',
    });
  } catch (e) {
    console.error('Email verification failed', e);
    throw e;
  }
};

export const registerNuriUser = async (username, email, password, grade) => {
  try {
    const payload = { username, email, password, grade };
    logAuthEndpoint('nuri-register', '/api/nuri/register', { username, email, grade });
    return await postJson({
      path: '/api/nuri/register',
      payload,
      fallbackMessage: 'Registration failed',
    });
  } catch (e) {
    console.error('Nuri registration error:', e);
    throw e;
  }
};

export const loginNuriUser = async (email, password) => {
  try {
    const payload = { email, password };
    logAuthEndpoint('nuri-login', '/api/nuri/login', { email });
    return await postJson({
      path: '/api/nuri/login',
      payload,
      fallbackMessage: 'Login failed',
    });
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
    return await postJson({
      path: '/api/nuri/request-password-reset',
      payload: { identifier },
      fallbackMessage: 'Password reset request failed',
    });
  } catch (e) {
    console.error('Password reset request failed:', e);
    throw e;
  }
};

export const requestLiquidSpiritPasswordReset = async email => {
  try {
    return await postJson({
      path: '/api/nuri/nuriForgotPassword',
      payload: { email },
      fallbackMessage: 'Liquid Spirit password reset failed',
    });
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
    const responseText = await deleteJson({
      path: '/api/nuri/user',
      payload: userId ? { userId } : undefined,
      token,
      fallbackMessage: 'Failed to delete account.',
    });

    if (!responseText) {
      return null;
    }

    try {
      return JSON.parse(responseText);
    } catch {
      return responseText;
    }
  } catch (e) {
    if (/linked nuri users/i.test(e?.message || '')) {
      e.message = 'This account is linked to other Nuri profiles and cannot be deleted from the app. Please go to settings in your Liquid Spirit profile to delete this account or associated accounts.';
    }
    console.error('Nuri account deletion failed:', e?.message || e);
    throw e;
  }
};
