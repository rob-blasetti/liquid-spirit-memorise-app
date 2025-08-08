import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import themeVariables from '../styles/theme';
import { buildJigsawPath } from './PuzzlePath';

const PuzzleSlotSvg = ({ left, top, size, connectors }) => {
  // Slot should match the exact silhouette of the piece to give a perfect visual fit
  const knobRatio = 0.22;
  const pad = Math.round(size * knobRatio);
  const d = buildJigsawPath(size, connectors, knobRatio);
  return (
    <View style={[styles.container, { left, top, width: size, height: size }]}
      pointerEvents="none"
    >
      <Svg
        width={size + 2 * pad}
        height={size + 2 * pad}
        viewBox={`${-pad} ${-pad} ${size + 2 * pad} ${size + 2 * pad}`}
        style={{ position: 'absolute', left: -pad, top: -pad }}
      >
        <Path d={d} fill="none" stroke={themeVariables.primaryColor} strokeDasharray="6,4" strokeWidth={2} />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    overflow: 'visible',
  },
});

export default PuzzleSlotSvg;
