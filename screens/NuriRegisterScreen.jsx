import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Button } from 'liquid-spirit-styleguide';
import { registerNuriUser } from '../services/authService';
import themeVariables from '../styles/theme';
import ScreenBackground from '../components/ScreenBackground';

export default function NuriRegisterScreen({ onSignIn }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [grade, setGrade] = useState('');
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

        <Text style={styles.label}>Username</Text>
        <TextInput
          value={username}
          onChangeText={setUsername}
          style={styles.input}
          autoCapitalize="none"
          autoCorrect={false}
        />

        <Text style={styles.label}>Email</Text>
        <TextInput
          keyboardType="email-address"
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
        <Text style={styles.gradeLabel}>Grade</Text>
        <View style={styles.gradeRow}>
          {grades.map(g => {
            const disabled = disabledGrades.includes(g);
            const active = selectedGrade === g;
            return (
              <TouchableOpacity
                key={g}
                disabled={disabled}
                style={[
                  styles.gradeButton,
                  active && styles.gradeButtonActive,
                  disabled && styles.gradeButtonDisabled
                ]}
                onPress={() => !disabled && setSelectedGrade(g)}
              >
                <Text
                  style={[
                    styles.gradeText,
                    active && styles.gradeTextActive,
                    disabled && styles.gradeTextDisabled
                  ]}
                >
                  {g}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
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
  gradeLabel: {
    alignSelf: 'flex-start',
    marginLeft: '10%',
    fontSize: 16,
    marginTop: 12,
    marginBottom: 4,
    color: themeVariables.whiteColor,
  },
  gradeRow: {
    flexDirection: 'row',
    width: '80%',
    borderWidth: 1,
    borderColor: themeVariables.primaryColor,
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 16,
    backgroundColor: themeVariables.whiteColor,
  },
  gradeButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  gradeButtonActive: {
    backgroundColor: themeVariables.primaryColor,
  },
  gradeText: {
    fontSize: 16,
    color: themeVariables.primaryColor,
  },
  gradeTextActive: {
    color: themeVariables.whiteColor,
  },
  gradeButtonDisabled: {
    backgroundColor: themeVariables.buttonDisabledBg,
  },
  gradeTextDisabled: {
    color: themeVariables.buttonDisabledText,
  },
  errorText: {
    color: themeVariables.redColor || 'red',
    marginBottom: 12,
  },
  fullWidthButton: {
    width: '80%',
  },
});
