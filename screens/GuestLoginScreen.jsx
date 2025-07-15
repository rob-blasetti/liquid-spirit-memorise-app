import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { Button } from 'liquid-spirit-styleguide';
import Avatar from '@flipxyz/react-native-boring-avatars';
import Ionicons from 'react-native-vector-icons/Ionicons';
import themeVariables from '../styles/theme';

export default function GuestLoginScreen({ onSignIn }) {
  const [displayName, setDisplayName] = useState('');
  const [avatarSeed, setAvatarSeed] = useState(Math.random().toString());
  const [avatarPhoto, setAvatarPhoto] = useState(null);
  const grades = ['1', '2', '2b', '3', '4', '5'];
  const [selectedGrade, setSelectedGrade] = useState(grades[0]);
  // Temporarily disable higher grades
  const disabledGrades = ['3', '4', '5'];

  const handleLogin = () => {
    if (!displayName) return;
    // Convert grade to number for 1,2,3,4,5; preserve '2b'
    const gradeVal = selectedGrade === '2b' ? '2b' : parseInt(selectedGrade, 10);
    onSignIn({
      // Assign a unique ID for each guest based on avatarSeed
      _id: avatarSeed,
      name: displayName,
      avatarSeed,
      ...(avatarPhoto ? { avatar: avatarPhoto } : {}),
      grade: gradeVal,
      guest: true,
    });
  };

  const pickImage = () => {
    launchImageLibrary({ mediaType: 'photo', includeBase64: true }, response => {
      if (response.didCancel) return;
      if (response.errorCode) {
        console.warn('ImagePicker Error: ', response.errorMessage);
        return;
      }
      const asset = response.assets && response.assets[0];
      if (asset) {
        if (asset.base64) {
          const type = asset.type || 'image/jpeg';
          setAvatarPhoto(`data:${type};base64,${asset.base64}`);
        } else if (asset.uri) {
          setAvatarPhoto(asset.uri);
        }
      }
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Guest Login</Text>
      <TouchableOpacity onPress={pickImage} style={styles.avatarWrapper}>
        {avatarPhoto ? (
          <Image source={{ uri: avatarPhoto }} style={styles.avatar} />
        ) : (
          <Avatar size={100} name={avatarSeed} variant="beam" />
        )}
        <View style={styles.avatarOverlay}>
          <Ionicons name="camera" size={14} color={themeVariables.blackColor} />
        </View>
      </TouchableOpacity>
      <Button
        label="Change Avatar"
        onPress={() => {
          setAvatarPhoto(null);
          setAvatarSeed(Math.random().toString());
        }}
      />
      <TextInput
        placeholder="Display Name"
        value={displayName}
        onChangeText={setDisplayName}
        style={styles.input}
      />
      {/* Grade selector */}
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
      <Button label="Continue" onPress={handleLogin} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 },
  heading: { fontSize: 24, marginBottom: 16 },
  input: { width: '80%', padding: 10, marginBottom: 12, borderWidth: 1, borderRadius: 4 },
  avatarWrapper: { marginBottom: 12, position: 'relative' },
  avatar: { width: 100, height: 100, borderRadius: 50, marginBottom: 12 },
  avatarOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: themeVariables.whiteColor,
    borderRadius: 12,
    padding: 4,
  },
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
});
