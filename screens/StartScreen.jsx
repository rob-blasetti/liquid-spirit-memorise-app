import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, Linking, TextInput } from 'react-native';
import ThemedButton from '../components/ThemedButton';
import { signInWithLiquidSpirit } from '../services/authService';
import { useUser } from '../contexts/UserContext';
import splashLogo from '../assets/img/Nuri_Splash.png';

const StartScreen = ({ onSignIn, onGuest }) => {
  // Local state for user credentials
  const [bahaiId, setBahaiId] = useState('');
  const [password, setPassword] = useState('');
  // Context setters for user data
  const { setUser, setClasses, setFamily, setChildren } = useUser();
  const handleSignIn = async () => {
    try {
      // Call auth service with credentials and log the response
      const loginDetails = await signInWithLiquidSpirit(bahaiId, password);
      console.log('signInWithLiquidSpirit response:', loginDetails);
      // Update context: user info, family, children, and aggregate classes from all children
      setUser(loginDetails);
      setFamily(loginDetails.family);
      if (loginDetails.children) {
        // store children list
        setChildren(loginDetails.children);
        // aggregate all classes arrays from each child into one list
        const allClasses = loginDetails.children.reduce((acc, child) => {
          if (Array.isArray(child.classes)) {
            acc.push(...child.classes);
          }
          return acc;
        }, []);
        console.log('classes to set in setClasses:', allClasses);
        setClasses(allClasses);
      } else {
        // no children: clear
        setChildren([]);
        setClasses([]);
      }
      // Proceed with sign-in callback, passing the user details
      onSignIn(loginDetails);
    } catch (e) {
      // Log any sign-in errors
      console.error('Sign in failed:', e);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Nuri</Text>
      <Image source={splashLogo} style={styles.image} resizeMode="contain" />
      {/* Credential inputs */}
      <TextInput
        placeholder="Bahai ID"
        style={styles.input}
        value={bahaiId}
        onChangeText={setBahaiId}
        autoCapitalize="none"
        keyboardType="default"
      />
      <TextInput
        placeholder="Password"
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoCapitalize="none"
      />
      <View style={styles.buttonContainer}>
        <ThemedButton
          title="Sign in with Liquid Spirit"
          onPress={handleSignIn}
        />
      </View>
      <View style={styles.buttonContainer}>
        <ThemedButton
          title="Continue as Guest"
          onPress={onGuest}
          style={styles.guestButton}
          textStyle={styles.guestText}
        />
      </View>
      <View style={styles.linksContainer}>
        <Text style={styles.link} onPress={() => Linking.openURL('https://example.com/privacy')}>Privacy</Text>
        <Text style={styles.link}> | </Text>
        <Text style={styles.link} onPress={() => Linking.openURL('https://example.com/terms')}>Terms of Use</Text>
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
  heading: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  image: {
    width: '80%',
    height: 200,
    marginBottom: 32,
  },
  // Input fields for Bahai ID and password
  input: {
    width: '80%',
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 8,
    marginVertical: 8,
  },
  buttonContainer: {
    width: '80%',
    marginVertical: 8,
  },
  guestButton: {
    backgroundColor: '#f3f3f3',
  },
  guestText: {
    color: '#312783',
  },
  linksContainer: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 32,
  },
  link: {
    color: '#312783',
    textDecorationLine: 'underline',
  },
});

export default StartScreen;
