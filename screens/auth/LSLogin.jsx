import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { Button } from 'liquid-spirit-styleguide';
import { signInWithLiquidSpirit } from '../../services/authService';
import { loadCredentials, saveCredentials } from '../../services/credentialService';
import ScreenBackground from '../../components/ScreenBackground';
import themeVariables from '../../styles/theme';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function LSLogin({ navigation, onSignIn }) {
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);

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
      onSignIn(data);
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

        <Text style={styles.label}>Email</Text>
        <TextInput
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          autoCapitalize="none"
          autoCorrect={false}
          editable={!loading}
        />

        <Text style={styles.label}>Password</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            secureTextEntry={!passwordVisible}
            value={password}
            onChangeText={setPassword}
            style={styles.passwordInput}
            editable={!loading}
          />
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={passwordVisible ? 'Hide password' : 'Show password'}
            onPress={() => setPasswordVisible((prev) => !prev)}
            style={styles.toggleIcon}
            disabled={loading}
          >
            <Ionicons
              name={passwordVisible ? 'eye-off' : 'eye'}
              size={20}
              color={themeVariables.primaryColor}
            />
          </TouchableOpacity>
        </View>
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
  passwordContainer: {
    width: '80%',
    marginBottom: 12,
    borderWidth: 1,
    borderRadius: 8,
    borderColor: themeVariables.primaryColor,
    backgroundColor: themeVariables.whiteColor,
    flexDirection: 'row',
    alignItems: 'center',
  },
  passwordInput: {
    flex: 1,
    padding: 10,
  },
  toggleIcon: {
    paddingHorizontal: 12,
    paddingVertical: 10,
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
