import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

const Grade4Screen = ({ onBack }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Grade 4</Text>
      <Text style={styles.subtitle}>Content coming soon</Text>
      <View style={styles.buttonContainer}>
        <Button title="Back" onPress={onBack} />
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
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 24,
    color: '#666',
    textAlign: 'center',
  },
  buttonContainer: {
    width: '80%',
    marginTop: 16,
  },
});

export default Grade4Screen;