import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import theme from '../styles/theme';

const Chip = ({ icon, text, color = theme.whiteColor, bg = 'rgba(255,255,255,0.15)', style }) => {
  return (
    <View style={[styles.chip, { backgroundColor: bg }, style]}>
      {icon ? <Ionicons name={icon} size={14} color={color} style={styles.icon} /> : null}
      <Text style={[styles.text, { color }]} numberOfLines={1}>
        {text}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  icon: {
    marginRight: 6,
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
});

export default Chip;

