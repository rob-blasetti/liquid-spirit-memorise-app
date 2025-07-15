import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Button } from 'liquid-spirit-styleguide';
import themeVariables from '../styles/theme';
import lsLogo from '../assets/img/LS-Logo.png';

export default function WelcomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Nuri</Text>
      <View style={styles.buttonRow}>
        <Button
          label="Register"
          onPress={() => navigation.navigate('NuriRegister')}
          style={[styles.smallButton]}
          textStyle={styles.whiteLabel}
        />
        <Button
          label="Login"
          onPress={() => navigation.navigate('NuriLogin')}
          style={[styles.smallButton]}
          textStyle={styles.whiteLabel}
        />
      </View>

      {/* Custom LS Sign-In Button to embed logo */}
      <TouchableOpacity
        style={[styles.fullWidthButton]}
        onPress={() => navigation.navigate('LSLogin')}
        activeOpacity={0.8}
      >
        <View style={styles.lsInner}>
          <Image source={lsLogo} style={styles.lsLogoLarge} />
          <Text style={[styles.whiteLabel, styles.lsLabel]}>Continue With Liquid Spirit</Text>
        </View>
      </TouchableOpacity>
      <Button
        label="Continue as Guest"
        onPress={() => navigation.navigate('GuestLogin')}
        style={[styles.fullWidthButton, styles.guestBackground]}
        textStyle={styles.guestLabel}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: themeVariables.primaryColor,
    justifyContent: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  heading: {
    fontSize: 32,
    fontWeight: 'bold',
    color: themeVariables.whiteColor,
    textAlign: 'center',
    marginBottom: 80,
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
    backgroundColor: themeVariables.whiteColor,
  },
  buttonRow: {
    flexDirection: 'row',
    width: '100%',
    marginBottom: 40,
    marginTop: 240,
    justifyContent: 'space-between',
  },
  guestBackground: {
    backgroundColor: themeVariables.whiteColor,
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
    borderRadius: 20
  },
  lsLogoLarge: {
    width: 36,
    height: 36,
    marginRight: 12,
    resizeMode: 'contain',
  },
  lsLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
});
