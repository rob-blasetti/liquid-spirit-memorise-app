import React from 'react';
import { View, Text, StyleSheet, Image, Linking } from 'react-native';
import ThemedButton from '../components/ThemedButton';
import { signInWithLiquidSpirit } from '../services/authService';
import splashLogo from '../assets/img/Nuri_Splash.png';

const StartScreen = ({ onSignIn, onGuest }) => {
  const handleSignIn = async () => {
    try {
      const user = await signInWithLiquidSpirit();
      onSignIn(user);
    } catch (e) {
      // handle error - for now we simply log
      console.error(e);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Nuri</Text>
      <Image source={splashLogo} style={styles.image} resizeMode="contain" />
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
