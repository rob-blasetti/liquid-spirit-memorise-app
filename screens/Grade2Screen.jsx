import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

const Grade2Screen = ({ onBack, onSetSelect }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Grade 2</Text>
      <View style={styles.buttonContainer}>
        <Button title="Set 1" onPress={() => onSetSelect(1)} />
      </View>
      <View style={styles.buttonContainer}>
        <Button title="Set 2" onPress={() => onSetSelect(2)} />
      </View>
      <View style={styles.buttonContainer}>
        <Button title="Set 3" onPress={() => onSetSelect(3)} />
      </View>
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
  buttonContainer: {
    width: '80%',
    marginTop: 16,
  },
});

export default Grade2Screen;