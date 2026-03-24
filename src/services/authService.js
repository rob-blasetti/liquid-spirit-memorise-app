import {
  postJson,
  deleteJson,
  buildApiUrl,
} from './apiClient';
import { AUTH_API_URL } from '../config';

const LINKED = 'linked';
const logAuthRoute = (method, path, payload) => {
  if (!__DEV__) return;
  console.log('[auth-endpoint]', method, buildApiUrl(path, AUTH_API_URL), payload);
};

export const signInWithLiquidSpirit = async (email, password) => {
  try {
    const payload = { email, password, type: LINKED };
    logAuthRoute('POST', '/api/auth/nuri/login-ls', { email, type: LINKED });
    return await postJson({
      baseUrl: AUTH_API_URL,
      path: '/api/auth/nuri/login-ls',
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
    logAuthRoute('POST', '/api/nuri/login-ls', { identifier: bahaiId, email, type: 'verify-email' });
    return await postJson({
      baseUrl: AUTH_API_URL,
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
    logAuthRoute('POST', '/api/auth/nuri/register', { username, email, grade });
    return await postJson({
      baseUrl: AUTH_API_URL,
      path: '/api/auth/nuri/register',
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
    logAuthRoute('POST', '/api/auth/nuri/login', { email });
    return await postJson({
      baseUrl: AUTH_API_URL,
      path: '/api/auth/nuri/login',
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
    logAuthRoute('POST', '/api/nuri/request-password-reset', { identifier });
    return await postJson({
      baseUrl: AUTH_API_URL,
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
    logAuthRoute('POST', '/api/nuri/nuriForgotPassword', { email });
    return await postJson({
      baseUrl: AUTH_API_URL,
      path: '/api/nuri/nuriForgotPassword',
      payload: { email },
      fallbackMessage: 'Liquid Spirit password reset failed',
    });
  } catch (e) {
    console.error('Liquid Spirit password reset request failed:', e);
    throw e;
  }
};

export const deleteNuriUser = async ({ token, userId, nuriUserId, email, username } = {}) => {
  if (!token) {
    throw new Error('Missing authentication token.');
  }

  try {
    const payload = {
      ...(nuriUserId ? { nuriUserId } : {}),
      ...(userId ? { userId } : {}),
      ...(email ? { email } : {}),
      ...(username ? { username } : {}),
    };
    logAuthRoute(
      'DELETE',
      '/api/auth/nuri/user',
      Object.keys(payload).length > 0 ? payload : undefined
    );
    const responseText = await deleteJson({
      baseUrl: AUTH_API_URL,
      path: '/api/auth/nuri/user',
      payload: Object.keys(payload).length > 0 ? payload : undefined,
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
