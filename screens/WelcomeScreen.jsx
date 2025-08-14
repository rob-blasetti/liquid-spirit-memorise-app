import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Button } from 'liquid-spirit-styleguide';
import themeVariables from '../styles/theme';
import lsLogo from '../assets/img/LS-Logo.png';
import nuriLogoWhite from '../assets/img/Nuri_Logo_White.png';
import ScreenBackground from '../components/ScreenBackground';

export default function WelcomeScreen({ navigation }) {
  return (
    <ScreenBackground>
      <View style={styles.container}>
        <Image source={nuriLogoWhite} style={styles.nuriLogo} />

        <View style={styles.buttonRow}>
          <Button
            label="Register"
            onPress={() => navigation.navigate('NuriRegister')}
            style={styles.smallButton}
            textStyle={styles.whiteLabel}
          />
          <Button
            label="Login"
            onPress={() => navigation.navigate('NuriLogin')}
            style={styles.smallButton}
            textStyle={styles.whiteLabel}
          />
        </View>

        <TouchableOpacity
          style={styles.fullWidthButton}
          onPress={() => navigation.navigate('LSLogin')}
          activeOpacity={0.8}
        >
          <View style={styles.lsInner}>
            <Text style={[styles.whiteLabel, styles.lsLabel]}>Continue With</Text>
            <Image source={lsLogo} style={styles.lsLogoLarge} />
          </View>
        </TouchableOpacity>

        <Button
          label="Continue as Guest"
          onPress={() => navigation.navigate('GuestLogin')}
          style={[styles.fullWidthButton, styles.guestBackground]}
          textStyle={styles.guestLabel}
        />
      </View>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent', // background comes from ScreenBackground
    justifyContent: 'flex-start',
    paddingHorizontal: 20,
  },

  nuriLogo: {
    width: '112%',
    height: 400,
    alignSelf: 'center',
    resizeMode: 'contain',
    marginTop: -20,
    marginBottom: 10,
    marginLeft: 10,
  },

  fullWidthButton: {
    width: '100%',
    height: 50,
    borderRadius: 25,
    marginBottom: 20,
    justifyContent: 'center',
  },

  smallButton: {
    width: '48%',
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderWidth: 2,
    borderColor: themeVariables.whiteColor,
  },

  buttonRow: {
    flexDirection: 'row',
    width: '100%',
    marginBottom: 40,
    marginTop: 40,
    justifyContent: 'space-between',
  },

  guestBackground: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderWidth: 2,
    borderColor: themeVariables.whiteColor,
  },

  whiteLabel: {
    color: themeVariables.blackColor,
  },

  guestLabel: {
    color: themeVariables.blackColor,
  },

  lsInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: themeVariables.whiteColor,
    borderRadius: 25,
    width: '100%',
    height: 50,
    paddingHorizontal: 16,
    // Diffuse drop shadow for emphasis
    shadowColor: themeVariables.blackColor,
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.4,
    shadowRadius: 30,
    elevation: 18,
  },

  lsLogoLarge: {
    width: 84,
    height: 84,
    marginLeft: 12,
    resizeMode: 'contain',
  },

  lsLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
});
