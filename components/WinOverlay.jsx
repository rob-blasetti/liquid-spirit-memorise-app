import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import ThemedButton from './ThemedButton';

const WinOverlay = ({ visible, onNextLevel, onHome }) => {
  if (!visible) return null;
  return (
    <View style={styles.winOverlay}>
      <View style={styles.winContainer}>
        <Text style={styles.winText}>Great Job!</Text>
        <ThemedButton title="Next Level" onPress={onNextLevel} style={styles.actionButton} />
        <ThemedButton title="Home" onPress={onHome} style={[styles.actionButton, { marginTop: 8 }]} />
      </View>
    </View>
  );
};

export default WinOverlay;

const styles = StyleSheet.create({
  winOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  winContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  winText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  actionButton: {
    width: 140,
  },
});

