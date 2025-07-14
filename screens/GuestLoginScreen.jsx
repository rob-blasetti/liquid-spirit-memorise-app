import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { Button } from 'liquid-spirit-styleguide';
import Avatar from '@flipxyz/react-native-boring-avatars';

export default function GuestLoginScreen({ route }) {
  const { onSignIn } = route.params;
  const [displayName, setDisplayName] = useState('');
  const [avatarSeed, setAvatarSeed] = useState(Math.random().toString());

  const handleLogin = () => {
    if (!displayName) return;
    onSignIn({ name: displayName, avatarSeed, guest: true });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Guest Login</Text>
      <Avatar size={100} name={avatarSeed} variant="beam" />
      <Button label="Change Avatar" onPress={() => setAvatarSeed(Math.random().toString())} />
      <TextInput
        placeholder="Display Name"
        value={displayName}
        onChangeText={setDisplayName}
        style={styles.input}
      />
      <Button label="Continue" onPress={handleLogin} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 },
  heading: { fontSize: 24, marginBottom: 16 },
  input: { width: '80%', padding: 10, marginBottom: 12, borderWidth: 1, borderRadius: 4 },
});
