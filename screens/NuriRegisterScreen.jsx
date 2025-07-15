import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Button } from 'liquid-spirit-styleguide';
import { registerNuriUser } from '../services/authService';
import themeVariables from '../styles/theme';

export default function NuriRegisterScreen({ onSignIn }) {
  const [username, setUsername] = useState('');
  const [bahaiId, setBahaiId] = useState('');
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
      const data = await registerNuriUser(username, email, password, bahaiId, selectedGrade);
      onSignIn(data);
    } catch (err) {
      console.error('Register failed', err);
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Register</Text>
      <TextInput
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        style={styles.input}
      />
      <TextInput
        placeholder="Bahá'í ID (optional)"
        value={bahaiId}
        onChangeText={setBahaiId}
        style={styles.input}
      />
      <TextInput
        placeholder="Email"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
      />
      <TextInput
        placeholder="Password"
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
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 },
  heading: { fontSize: 24, marginBottom: 16 },
  input: { width: '80%', padding: 10, marginBottom: 12, borderWidth: 1, borderRadius: 4 },
    gradeLabel: {
    alignSelf: 'flex-start',
    marginLeft: '10%',
    fontSize: 16,
    marginTop: 12,
    marginBottom: 4,
    color: themeVariables.blackColor,
  },
  gradeRow: {
    flexDirection: 'row',
    width: '80%',
    borderWidth: 1,
    borderColor: themeVariables.primaryColor,
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 16,
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
});
