import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { Button } from 'liquid-spirit-styleguide';
import Avatar from '@liquidspirit/react-native-boring-avatars';
import Ionicons from 'react-native-vector-icons/Ionicons';
import themeVariables from '../../styles/theme';
import ScreenBackground from '../../components/ScreenBackground';
import TopNav from '../../components/TopNav';
import { UsernameInput, GradeSelector } from '../../components/form';

export default function GuestLogin({ onSignIn, navigation }) {
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
    const user = {
      // Assign a unique ID for each guest based on avatarSeed
      _id: avatarSeed,
      username: displayName,
      name: displayName,
      avatarSeed,
      ...(avatarPhoto ? { avatar: avatarPhoto, profilePicture: avatarPhoto } : { profilePicture: null }),
      grade: gradeVal,
      guest: true,
      type: 'guest',
      totalPoints: 0,
      score: 0,
      linkedAccount: false,
      numberOfChildren: 0,
    };
    onSignIn({ user, authType: 'guest-login' });
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

  const handleBack = () => {
    if (navigation?.canGoBack()) {
      navigation.goBack();
    } else {
      navigation?.navigate?.('Welcome');
    }
  };

  return (
    <ScreenBackground>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.outer}>
          <TopNav title="Guest Login" onBack={handleBack} />
          <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
            <View style={styles.container}>
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
              <UsernameInput
                label="Display Name"
                value={displayName}
                onChangeText={setDisplayName}
                autoCapitalize="words"
                autoCorrect
              />
              <GradeSelector
                value={selectedGrade}
                onChange={setSelectedGrade}
                grades={grades}
                disabledGrades={disabledGrades}
              />
              <Button label="Log In" onPress={handleLogin} style={styles.fullWidthButton} />
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  outer: { flex: 1, width: '100%' },
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16, backgroundColor: 'transparent', width: '100%' },
  scrollContainer: { flexGrow: 1, justifyContent: 'center', alignItems: 'stretch', paddingVertical: 24 },
  heading: { fontSize: 24, marginBottom: 16, color: themeVariables.whiteColor },
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
  fullWidthButton: { width: '80%' },
});
