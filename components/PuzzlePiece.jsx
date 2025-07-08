import React from 'react';
import { Animated, View, Text, StyleSheet } from 'react-native';
import themeVariables from '../styles/theme';

const PuzzlePiece = ({ word, connectors, pan, panResponder, placed, size }) => {
  const pieceColor = placed ? themeVariables.primaryColor : themeVariables.whiteColor;
  const boardColor = themeVariables.neutralLight;
  const bump = size / 3;
  // Semicircle dimensions
  const semiW = bump;
  const semiH = bump / 2;
  const semiR = bump / 2;
  const { top, right, bottom, left } = connectors;

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
      {/* Top connector */}
      {top === 'convex' && (
        <View style={[styles.conn, {
          top: -semiH,
          left: size / 2 - semiW / 2,
          width: semiW,
          height: semiH,
          backgroundColor: pieceColor,
          borderLeftWidth: 1,
          borderRightWidth: 1,
          borderBottomWidth: 1,
          borderTopWidth: 0,
          borderBottomLeftRadius: semiR,
          borderBottomRightRadius: semiR,
        }]} />
      )}
      {top === 'concave' && (
        <View style={[styles.conn, {
          top: 0,
          left: size / 2 - semiW / 2,
          width: semiW,
          height: semiH,
          backgroundColor: boardColor,
          borderLeftWidth: 1,
          borderRightWidth: 1,
          borderTopWidth: 0,
          borderBottomWidth: 1,
          borderBottomLeftRadius: semiR,
          borderBottomRightRadius: semiR,
        }]} />
      )}

      {/* Bottom connector */}
      {bottom === 'convex' && (
        <View style={[styles.conn, {
          bottom: -semiH,
          left: size / 2 - semiW / 2,
          width: semiW,
          height: semiH,
          backgroundColor: pieceColor,
          borderLeftWidth: 1,
          borderRightWidth: 1,
          borderTopWidth: 1,
          borderBottomWidth: 0,
          borderTopLeftRadius: semiR,
          borderTopRightRadius: semiR,
        }]} />
      )}
      {bottom === 'concave' && (
        <View style={[styles.conn, {
          bottom: 0,
          left: size / 2 - semiW / 2,
          width: semiW,
          height: semiH,
          backgroundColor: boardColor,
          borderLeftWidth: 1,
          borderRightWidth: 1,
          borderTopWidth: 1,
          borderBottomWidth: 0,
          borderTopLeftRadius: semiR,
          borderTopRightRadius: semiR,
        }]} />
      )}

      {/* Left connector */}
      {left === 'convex' && (
        <View style={[styles.conn, {
          left: -semiH,
          top: size / 2 - semiW / 2,
          width: semiH,
          height: semiW,
          backgroundColor: pieceColor,
          borderTopWidth: 1,
          borderBottomWidth: 1,
          borderRightWidth: 1,
          borderLeftWidth: 0,
          borderTopRightRadius: semiR,
          borderBottomRightRadius: semiR,
        }]} />
      )}
      {left === 'concave' && (
        <View style={[styles.conn, {
          left: 0,
          top: size / 2 - semiW / 2,
          width: semiH,
          height: semiW,
          backgroundColor: boardColor,
          borderTopWidth: 1,
          borderBottomWidth: 1,
          borderLeftWidth: 0,
          borderRightWidth: 1,
          borderTopRightRadius: semiR,
          borderBottomRightRadius: semiR,
        }]} />
      )}

      {/* Right connector */}
      {right === 'convex' && (
        <View style={[styles.conn, {
          right: -semiH,
          top: size / 2 - semiW / 2,
          width: semiH,
          height: semiW,
          backgroundColor: pieceColor,
          borderTopWidth: 1,
          borderBottomWidth: 1,
          borderLeftWidth: 1,
          borderRightWidth: 0,
          borderTopLeftRadius: semiR,
          borderBottomLeftRadius: semiR,
        }]} />
      )}
      {right === 'concave' && (
        <View style={[styles.conn, {
          right: 0,
          top: size / 2 - semiW / 2,
          width: semiH,
          height: semiW,
          backgroundColor: boardColor,
          borderTopWidth: 1,
          borderBottomWidth: 1,
          borderLeftWidth: 1,
          borderRightWidth: 0,
          borderTopLeftRadius: semiR,
          borderBottomLeftRadius: semiR,
        }]} />
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
    borderWidth: 1,
    borderColor: themeVariables.primaryColor,
    borderStyle: 'solid',
  },
  conn: {
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