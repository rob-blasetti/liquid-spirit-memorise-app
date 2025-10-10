import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Button } from 'liquid-spirit-styleguide';
import { signInWithLiquidSpirit } from '../../services/authService';
import { loadCredentials, saveCredentials } from '../../services/credentialService';
import ScreenBackground from '../../components/ScreenBackground';
import themeVariables from '../../styles/theme';
import { EmailInput, PasswordInput } from '../../components/form';

export default function LSLogin({ navigation, onSignIn }) {
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

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
    console.log('Attempting Liquid Spirit login with:', { email, password });
    try {
      setLoading(true);
      await saveCredentials(email, password);
      const data = await signInWithLiquidSpirit(email, password);
      console.log('Liquid Spirit login successful', data);
      const { user, ...rest } = data || {};
      if (!user) {
        console.warn('Liquid Spirit login response missing user data');
        return;
      }
      onSignIn({ ...rest, user, authType: 'ls-login' });
    } catch (err) {
      console.error('Liquid Spirit login failed', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenBackground>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
          <View style={styles.container}>
            <Text style={styles.heading}>Log In With Liquid Spirit</Text>

            <EmailInput
              value={email}
              onChangeText={setEmail}
              editable={!loading}
            />

            <PasswordInput
              value={password}
              onChangeText={setPassword}
              editable={!loading}
              showToggle
            />
            <Text
              style={styles.forgotLink}
              onPress={() => navigation.navigate('ForgotYourPassword', { mode: 'ls' })}
            >
              Forgot your password?
            </Text>
            <Button
              label={loading ? 'Logging in…' : 'Log In'}
              onPress={handleLogin}
              disabled={loading}
              style={styles.fullWidthButton}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  },
});
