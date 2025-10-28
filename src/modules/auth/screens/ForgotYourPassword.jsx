import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { Button } from 'liquid-spirit-styleguide';
import { requestPasswordReset, requestLiquidSpiritPasswordReset } from '../../../services/authService';
import ScreenBackground from '../../../ui/components/ScreenBackground';
import TopNav from '../../../ui/components/TopNav';
import themeVariables from '../../../ui/stylesheets/theme';
import buttonStyles from '../../../ui/stylesheets/buttonStyles';
import useParentalGate from '../../../hooks/useParentalGate';

const ForgotYourPassword = ({ route, navigation }) => {
  const isLiquidSpiritReset = route?.params?.mode === 'ls';
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const { requestPermission, ParentalGate } = useParentalGate();

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
      const approved = await requestPermission();
      if (!approved) {
        setLoading(false);
        return;
      }
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
        <TopNav title="Forgot Password" onBack={handleBack} />
        <View style={styles.container}>
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
            label={loading ? 'Sending…' : 'Send Password Reset Email'}
            onPress={handleSend}
            disabled={loading}
            style={[buttonStyles.pill, styles.fullWidthButton]}
            textStyle={buttonStyles.pillText}
          />
        </View>
        {ParentalGate}
      </View>
    </ScreenBackground>
  );
};

export default ForgotYourPassword;

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
    alignSelf: 'center',
    marginTop: 20,
  },
});
