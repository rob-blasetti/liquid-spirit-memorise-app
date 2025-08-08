import React from 'react';
import { Animated, View, Text, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import themeVariables from '../styles/theme';
import { buildJigsawPath } from './PuzzlePath';

const PuzzlePieceSvg = ({ word, connectors, pan, panResponder, placed, size }) => {
  const pieceFill = placed ? themeVariables.primaryColor : themeVariables.whiteColor;
  const stroke = themeVariables.primaryColor;
  const knobRatio = 0.22;
  const pad = Math.round(size * knobRatio);
  const d = buildJigsawPath(size, connectors, knobRatio);

  return (
    <Animated.View
      {...(panResponder && panResponder.panHandlers)}
      style={[
        styles.container,
        { width: size, height: size },
        { transform: pan.getTranslateTransform() },
      ]}
      pointerEvents={placed ? 'none' : 'auto'}
    >
      <View style={styles.svgWrap}>
        <Svg
          width={size + 2 * pad}
          height={size + 2 * pad}
          viewBox={`${-pad} ${-pad} ${size + 2 * pad} ${size + 2 * pad}`}
          style={{ position: 'absolute', left: -pad, top: -pad }}
        >
          <Path d={d} fill={pieceFill} stroke={stroke} strokeWidth={1} />
        </Svg>
        <Text
          style={[
            styles.word,
            placed && styles.placedWord,
            { width: Math.round(size * 0.86) },
          ]}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.5}
          ellipsizeMode="tail"
        >
          {word}
        </Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    overflow: 'visible',
  },
  svgWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  word: {
    position: 'absolute',
    paddingHorizontal: 4,
    color: themeVariables.primaryColor,
    textAlign: 'center',
  },
  placedWord: {
    color: themeVariables.whiteColor,
  },
});

export default PuzzlePieceSvg;
