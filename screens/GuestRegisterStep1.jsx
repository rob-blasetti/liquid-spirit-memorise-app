import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Button } from 'liquid-spirit-styleguide';
import ScreenBackground from '../components/ScreenBackground';
import themeVariables from '../styles/theme';
import { UsernameInput, PasswordInput } from '../components/form';

export default function GuestRegisterStep1({ navigation }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleNext = () => {
    if (password !== confirmPassword) return;
    navigation.navigate('GuestRegister2', { username, password });
  };

  return (
    <ScreenBackground>
      <View style={styles.container}>
        <Text style={styles.heading}>Step 1: Create Account</Text>
        <UsernameInput
          value={username}
          onChangeText={setUsername}
          placeholder="Username"
        />
        <PasswordInput
          value={password}
          onChangeText={setPassword}
          placeholder="Password"
        />
        <PasswordInput
          label="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="Confirm Password"
        />
        <Button label="Next" onPress={handleNext} />
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
});
