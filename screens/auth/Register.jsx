import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Button } from 'liquid-spirit-styleguide';
import { registerNuriUser } from '../../services/authService';
import themeVariables from '../../styles/theme';
import ScreenBackground from '../../components/ScreenBackground';
import TopNav from '../../components/TopNav';
import buttonStyles from '../../styles/buttonStyles';
import { UsernameInput, EmailInput, PasswordInput, GradeSelector } from '../../components/form';

export default function Register({ onSignIn, navigation }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const grades = ['1', '2', '2b', '3', '4', '5'];
  const disabledGrades = ['3', '4', '5'];
  const [selectedGrade, setSelectedGrade] = useState(grades[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async () => {
    setError('');
    setLoading(true);
    try {
      const data = await registerNuriUser(username, email, password, selectedGrade);
      const { user, ...rest } = data || {};
      if (!user) {
        console.warn('Registration response missing user data');
        return;
      }
      onSignIn({ ...rest, user, authType: 'nuri-register' });
    } catch (err) {
      console.error('Register failed', err);
      setError(err.message || 'Registration failed');
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
          <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
            <View style={styles.container}>
              <UsernameInput value={username} onChangeText={setUsername} />
              <EmailInput value={email} onChangeText={setEmail} />
              <PasswordInput value={password} onChangeText={setPassword} showToggle />
              <GradeSelector
                value={selectedGrade}
                onChange={setSelectedGrade}
                grades={grades}
                disabledGrades={disabledGrades}
              />
              {error ? <Text style={styles.errorText}>{error}</Text> : null}
              <Button
                label={loading ? 'Registering...' : 'Register'}
                onPress={handleRegister}
                disabled={loading}
                style={[buttonStyles.pill, styles.fullWidthButton]}
                textStyle={buttonStyles.pillText}
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
    color: themeVariables.redColor || 'red',
    marginBottom: 12,
  },
  fullWidthButton: {
    width: '80%',
    alignSelf: 'center',
    marginTop: 16,
  },
});
