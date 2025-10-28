import React from 'react';
import { View, StyleSheet } from 'react-native';
import ThemedButton from './ThemedButton';

const ButtonList = ({ buttons, containerStyle }) => (
  <>
    {buttons.map(({ title, onPress, key, ...rest }, index) => (
      <View key={key || index} style={[styles.buttonContainer, containerStyle]}>
        <ThemedButton title={title} onPress={onPress} {...rest} />
      </View>
    ))}
  </>
);

const styles = StyleSheet.create({
  buttonContainer: {
    width: '80%',
    marginTop: 16,
  },
});

export default ButtonList;
