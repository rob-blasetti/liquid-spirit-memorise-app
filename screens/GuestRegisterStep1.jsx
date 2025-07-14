import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { Button } from 'liquid-spirit-styleguide';

export default function GuestRegisterStep1({ navigation, route }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleNext = () => {
    if (password !== confirmPassword) return;
    navigation.navigate('GuestRegister2', { username, password });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Step 1: Create Account</Text>
      <TextInput placeholder="Username" value={username} onChangeText={setUsername} style={styles.input} />
      <TextInput placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} style={styles.input} />
      <TextInput placeholder="Confirm Password" secureTextEntry value={confirmPassword} onChangeText={setConfirmPassword} style={styles.input} />
      <Button label="Next" onPress={handleNext} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 },
  heading: { fontSize: 24, marginBottom: 16 },
  input: { width: '80%', padding: 10, marginBottom: 12, borderWidth: 1, borderRadius: 4 },
});