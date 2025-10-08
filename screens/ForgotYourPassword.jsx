import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { Button } from 'liquid-spirit-styleguide';
import { requestPasswordReset, requestLiquidSpiritPasswordReset } from '../services/authService';
import ScreenBackground from '../components/ScreenBackground';
import themeVariables from '../styles/theme';

const ForgotYourPassword = ({ route }) => {
  const isLiquidSpiritReset = route?.params?.mode === 'ls';
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSend = async () => {
    // Clear previous messages each time the user submits.
    setStatusMessage('');
    setErrorMessage('');

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setErrorMessage('Please enter your email address.');
      return;
    }

    try {
      setLoading(true);
      if (isLiquidSpiritReset) {
        await requestLiquidSpiritPasswordReset(trimmedEmail);
      } else {
        await requestPasswordReset(trimmedEmail);
      }
      setStatusMessage(`Password reset link sent to ${trimmedEmail}.`);
    } catch (err) {
      // Surface a generic error to avoid exposing implementation details.
      setErrorMessage('Unable to send reset link. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenBackground>
      <View style={styles.container}>
        <Text style={styles.heading}>Forgot Your Password</Text>
        <Text style={styles.instructions}>
          Please enter your email address to reset your password.
        </Text>

        <Text style={styles.label}>Email Address</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          placeholder="Email"
          placeholderTextColor={themeVariables.placeholderColor || '#666'}
          autoCapitalize="none"
          keyboardType="email-address"
          autoCorrect={false}
          editable={!loading}
        />

        {statusMessage ? <Text style={styles.statusText}>{statusMessage}</Text> : null}
        {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

        <Button
          primary
          label={loading ? 'Sending…' : 'Send Password Reset Email'}
          onPress={handleSend}
          disabled={loading}
          style={styles.fullWidthButton}
        />
      </View>
    </ScreenBackground>
  );
};

export default ForgotYourPassword;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'transparent',
  },
  heading: { fontSize: 24, marginBottom: 16, color: themeVariables.whiteColor },
  instructions: {
    width: '80%',
    marginBottom: 12,
    marginLeft: '10%',
    color: themeVariables.whiteColor,
    textAlign: 'left',
  },
  label: {
    alignSelf: 'flex-start',
    width: '80%',
    marginLeft: '10%',
    marginBottom: 4,
    marginTop: 8,
    color: themeVariables.whiteColor,
    fontSize: 14,
  },
  input: {
    width: '80%',
    padding: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: themeVariables.whiteColor,
    borderColor: themeVariables.primaryColor,
  },
  statusText: {
    width: '80%',
    marginBottom: 12,
    marginLeft: '10%',
    color: themeVariables.successColor || '#4caf50',
    textAlign: 'left',
  },
  errorText: {
    width: '80%',
    marginBottom: 12,
    marginLeft: '10%',
    color: themeVariables.errorColor || '#ff5252',
    textAlign: 'left',
  },
  fullWidthButton: {
    width: '80%',
  },
});
