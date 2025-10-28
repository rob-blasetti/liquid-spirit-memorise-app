import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Keyboard } from 'react-native';
import { Button } from 'liquid-spirit-styleguide';
import { registerNuriUser } from '../../../../services/authService';
import themeVariables from '../../../../ui/stylesheets/theme';
import ScreenBackground from '../../../../ui/components/ScreenBackground';
import TopNav from '../../../../ui/components/TopNav';
import buttonStyles from '../../../../ui/stylesheets/buttonStyles';
import { UsernameInput, EmailInput, PasswordInput, GradeSelector } from '../../../../ui/components/form';
import { hasMinLength, isNonEmptyString, isValidEmail, sanitizeString } from '../../../../utils/validation';

const MIN_PASSWORD_LENGTH = 8;

export default function Register({ onSignIn, navigation }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const grades = ['1', '2', '2b', '3', '4', '5'];
  const disabledGrades = ['3', '4', '5'];
  const [selectedGrade, setSelectedGrade] = useState(grades[0]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

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
    const trimmedUsername = sanitizeString(username);
    if (!isNonEmptyString(trimmedUsername)) {
      nextErrors.username = 'Username is required.';
    } else if (trimmedUsername.length < 3) {
      nextErrors.username = 'Username must be at least 3 characters.';
    }

    if (!isNonEmptyString(email)) {
      nextErrors.email = 'Email is required.';
    } else if (!isValidEmail(email)) {
      nextErrors.email = 'Enter a valid email address.';
    }

    if (!isNonEmptyString(password)) {
      nextErrors.password = 'Password is required.';
    } else if (!hasMinLength(password, MIN_PASSWORD_LENGTH)) {
      nextErrors.password = `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
    }

    if (!isNonEmptyString(selectedGrade) || disabledGrades.includes(selectedGrade)) {
      nextErrors.grade = 'Please select an available grade.';
    }

    return nextErrors;
  };

  const isSubmitDisabled =
    loading ||
    !isNonEmptyString(username) ||
    !isNonEmptyString(email) ||
    !isNonEmptyString(password);

  const handleRegister = async () => {
    Keyboard.dismiss();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors({
        ...validationErrors,
        form: 'Please fix the errors above before continuing.',
      });
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      const trimmedUsername = sanitizeString(username);
      const trimmedEmail = sanitizeString(email);
      const data = await registerNuriUser(trimmedUsername, trimmedEmail, password, selectedGrade);
      const { user, ...rest } = data || {};
      if (!user) {
        console.warn('Registration response missing user data');
        return;
      }
      onSignIn({ ...rest, user, authType: 'nuri-register' });
    } catch (error) {
      console.error('Register failed', error);
      const message =
        error && typeof error.message === 'string' && error.message.trim().length > 0
          ? error.message.trim()
          : 'Registration failed. Please try again.';
      setErrors(prev => ({
        ...prev,
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
          <TopNav title="Register" onBack={handleBack} />
          <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="always">
            <View style={styles.container}>
              <UsernameInput
                value={username}
                onChangeText={text => {
                  setUsername(text);
                  clearFieldError('username');
                  clearFieldError('form');
                }}
                onBlur={() => {
                  const validationErrors = validate();
                  if (validationErrors.username) {
                    setErrors(prev => ({ ...prev, username: validationErrors.username }));
                  }
                }}
              />
              {errors.username ? <Text style={styles.errorText}>{errors.username}</Text> : null}

              <EmailInput
                value={email}
                onChangeText={text => {
                  setEmail(text);
                  clearFieldError('email');
                  clearFieldError('form');
                }}
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

              <GradeSelector
                value={selectedGrade}
                onChange={grade => {
                  setSelectedGrade(grade);
                  clearFieldError('grade');
                  clearFieldError('form');
                }}
                grades={grades}
                disabledGrades={disabledGrades}
              />
              {errors.grade ? <Text style={styles.errorText}>{errors.grade}</Text> : null}
              {errors.form ? <Text style={styles.generalError}>{errors.form}</Text> : null}
              <Button
                label={loading ? 'Registering...' : 'Register'}
                onPress={handleRegister}
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
  fullWidthButton: {
    width: '80%',
    alignSelf: 'center',
    marginTop: 16,
  },
});
