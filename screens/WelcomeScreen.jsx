import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Button } from 'liquid-spirit-styleguide';

export default function WelcomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Welcome to Nuri</Text>
      <Button label="Register as Guest" onPress={() => navigation.navigate('GuestRegister1')} />
      <Button label="Maybe Later" onPress={() => navigation.navigate('GuestLogin')} />
      <Button label="Login with Liquid Spirit" onPress={() => navigation.navigate('LSLogin')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 },
  heading: { fontSize: 28, fontWeight: 'bold', marginBottom: 20 },
});