import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop, ClipPath, G } from 'react-native-svg';
import { buildJigsawPath } from './PuzzlePath';

const PuzzleSlotSvg = ({ left, top, size, connectors }) => {
  // Slot should match the exact silhouette of the piece to give a perfect visual fit
  const knobRatio = 0.22;
  const pad = Math.round(size * knobRatio);
  const d = buildJigsawPath(size, connectors, knobRatio);
  const gradId = useMemo(() => `slot_grad_${Math.random().toString(36).slice(2)}`, []);
  const clipId = useMemo(() => `slot_clip_${Math.random().toString(36).slice(2)}`, []);
  return (
    <View
      style={[styles.container, { left, top, width: size, height: size }, styles.shadow]}
      pointerEvents="none"
    >
      <Svg
        width={size + 2 * pad}
        height={size + 2 * pad}
        viewBox={`${-pad} ${-pad} ${size + 2 * pad} ${size + 2 * pad}`}
        style={{ position: 'absolute', left: -pad, top: -pad }}
      >
        <Defs>
          <LinearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor="#e0e0e0" />
            <Stop offset="100%" stopColor="#f9f9f9" />
          </LinearGradient>
          <ClipPath id={clipId}>
            <Path d={d} />
          </ClipPath>
        </Defs>
        <Path d={d} fill={`url(#${gradId})`} stroke="rgba(0,0,0,0.15)" strokeWidth={1} />
        <G clipPath={`url(#${clipId})`}>
          <Path d={d} fill="none" stroke="rgba(0,0,0,0.25)" strokeWidth={2} />
        </G>
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    overflow: 'visible',
  },
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
});

export default PuzzleSlotSvg;
