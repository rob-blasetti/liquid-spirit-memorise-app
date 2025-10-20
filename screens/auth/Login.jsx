import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Keyboard } from 'react-native';
import { Button } from 'liquid-spirit-styleguide';
import { loginNuriUser } from '../../services/authService';
import { loadCredentials, saveCredentials } from '../../services/credentialService';
import ScreenBackground from '../../components/ScreenBackground';
import TopNav from '../../components/TopNav';
import themeVariables from '../../styles/theme';
import buttonStyles from '../../styles/buttonStyles';
import { EmailInput, PasswordInput } from '../../components/form';
import { isNonEmptyString, isValidEmail, sanitizeString } from '../../utils/validation';

export default function Login({ onSignIn: onSignInProp, navigation, route }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);
  const resolvedOnSignIn =
    typeof onSignInProp === 'function'
      ? onSignInProp
      : typeof route?.params?.onSignIn === 'function'
      ? route.params.onSignIn
      : undefined;

  useEffect(() => {
    const fetchCredentials = async () => {
      const creds = await loadCredentials();
      if (creds) {
        setEmail(creds.email);
        setPassword(creds.password);
      }
    };
    fetchCredentials();
  }, []);

  const clearFieldError = useCallback(field => {
    if (field === 'form') {
      setFormError('');
      return;
    }
    setErrors(prev => {
      if (!prev[field]) {
        return prev;
      }
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  const validate = () => {
    const nextErrors = {};
    const trimmedEmail = sanitizeString(email);
    if (!isNonEmptyString(trimmedEmail)) {
      nextErrors.email = 'Please enter your username or email.';
    } else if (trimmedEmail.includes('@') && !isValidEmail(trimmedEmail)) {
      nextErrors.email = 'Enter a valid email address.';
    }

    if (!isNonEmptyString(password)) {
      nextErrors.password = 'Password is required.';
    }

    return nextErrors;
  };

  const isSubmitDisabled = loading || !isNonEmptyString(email) || !isNonEmptyString(password);

  const handleLogin = async () => {
    Keyboard.dismiss();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setFormError('Please fix the errors above before continuing.');
      return;
    }

    setErrors({});
    setFormError('');
    setLoading(true);

    try {
      const trimmedEmail = sanitizeString(email);
      const data = await loginNuriUser(trimmedEmail, password);
      await saveCredentials(trimmedEmail, password);
      const { user, ...rest } = data || {};
      if (!user) {
        console.warn('Login response missing user data');
        return;
      }
      if (typeof resolvedOnSignIn === 'function') {
        resolvedOnSignIn({ ...rest, user, authType: 'nuri-login' });
      } else {
        console.warn('Login succeeded but no onSignIn handler was provided to Login screen');
      }
    } catch (error) {
      if (error?.status === 400 || error?.status === 401 || error?.status === 404) {
        console.warn('Login failed', error);
      } else {
        console.error('Login failed', error);
      }
      const fallbackMessage = 'Login failed. Please try again.';
      const messageFromError =
        error && typeof error.message === 'string' && error.message.trim().length > 0
          ? error.message.trim()
          : '';
      const messageFromPayload =
        error?.payload?.error && typeof error.payload.error === 'string' && error.payload.error.trim().length > 0
          ? error.payload.error.trim()
          : '';
      const messageFromPayloadErrors = Array.isArray(error?.payloadErrors)
        ? error.payloadErrors
            .map(item => (typeof item?.message === 'string' ? item.message.trim() : ''))
            .find(Boolean)
        : '';
      const resolvedMessage =
        messageFromError || messageFromPayload || messageFromPayloadErrors || error?.fallbackMessage || fallbackMessage;
      const isCredentialIssue = error?.status === 400 || error?.status === 401;
      const isNotFound = error?.status === 404;
      const isServerError =
        (typeof error?.status === 'number' && error.status >= 500) ||
        /server error/i.test(messageFromError);
      const credentialsMessage = 'Incorrect username/email or password.';
      const notFoundMessage = "We couldn't find an account with that username/email.";
      const serverErrorMessage =
        "We're having trouble signing you in right now. Please try again in a moment.";
      setErrors(prev => {
        const next = { ...prev };
        if (isCredentialIssue) {
          next.password = credentialsMessage;
        } else {
          delete next.password;
        }
        if (isNotFound) {
          next.email = notFoundMessage;
        } else if (!isCredentialIssue) {
          delete next.email;
        }
        return next;
      });
      if (isCredentialIssue) {
        setFormError(credentialsMessage);
      } else if (isNotFound) {
        setFormError(notFoundMessage);
      } else if (isServerError) {
        setFormError(serverErrorMessage);
      } else {
        setFormError(resolvedMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (navigation?.canGoBack()) {
      navigation.goBack();
    } else {
      navigation?.navigate?.('Welcome');
    }
  };

  return (
    <ScreenBackground>
      <View style={styles.outer}>
        <TopNav title="Log In" onBack={handleBack} />
        <View style={styles.container}>
          <EmailInput
            label="Username or Email"
            value={email}
            onChangeText={text => {
              setEmail(text);
              clearFieldError('email');
              clearFieldError('form');
            }}
            placeholder="Email"
            placeholderTextColor={themeVariables.placeholderColor || '#666'}
            onBlur={() => {
              const validationErrors = validate();
              if (validationErrors.email) {
                setErrors(prev => ({ ...prev, email: validationErrors.email }));
              }
            }}
          />
          {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}

          <PasswordInput
            value={password}
            onChangeText={text => {
              setPassword(text);
              clearFieldError('password');
              clearFieldError('form');
            }}
            placeholder="Password"
            placeholderTextColor={themeVariables.placeholderColor || '#666'}
            showToggle
            editable={!loading}
            onBlur={() => {
              const validationErrors = validate();
              if (validationErrors.password) {
                setErrors(prev => ({ ...prev, password: validationErrors.password }));
              }
            }}
          />
          {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}

          <Text
            style={styles.forgotLink}
            onPress={() => navigation.navigate('ForgotYourPassword')}
          >
            Forgot your password?
          </Text>

          {formError ? <Text style={styles.generalError}>{formError}</Text> : null}

          <Button
            label={loading ? 'Logging in...' : 'Log In'}
            onPress={handleLogin}
            disabled={isSubmitDisabled}
            style={[
              buttonStyles.pill,
              styles.fullWidthButton,
              isSubmitDisabled && buttonStyles.pillDisabled,
            ]}
            textStyle={[
              buttonStyles.pillText,
              isSubmitDisabled && buttonStyles.pillTextDisabled,
            ]}
          />
        </View>
      </View>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  outer: {
    flex: 1,
    width: '100%',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'transparent',
  },
  heading: { fontSize: 24, marginBottom: 16, color: themeVariables.whiteColor },
  forgotLink: {
    alignSelf: 'flex-start',
    width: '80%',
    marginLeft: '10%',
    marginTop: 4,
    marginBottom: 16,
    color: themeVariables.whiteColor,
    textDecorationLine: 'underline',
  },
  fullWidthButton: {
    width: '80%',
    alignSelf: 'center',
    marginTop: 12,
  },
  errorText: {
    alignSelf: 'flex-start',
    width: '80%',
    marginLeft: '10%',
    marginTop: -8,
    marginBottom: 12,
    color: themeVariables.redColor || '#ff4d4f',
  },
  generalError: {
    width: '80%',
    alignSelf: 'center',
    textAlign: 'center',
    marginBottom: 12,
    color: themeVariables.redColor || '#ff4d4f',
  },
});
