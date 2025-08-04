import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { Button } from 'liquid-spirit-styleguide';
import { signInWithLiquidSpirit } from '../services/authService';
import { loadCredentials, saveCredentials } from '../services/credentialService';

export default function LiquidSpiritLoginScreen({ onSignIn }) {
  const [bahaiId, setBahaiId] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');

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
      const data = await signInWithLiquidSpirit(bahaiId, email, password);
      onSignIn(data);
    } catch (err) {
      console.error('Liquid Spirit login failed', err);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Liquid Spirit Login</Text>
      <TextInput
        placeholder="Bahá'í ID"
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
        placeholder="Password or Token (optional)"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={styles.input}
      />
      <Button label="Authenticate" onPress={handleLogin} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 },
  heading: { fontSize: 24, marginBottom: 16 },
  input: { width: '80%', padding: 10, marginBottom: 12, borderWidth: 1, borderRadius: 4 },
});
