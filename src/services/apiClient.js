import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config';

export const ERROR_MESSAGE_OVERRIDES = new Map([
  ['guest not found', "We couldn't find an account with that username/email."],
  ['user not found', "We couldn't find an account with that username/email."],
]);

export const buildApiUrl = (path, baseUrl = API_URL) => `${baseUrl}${path}`;

export const extractErrorMessage = async (response, fallbackMessage, overrides = ERROR_MESSAGE_OVERRIDES) => {
  let message = fallbackMessage;
  let parsedBody;
  let rawBody = '';

  try {
    const text = await response.text();
    rawBody = text;
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
    if (overrides.has(normalized)) {
      message = overrides.get(normalized);
    }
  }

  const error = new Error(message);
  error.status = response.status;
  error.fallbackMessage = fallbackMessage;
  if (rawBody) {
    error.rawBody = rawBody;
  }
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

export const apiRequest = async ({
  path,
  baseUrl,
  method = 'GET',
  body,
  headers = {},
  fallbackMessage = 'Request failed',
  parse = 'json',
  overrides,
}) => {
  const url = buildApiUrl(path, baseUrl);
  const response = await fetch(url, {
    method,
    headers,
    body,
  });

  if (!response.ok) {
    if (__DEV__) {
      console.warn('[api-error-response]', method, url, response.status);
    }
    await extractErrorMessage(response, fallbackMessage, overrides ?? ERROR_MESSAGE_OVERRIDES);
  }

  if (parse === 'none' || response.status === 204) {
    return null;
  }

  if (parse === 'text') {
    return response.text();
  }

  return response.json();
};

export const getAuthToken = async () => AsyncStorage.getItem('token');

export const getAuthHeaders = async (headers = {}) => {
  const token = await getAuthToken();
  if (!token) {
    return headers;
  }
  return {
    ...headers,
    Authorization: `Bearer ${token}`,
  };
};

export const authedApiRequest = async ({ headers = {}, ...rest }) =>
  apiRequest({
    ...rest,
    headers: await getAuthHeaders(headers),
  });

export const postJson = ({ path, payload, fallbackMessage, headers = {}, overrides, baseUrl }) =>
  apiRequest({
    path,
    baseUrl,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: JSON.stringify(payload),
    fallbackMessage,
    overrides,
  });

export const authedPostJson = async ({ path, payload, fallbackMessage, headers = {}, overrides, baseUrl }) =>
  authedApiRequest({
    path,
    baseUrl,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: JSON.stringify(payload),
    fallbackMessage,
    overrides,
  });

export const deleteJson = ({ path, payload, token, fallbackMessage, overrides, baseUrl }) => {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  if (payload) {
    headers['Content-Type'] = 'application/json';
  }
  return apiRequest({
    path,
    baseUrl,
    method: 'DELETE',
    headers,
    body: payload ? JSON.stringify(payload) : undefined,
    fallbackMessage,
    overrides,
    parse: 'text',
  });
};
