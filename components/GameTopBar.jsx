import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import themeVariables from '../styles/theme';

const GameTopBar = ({ onBack }) => (
  <View style={styles.container}>
    <TouchableOpacity onPress={onBack} style={styles.iconButton}>
      <Ionicons
        name="chevron-back"
        size={24}
        color={themeVariables.primaryColor}
      />
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  // Position the back chevron in the top-left corner of the game screen
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    padding: 16,
    zIndex: 1,
  },
  iconButton: {
    padding: 4,
  },
});

export default GameTopBar;
