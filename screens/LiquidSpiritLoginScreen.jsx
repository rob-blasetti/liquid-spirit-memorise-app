import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Button } from 'liquid-spirit-styleguide';
import { signInWithLiquidSpirit, verifyBahaiEmail } from '../services/authService';

export default function LiquidSpiritLoginScreen({ route }) {
  const { onSignIn } = route.params;
  const [bahaiId, setBahaiId] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [isVerifyMode, setIsVerifyMode] = useState(false);

  const handleLogin = async () => {
    try {
      let data;
      if (isVerifyMode) {
        data = await verifyBahaiEmail(bahaiId, email);
      } else {
        data = await signInWithLiquidSpirit(bahaiId, password);
      }
      onSignIn(data);
    } catch (err) {
      console.error('Liquid Spirit login failed', err);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Liquid Spirit Login</Text>
      <TouchableOpacity onPress={() => setIsVerifyMode(!isVerifyMode)}>
        <Text style={styles.link}>
          {isVerifyMode
            ? 'Back to password login'
            : "Verify email for Bahá'í ID"}
        </Text>
      </TouchableOpacity>
      <TextInput placeholder="Bahá'í ID" value={bahaiId} onChangeText={setBahaiId} style={styles.input} />
      {isVerifyMode ? (
        <TextInput
          placeholder="Email associated with your Bahá'í ID"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
        />
      ) : (
        <TextInput
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          style={styles.input}
        />
      )}
      <Button label={isVerifyMode ? 'Verify Email' : 'Login'} onPress={handleLogin} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 },
  heading: { fontSize: 24, marginBottom: 16 },
  link: { color: '#007AFF', marginBottom: 12, textDecorationLine: 'underline' },
  input: { width: '80%', padding: 10, marginBottom: 12, borderWidth: 1, borderRadius: 4 },
});