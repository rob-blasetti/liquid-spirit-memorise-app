import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import ButtonList from '../components/ButtonList';
import themeVariables from '../styles/theme';

const Grade2bScreen = ({ onBack, onSetSelect }) => (
  <View style={styles.container}>
    <Text style={styles.title}>Grade 2 - Book 3-2</Text>
    <ButtonList
      buttons={[
        { title: 'Set 4', onPress: () => onSetSelect(4) },
        { title: 'Set 5', onPress: () => onSetSelect(5) },
        { title: 'Set 6', onPress: () => onSetSelect(6) },
        { title: 'Set 7', onPress: () => onSetSelect(7) },
        { title: 'Back', onPress: onBack },
      ]}
    />
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
});

export default Grade2bScreen;
