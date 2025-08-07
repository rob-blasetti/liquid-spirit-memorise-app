import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import ButtonList from '../components/ButtonList';
import themeVariables from '../styles/theme';

const Grade2Screen = ({ onBack, onSetSelect }) => (
  <View style={styles.container}>
    <Text style={styles.title}>Grade 2</Text>
    <ButtonList
      buttons={[
        { title: 'Set 1', onPress: () => onSetSelect(1) },
        { title: 'Set 2', onPress: () => onSetSelect(2) },
        { title: 'Set 3', onPress: () => onSetSelect(3) },
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

export default Grade2Screen;