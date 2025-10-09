import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Button } from 'liquid-spirit-styleguide';
import { registerNuriUser } from '../../services/authService';
import themeVariables from '../../styles/theme';
import ScreenBackground from '../../components/ScreenBackground';
import { UsernameInput, EmailInput, PasswordInput, GradeSelector } from '../../components/form';

export default function Register({ onSignIn }) {
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
      onSignIn(data);
    } catch (err) {
      console.error('Register failed', err);
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenBackground>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
          <View style={styles.container}>
            <Text style={styles.heading}>Register</Text>

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
  errorText: {
    color: themeVariables.redColor || 'red',
    marginBottom: 12,
  },
  fullWidthButton: {
    width: '80%',
  },
});
