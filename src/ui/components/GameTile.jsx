import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import theme from '../stylesheets/theme';

const GameTile = ({ title, icon, onPress }) => (
  <TouchableOpacity style={styles.tile} onPress={onPress}>
    <View style={styles.iconContainer}>
      <Ionicons name={icon} size={28} color={theme.primaryColor} />
    </View>
    <Text style={styles.tileText}>{title}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  tile: {
    backgroundColor: '#fff',
    width: '48%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.borderColor,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    backgroundColor: theme.neutralLight,
    borderRadius: 30,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: theme.borderColor,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileText: {
    fontSize: 16,
    textAlign: 'center',
  },
});

export default GameTile;
