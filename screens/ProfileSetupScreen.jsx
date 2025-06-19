import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';

const ProfileSetupScreen = ({ onSave }) => {
  const [name, setName] = useState('');
  const [grade, setGrade] = useState('');

  const save = () => {
    if (!name) return;
    const gradeNum = parseInt(grade, 10);
    onSave({ name, grade: isNaN(gradeNum) ? '' : gradeNum });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Profile</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your name"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Enter grade (1-4)"
        value={grade}
        onChangeText={setGrade}
        keyboardType="numeric"
      />
      <Button title="Save" onPress={save} disabled={!name} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    marginBottom: 16,
  },
  input: {
    width: '80%',
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    marginBottom: 16,
    borderRadius: 4,
  },
});

export default ProfileSetupScreen;
