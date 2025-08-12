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
        {/* Soft filled slot so neighboring insets visually interlock */}
        <Path d={d} fill="rgba(255,255,255,0.18)" stroke={themeVariables.primaryColor} strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" />
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
