import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons';
import themeVariables from '../styles/theme';

const GameTopBar = ({ onBack }) => (
  <View style={styles.container}>
    <TouchableOpacity onPress={onBack} style={styles.iconButton}>
      <FontAwesomeIcon
        icon={faChevronLeft}
        size={24}
        color={themeVariables.primaryColor}
      />
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  iconButton: {
    padding: 4,
  },
});

export default GameTopBar;
