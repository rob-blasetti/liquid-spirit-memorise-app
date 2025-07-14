import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { Button } from 'liquid-spirit-styleguide';
import { registerGuest } from '../services/authService';

export default function GuestRegisterStep2({ route, navigation }) {
  const { username, password } = route.params;
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [age, setAge] = useState('');
  const [grade, setGrade] = useState('');

  const handleSubmit = async () => {
    try {
      const data = await registerGuest(username, password, firstName, lastName, Number(age), grade);
      route.params.onSignIn(data);
    } catch (err) {
      console.error('Registration failed', err);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Step 2: Profile Info</Text>
      <TextInput placeholder="First Name" value={firstName} onChangeText={setFirstName} style={styles.input} />
      <TextInput placeholder="Last Name" value={lastName} onChangeText={setLastName} style={styles.input} />
      <TextInput placeholder="Age" keyboardType="numeric" value={age} onChangeText={setAge} style={styles.input} />
      <TextInput placeholder="Grade" value={grade} onChangeText={setGrade} style={styles.input} />
      <Button label="Register" onPress={handleSubmit} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 },
  heading: { fontSize: 24, marginBottom: 16 },
  input: { width: '80%', padding: 10, marginBottom: 12, borderWidth: 1, borderRadius: 4 },
});