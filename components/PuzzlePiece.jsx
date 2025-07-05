import React from 'react';
import { Animated, View, Text, StyleSheet } from 'react-native';
import themeVariables from '../styles/theme';

const PuzzlePiece = ({
  word,
  connectors,
  pan,
  panResponder,
  placed,
  size,
}) => {
  const pieceColor = placed ? themeVariables.primaryColor : themeVariables.whiteColor;
  const bump = size / 3;
  const { top, right, bottom, left } = connectors;

  const bumpProps = {
    width: bump,
    height: bump,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: themeVariables.primaryColor,
    borderStyle: 'dashed',
    backgroundColor: pieceColor,
  };

  const cutProps = {
    width: bump,
    height: bump,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: themeVariables.primaryColor,
    borderStyle: 'dashed',
    backgroundColor: pieceColor,
  };

  return (
    <Animated.View
      {...(panResponder && panResponder.panHandlers)}
      style={[
        styles.piece,
        {
          width: size,
          height: size,
          backgroundColor: pieceColor,
          transform: pan.getTranslateTransform(),
        },
      ]}
    >
      {top === 'convex' && (
        <View style={[styles.bump, bumpProps, { top: -bump / 2, left: size / 2 - bump / 2 }]} />
      )}
      {bottom === 'convex' && (
        <View style={[styles.bump, bumpProps, { bottom: -bump / 2, left: size / 2 - bump / 2 }]} />
      )}
      {left === 'convex' && (
        <View style={[styles.bump, bumpProps, { left: -bump / 2, top: size / 2 - bump / 2 }]} />
      )}
      {right === 'convex' && (
        <View style={[styles.bump, bumpProps, { right: -bump / 2, top: size / 2 - bump / 2 }]} />
      )}
      {top === 'concave' && (
        <View style={[styles.cut, cutProps, { top: bump / 2, left: size / 2 - bump / 2 }]} />
      )}
      {bottom === 'concave' && (
        <View style={[styles.cut, cutProps, { bottom: bump / 2, left: size / 2 - bump / 2 }]} />
      )}
      {left === 'concave' && (
        <View style={[styles.cut, cutProps, { left: bump / 2, top: size / 2 - bump / 2 }]} />
      )}
      {right === 'concave' && (
        <View style={[styles.cut, cutProps, { right: bump / 2, top: size / 2 - bump / 2 }]} />
      )}
      <Text style={[styles.word, placed && styles.placedWord]}>{word}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  piece: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: themeVariables.primaryColor,
    borderStyle: 'dashed',
  },
  bump: {
    position: 'absolute',
  },
  cut: {
    position: 'absolute',
  },
  word: {
    fontSize: 14,
    padding: 4,
    color: themeVariables.primaryColor,
    textAlign: 'center',
  },
  placedWord: {
    color: themeVariables.whiteColor,
  },
});

export default PuzzlePiece;
