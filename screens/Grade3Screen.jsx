import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import ThemedButton from '../components/ThemedButton';
import themeVariables from '../styles/theme';

const Grade3Screen = ({ onBack }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Grade 3</Text>
      <Text style={styles.subtitle}>Content coming soon</Text>
      <View style={styles.buttonContainer}>
        <ThemedButton title="Back" onPress={onBack} />
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
    color: themeVariables.whiteColor,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 24,
    color: themeVariables.greyColor,
  },
  buttonContainer: {
    width: '80%',
    marginTop: 16,
  },
});

export default Grade3Screen;