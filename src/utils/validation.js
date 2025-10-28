const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const isNonEmptyString = value => typeof value === 'string' && value.trim().length > 0;

export const isValidEmail = value => {
  if (typeof value !== 'string') {
    return false;
  }
  return EMAIL_REGEX.test(value.trim().toLowerCase());
};

export const hasMinLength = (value, min) => {
  if (typeof value !== 'string') {
    return false;
  }
  return value.length >= min;
};

export const sanitizeString = value => (typeof value === 'string' ? value.trim() : '');
