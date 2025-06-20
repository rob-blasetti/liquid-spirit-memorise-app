import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import Avatar from '@flipxyz/react-native-boring-avatars';
import themeVariables from '../styles/theme';
import ThemedButton from '../components/ThemedButton';

const ProfileSetupScreen = ({ onSave }) => {
  const [name, setName] = useState('');
  const [grade, setGrade] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [avatarSeed, setAvatarSeed] = useState(Math.random().toString());
  const grades = ['1', '2', '3', '4'];

  const save = () => {
    if (!name) return;
    const gradeNum = parseInt(grade, 10);
    onSave({ name, grade: isNaN(gradeNum) ? '' : gradeNum });
  };

  return (
    <View style={styles.container}>
      {/* Avatar with Change button */}
      <View style={styles.avatarContainer}>
        <Avatar
          size={100}
          name={avatarSeed}
          variant="beam"
        />
        <TouchableOpacity
          style={styles.changeButton}
          onPress={() => setAvatarSeed(Math.random().toString())}
        >
          <Text style={styles.changeButtonText}>Change</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.title}>Create Profile</Text>
      {/* Name input */}
      <TextInput
        style={styles.input}
        placeholder="Enter your name"
        value={name}
        onChangeText={setName}
      />
      {/* Grade dropdown */}
      <TouchableOpacity
        style={styles.input}
        onPress={() => setShowDropdown(!showDropdown)}
      >
        <Text style={[styles.inputText, !grade && styles.placeholderText]}>  
          {grade ? `Grade ${grade}` : 'Select Grade'}
        </Text>
      </TouchableOpacity>
      {showDropdown && (
        <View style={styles.dropdown}>
          {grades.map((g, idx) => (
            <TouchableOpacity
              key={g}
              style={[styles.dropdownItem, idx < grades.length - 1 && styles.dropdownItemBorder]}
              onPress={() => { setGrade(g); setShowDropdown(false); }}
            >
              <Text style={styles.dropdownItemText}>Grade {g}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
      {/* Save button */}
      <View style={styles.buttonContainer}>
        <ThemedButton title="Save" onPress={save} disabled={!name} />
      </View>
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
  buttonContainer: {
    width: '80%',
    marginVertical: 16,
  },
  // Avatar container and change button
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 16,
    position: 'relative',
  },
  changeButton: {
    position: 'absolute',
    bottom: -10,
    backgroundColor: themeVariables.whiteColor,
    borderColor: themeVariables.primaryColor,
    borderWidth: 1,
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  changeButtonText: {
    color: themeVariables.primaryColor,
    fontSize: 14,
  },
  // Text inside custom dropdown
  inputText: {
    fontSize: 16,
    color: themeVariables.blackColor,
  },
  placeholderText: {
    color: themeVariables.darkGreyColor,
  },
  // Dropdown list styles
  dropdown: {
    width: '80%',
    backgroundColor: themeVariables.whiteColor,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    marginBottom: 16,
  },
  dropdownItem: {
    padding: 8,
  },
  dropdownItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  dropdownItemText: {
    fontSize: 16,
    color: themeVariables.blackColor,
  },
});

export default ProfileSetupScreen;
