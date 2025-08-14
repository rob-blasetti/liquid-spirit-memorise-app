import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { Button } from 'liquid-spirit-styleguide';
import { loginNuriUser, requestPasswordReset } from '../services/authService';
import { loadCredentials, saveCredentials } from '../services/credentialService';
import ScreenBackground from '../components/ScreenBackground';
import themeVariables from '../styles/theme';

export default function NuriLoginScreen({ onSignIn, navigation }) {
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
      onSignIn(data);
    } catch (err) {
      console.error('Login failed', err);
    }
  };

  return (
    <ScreenBackground>
      <View style={styles.container}>
        <Text style={styles.heading}>Log In</Text>

        <Text style={styles.label}>Username or Email</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          autoCapitalize="none"
          autoCorrect={false}
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          style={styles.input}
        />

        <Text
          style={styles.forgotLink}
          onPress={async () => {
            try {
              await requestPasswordReset(email);
            } catch (e) {
              // Silently ignore; backend may not be implemented yet
            }
          }}
        >
          Forgot your password?
        </Text>

        <Button label="Log In" onPress={handleLogin} style={styles.fullWidthButton} />
      </View>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'transparent',
  },
  heading: { fontSize: 24, marginBottom: 16, color: themeVariables.whiteColor },
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
