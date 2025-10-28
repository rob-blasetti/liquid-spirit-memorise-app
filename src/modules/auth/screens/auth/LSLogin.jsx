import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Keyboard } from 'react-native';
import { Button } from 'liquid-spirit-styleguide';
import { signInWithLiquidSpirit } from '../../../../services/authService';
import { loadCredentials, saveCredentials } from '../../../../services/credentialService';
import ScreenBackground from '../../../../ui/components/ScreenBackground';
import TopNav from '../../../../ui/components/TopNav';
import themeVariables from '../../../../ui/stylesheets/theme';
import buttonStyles from '../../../../ui/stylesheets/buttonStyles';
import { EmailInput, PasswordInput } from '../../../../ui/components/form';
import { isNonEmptyString, isValidEmail, sanitizeString } from '../../../../utils/validation';

export default function LSLogin({ navigation, onSignIn }) {
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

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

    if (!isNonEmptyString(email)) {
      nextErrors.email = 'Email is required.';
    } else if (!isValidEmail(email)) {
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
      setErrors({
        ...validationErrors,
        form: 'Please fix the errors above before continuing.',
      });
      return;
    }

    try {
      setLoading(true);
      setErrors({});
      const trimmedEmail = sanitizeString(email);
      const data = await signInWithLiquidSpirit(trimmedEmail, password);
      await saveCredentials(trimmedEmail, password);
      const { user, ...rest } = data || {};
      if (!user) {
        console.warn('Liquid Spirit login response missing user data');
        return;
      }
      onSignIn({ ...rest, user, authType: 'ls-login' });
    } catch (error) {
      console.error('Liquid Spirit login failed', error);
      const fallbackMessage = 'Unable to log in. Please try again.';
      const message =
        error && typeof error.message === 'string' && error.message.trim().length > 0
          ? error.message.trim()
          : fallbackMessage;
      const credentialsMessage =
        error?.status === 400 || error?.status === 401 ? 'Incorrect email or password.' : message;
      setErrors(prev => ({
        ...prev,
        ...(error?.status === 400 || error?.status === 401 ? { password: credentialsMessage } : {}),
        form: message,
      }));
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
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.outer}>
          <TopNav title="Liquid Spirit Login" onBack={handleBack} />
          <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="always">
            <View style={styles.container}>
              <EmailInput
                value={email}
                onChangeText={text => {
                  setEmail(text);
                  clearFieldError('email');
                  clearFieldError('form');
                }}
                editable={!loading}
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
                editable={!loading}
                showToggle
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
                onPress={() => navigation.navigate('ForgotYourPassword', { mode: 'ls' })}
              >
                Forgot your password?
              </Text>
              {errors.form ? <Text style={styles.generalError}>{errors.form}</Text> : null}
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
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
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
    width: '100%',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'stretch',
    paddingVertical: 24,
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
