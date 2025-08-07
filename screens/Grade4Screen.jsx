import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import ButtonList from '../components/ButtonList';
import themeVariables from '../styles/theme';

const Grade4Screen = ({ onBack }) => (
  <View style={styles.container}>
    <Text style={styles.title}>Grade 4</Text>
    <Text style={styles.subtitle}>Content coming soon</Text>
    <ButtonList buttons={[{ title: 'Back', onPress: onBack }]} />
  </View>
);

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
    textAlign: 'center',
  },
});

export default Grade4Screen;