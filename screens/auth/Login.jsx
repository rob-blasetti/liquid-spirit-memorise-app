import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Button } from 'liquid-spirit-styleguide';
import { loginNuriUser } from '../../services/authService';
import { loadCredentials, saveCredentials } from '../../services/credentialService';
import ScreenBackground from '../../components/ScreenBackground';
import TopNav from '../../components/TopNav';
import themeVariables from '../../styles/theme';
import { EmailInput, PasswordInput } from '../../components/form';

export default function Login({ onSignIn, navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

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

  const handleLogin = async () => {
    try {
      await saveCredentials(email, password);
      const data = await loginNuriUser(email, password);
      const { user, ...rest } = data || {};
      if (!user) {
        console.warn('Login response missing user data');
        return;
      }
      onSignIn({ ...rest, user, authType: 'nuri-login' });
    } catch (err) {
      console.error('Login failed', err);
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
            onChangeText={setEmail}
            placeholder="Email"
            placeholderTextColor={themeVariables.placeholderColor || '#666'}
          />

          <PasswordInput
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
            placeholderTextColor={themeVariables.placeholderColor || '#666'}
            showToggle
          />

          <Text
            style={styles.forgotLink}
            onPress={() => navigation.navigate('ForgotYourPassword')}
          >
            Forgot your password?
          </Text>

          <Button label="Log In" onPress={handleLogin} style={styles.fullWidthButton} />
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
  },
});
